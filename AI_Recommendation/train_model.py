import argparse
import csv
import os
import pickle
import random
import sys
import time
from collections import defaultdict
from datetime import datetime

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from config import DEFAULT_SVD_CONFIG, MODEL_DIR, MODEL_PATH, MOVIES_CSV_PATH, RATINGS_CSV_PATH


def load_ratings_csv(csv_path: str):
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Không tìm thấy dữ liệu đánh giá tại: {csv_path}")
    records = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            uid = str(row["user_id"]).strip()
            mid = str(row["movie_id"]).strip()
            rating = float(row["rating"])
            if 1.0 <= rating <= 5.0 and uid and mid:
                records.append((uid, mid, rating))
    if len(records) < 2:
        raise ValueError("Cần ít nhất 2 lượt đánh giá hợp lệ (1–5 sao) để huấn luyện mô hình.")
    return records


def load_movies_meta(csv_path: str):
    meta = {}
    if not os.path.exists(csv_path):
        return meta
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            meta[str(row["movie_id"]).strip()] = {
                "movie_id": str(row["movie_id"]).strip(),
                "title": row.get("title", ""),
                "genres": row.get("genres", ""),
                "genres_en": row.get("genres_en", ""),
                "poster_url": row.get("poster_url", ""),
                "status": row.get("status", "Đang chiếu"),
            }
    return meta


def compute_movie_stats(records):
    by_movie = defaultdict(list)
    user_rated = defaultdict(dict)
    for uid, mid, r in records:
        by_movie[mid].append(r)
        user_rated[uid][mid] = r

    stats = {}
    for mid, rs in by_movie.items():
        stats[mid] = {
            "avg_rating": round(sum(rs) / len(rs), 3),
            "rating_count": len(rs),
        }
    return stats, dict(user_rated)


def train_pure_python_svd(train_records, n_factors, n_epochs, lr_all, reg_all, random_state):
    rng = random.Random(random_state)
    mu = sum(r for _, _, r in train_records) / max(len(train_records), 1)
    users = sorted({u for u, _, _ in train_records})
    movies = sorted({m for _, m, _ in train_records})

    b_u = {u: 0.0 for u in users}
    b_i = {m: 0.0 for m in movies}
    P = {u: [rng.gauss(0.0, 0.1) for _ in range(n_factors)] for u in users}
    Q = {m: [rng.gauss(0.0, 0.1) for _ in range(n_factors)] for m in movies}

    shuffled = list(train_records)
    for _ in range(n_epochs):
        rng.shuffle(shuffled)
        for u, m, r in shuffled:
            pu = P[u]
            qi = Q[m]
            dot_val = sum(pu[k] * qi[k] for k in range(n_factors))
            pred = mu + b_u[u] + b_i[m] + dot_val
            err = r - pred

            b_u[u] += lr_all * (err - reg_all * b_u[u])
            b_i[m] += lr_all * (err - reg_all * b_i[m])

            for k in range(n_factors):
                puf = pu[k]
                qif = qi[k]
                pu[k] += lr_all * (err * qif - reg_all * puf)
                qi[k] += lr_all * (err * puf - reg_all * qif)

    return {
        "mu": mu,
        "b_u": b_u,
        "b_i": b_i,
        "P": P,
        "Q": Q,
        "trained_users": set(users),
        "trained_movies": set(movies),
    }


def train_pipeline(
    csv_path: str = RATINGS_CSV_PATH,
    model_path: str = MODEL_PATH,
    n_factors: int = DEFAULT_SVD_CONFIG["n_factors"],
    n_epochs: int = DEFAULT_SVD_CONFIG["n_epochs"],
    lr_all: float = DEFAULT_SVD_CONFIG["lr_all"],
    reg_all: float = DEFAULT_SVD_CONFIG["reg_all"],
    test_size: float = DEFAULT_SVD_CONFIG["test_size"],
    random_state: int = DEFAULT_SVD_CONFIG["random_state"],
    verbose: bool = True,
):
    records = load_ratings_csv(csv_path)
    movies_meta = load_movies_meta(MOVIES_CSV_PATH)
    movie_stats, user_rated = compute_movie_stats(records)

    unique_users = sorted({u for u, _, _ in records})
    unique_movies = sorted({m for _, m, _ in records})

    start_time = time.perf_counter()

    try:
        import pandas as pd
        from surprise import Dataset, Reader, SVD
        from surprise.model_selection import train_test_split

        df = pd.DataFrame(records, columns=["user_id", "movie_id", "rating"])
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(df[["user_id", "movie_id", "rating"]], reader)
        trainset, testset = train_test_split(data, test_size=test_size, random_state=random_state)

        algo = SVD(
            n_factors=n_factors,
            n_epochs=n_epochs,
            lr_all=lr_all,
            reg_all=reg_all,
            random_state=random_state,
        )
        algo.fit(trainset)

        trained_users = {trainset.to_raw_uid(inner_u) for inner_u in trainset.all_users()}
        trained_movies = {trainset.to_raw_iid(inner_i) for inner_i in trainset.all_items()}

        backend = "surprise_svd"
        model_payload = {
            "backend": backend,
            "algo": algo,
            "testset": testset,
            "train_count": trainset.n_ratings,
            "test_count": len(testset),
            "trained_users": trained_users,
            "trained_movies": trained_movies,
        }
    except ImportError:
        rng = random.Random(random_state)
        shuffled = list(records)
        rng.shuffle(shuffled)
        n_test = max(1, int(round(len(shuffled) * test_size)))
        testset = shuffled[:n_test]
        train_records = shuffled[n_test:] if len(shuffled) > n_test else shuffled

        weights = train_pure_python_svd(
            train_records,
            n_factors=n_factors,
            n_epochs=n_epochs,
            lr_all=lr_all,
            reg_all=reg_all,
            random_state=random_state,
        )
        backend = "pure_python_svd"
        model_payload = {
            "backend": backend,
            "weights": weights,
            "testset": testset,
            "train_count": len(train_records),
            "test_count": len(testset),
            "trained_users": weights["trained_users"],
            "trained_movies": weights["trained_movies"],
        }

    elapsed_sec = round(time.perf_counter() - start_time, 4)

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    bundle = {
        **model_payload,
        "config": {
            "n_factors": n_factors,
            "n_epochs": n_epochs,
            "lr_all": lr_all,
            "reg_all": reg_all,
            "test_size": test_size,
            "random_state": random_state,
        },
        "stats": {
            "n_users": len(unique_users),
            "n_movies": len(unique_movies),
            "n_ratings": len(records),
            "train_count": model_payload["train_count"],
            "test_count": model_payload["test_count"],
            "train_time_sec": elapsed_sec,
            "trained_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "ratings_csv": os.path.basename(csv_path),
        },
        "movie_stats": movie_stats,
        "user_rated": user_rated,
        "movies_meta": movies_meta,
    }

    with open(model_path, "wb") as f:
        pickle.dump(bundle, f)

    if verbose:
        print("=" * 60)
        print("HUẤN LUYỆN MÔ HÌNH GỢI Ý PHIM (COLLABORATIVE FILTERING - SVD)")
        print("=" * 60)
        print(f"- Thư viện / Engine : {backend}")
        print(f"- File dữ liệu      : {csv_path}")
        print(f"- Số user           : {len(unique_users)}")
        print(f"- Số phim           : {len(unique_movies)}")
        print(f"- Số lượt đánh giá  : {len(records)} (Train: {model_payload['train_count']} | Test: {model_payload['test_count']})")
        print(f"- Tham số SVD       : n_factors={n_factors}, n_epochs={n_epochs}, lr_all={lr_all}, reg_all={reg_all}")
        print(f"- Thời gian train   : {elapsed_sec:.4f} giây")
        print(f"- Đã lưu model tại  : {model_path}")
        print("=" * 60)

    return bundle


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(description="Huấn luyện offline mô hình SVD và lưu vào model/svd_model.pkl")
    parser.add_argument("--csv", default=RATINGS_CSV_PATH, help="Đường dẫn file ratings.csv")
    parser.add_argument("--out", default=MODEL_PATH, help="Đường dẫn lưu file model (.pkl)")
    parser.add_argument("--n-factors", type=int, default=DEFAULT_SVD_CONFIG["n_factors"], help="Số nhân tố ẩn (factors)")
    parser.add_argument("--n-epochs", type=int, default=DEFAULT_SVD_CONFIG["n_epochs"], help="Số vòng lặp (epochs)")
    parser.add_argument("--lr-all", type=float, default=DEFAULT_SVD_CONFIG["lr_all"], help="Tốc độ học (learning rate)")
    parser.add_argument("--reg-all", type=float, default=DEFAULT_SVD_CONFIG["reg_all"], help="Hệ số điều chuẩn (regularization)")
    parser.add_argument("--test-size", type=float, default=DEFAULT_SVD_CONFIG["test_size"], help="Tỷ lệ tập Test")
    parser.add_argument("--seed", type=int, default=DEFAULT_SVD_CONFIG["random_state"], help="Random seed")
    parser.add_argument("--json", action="store_true", help="In kết quả dạng JSON")
    args = parser.parse_args()

    os.makedirs(MODEL_DIR, exist_ok=True)
    result = train_pipeline(
        csv_path=args.csv,
        model_path=args.out,
        n_factors=args.n_factors,
        n_epochs=args.n_epochs,
        lr_all=args.lr_all,
        reg_all=args.reg_all,
        test_size=args.test_size,
        random_state=args.seed,
        verbose=not args.json,
    )
    if args.json:
        import json
        print(json.dumps({
            "ok": True,
            "backend": result["backend"],
            "config": result["config"],
            "stats": result["stats"],
            "model_path": args.out,
        }, ensure_ascii=False))
