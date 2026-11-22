import argparse
import csv
import json
import os
import pickle
import sqlite3
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from config import DEFAULT_SVD_CONFIG, MODEL_PATH, MOVIES_CSV_PATH, RATINGS_CSV_PATH, SQLITE_DB_PATH, USER_ALIAS_MAP


def load_movies_catalog(csv_path: str = MOVIES_CSV_PATH) -> dict:
    catalog = {}
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                mid = str(row["movie_id"]).strip()
                catalog[mid] = {
                    "movie_id": mid,
                    "title": row.get("title", mid),
                    "genres": row.get("genres", ""),
                    "genres_en": row.get("genres_en", ""),
                    "poster_url": row.get("poster_url", ""),
                    "status": row.get("status", "Đang chiếu"),
                }
    return catalog


def load_csv_popularity(csv_path: str = RATINGS_CSV_PATH):
    movie_ratings = {}
    user_ratings = {}
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                uid = str(row["user_id"]).strip()
                mid = str(row["movie_id"]).strip()
                r = float(row["rating"])
                movie_ratings.setdefault(mid, []).append(r)
                user_ratings.setdefault(uid, {})[mid] = r
    stats = {
        mid: {
            "avg_rating": round(sum(rs) / len(rs), 3),
            "rating_count": len(rs),
        }
        for mid, rs in movie_ratings.items()
    }
    return stats, user_ratings


def load_live_user_activity_from_sqlite(resolved_uid: str):
    """
    Chỉ đọc phim user vừa xem / đánh giá thêm trên website từ SQLite để:
    1) Loại trừ phim user vừa xem xong hoặc vừa đánh giá trên web
    2) Hỗ trợ gợi ý thêm cùng thể loại nếu user chưa kịp train lại model
    (KHÔNG train lại model tại bước online recommendation).
    """
    if not resolved_uid or resolved_uid == "guest" or not os.path.exists(SQLITE_DB_PATH):
        return set(), {}

    watched_or_rated = set()
    liked_genres = {}
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        u_row = cur.execute(
            "SELECT id FROM users WHERE web_user_id = ? OR CAST(id AS TEXT) = ?",
            (resolved_uid, resolved_uid),
        ).fetchone()
        if not u_row:
            conn.close()
            return watched_or_rated, liked_genres
        sql_uid = u_row["id"]

        for row in cur.execute(
            """
            SELECT m.web_film_id, m.genres
            FROM watch_history wh
            JOIN movies m ON m.id = wh.movie_id
            WHERE wh.user_id = ?
            """,
            (sql_uid,),
        ).fetchall():
            if row["web_film_id"]:
                watched_or_rated.add(row["web_film_id"])
            for g in str(row["genres"] or "").split("|"):
                if g.strip():
                    liked_genres[g.strip()] = liked_genres.get(g.strip(), 0.0) + 1.0

        for row in cur.execute(
            """
            SELECT m.web_film_id, m.genres, wr.rating
            FROM website_ratings wr
            JOIN movies m ON m.id = wr.movie_id
            WHERE wr.user_id = ?
            """,
            (sql_uid,),
        ).fetchall():
            if row["web_film_id"]:
                watched_or_rated.add(row["web_film_id"])
            if float(row["rating"]) >= 4.0:
                for g in str(row["genres"] or "").split("|"):
                    if g.strip():
                        liked_genres[g.strip()] = liked_genres.get(g.strip(), 0.0) + 1.2

        conn.close()
    except Exception:
        return set(), {}

    return watched_or_rated, liked_genres


def normalize_user_id(user_id: str) -> str:
    raw = str(user_id or "guest").strip()
    if not raw:
        return "guest"
    return USER_ALIAS_MAP.get(raw, raw)


def load_saved_model(model_path: str = MODEL_PATH):
    if not os.path.exists(model_path):
        return None
    with open(model_path, "rb") as f:
        return pickle.load(f)


def predict_single_score(model_bundle: dict, uid: str, mid: str) -> float:
    backend = model_bundle["backend"]
    if backend == "surprise_svd":
        est = model_bundle["algo"].predict(uid, mid).est
        return max(1.0, min(5.0, float(est)))

    weights = model_bundle["weights"]
    mu = weights["mu"]
    bu = weights["b_u"].get(uid, 0.0)
    bi = weights["b_i"].get(mid, 0.0)
    pu = weights["P"].get(uid)
    qi = weights["Q"].get(mid)
    dot_val = sum(a * b for a, b in zip(pu, qi)) if (pu is not None and qi is not None) else 0.0
    return max(1.0, min(5.0, mu + bu + bi + dot_val))


def recommend_top_n(
    user_id: str,
    top_n: int = DEFAULT_SVD_CONFIG["top_n"],
    model_bundle: dict = None,
    model_path: str = MODEL_PATH,
) -> dict:
    """
    ONLINE RECOMMENDATION:
    - Chỉ tải model đã lưu (tuyệt đối không train lại).
    - Xử lý đầy đủ 4 kịch bản:
      1. Người dùng đã có lịch sử đánh giá -> dự đoán bằng SVD, loại trừ phim đã đánh giá/xem, trả Top N.
      2. Người dùng mới (Cold-start) hoặc thiếu dữ liệu -> fallback phim nổi bật / điểm trung bình cao nhất (+ khớp thể loại nếu vừa xem).
      3. Phim mới chưa từng có trong tập train -> dự đoán theo global mean + bias/thể loại để không bỏ sót phim mới.
      4. Model chưa tồn tại -> fallback danh sách phim nổi bật từ movies.csv & ratings.csv.
    """
    resolved_uid = normalize_user_id(user_id)
    if model_bundle is None:
        model_bundle = load_saved_model(model_path)

    movies_catalog = load_movies_catalog(MOVIES_CSV_PATH)
    if model_bundle and model_bundle.get("movies_meta"):
        for mid, info in model_bundle["movies_meta"].items():
            movies_catalog.setdefault(mid, info)

    csv_stats, csv_user_rated = load_csv_popularity(RATINGS_CSV_PATH)
    movie_stats = (model_bundle.get("movie_stats") if model_bundle else None) or csv_stats
    live_watched, live_liked_genres = load_live_user_activity_from_sqlite(resolved_uid)

    if not movies_catalog:
        return {
            "user_id": resolved_uid,
            "requested_user_id": str(user_id),
            "top_n": top_n,
            "strategy": "fallback_empty_catalog",
            "model_loaded": bool(model_bundle),
            "rated_count": 0,
            "recommendations": [],
        }

    # Trường hợp 1: Model chưa tồn tại -> Fallback phổ biến
    if model_bundle is None:
        candidates = []
        for mid, info in movies_catalog.items():
            if mid in live_watched:
                continue
            st = movie_stats.get(mid, {"avg_rating": 4.2, "rating_count": 0})
            score = round(float(st["avg_rating"]), 2)
            candidates.append({
                "movie_id": mid,
                "title": info["title"],
                "genres": info["genres"],
                "poster_url": info["poster_url"],
                "status": info.get("status", "Đang chiếu"),
                "predicted_rating": score,
                "is_new_movie": st["rating_count"] == 0,
                "reason": f"Đề xuất phổ biến (chưa có file model · điểm TB {score}/5)",
            })
        candidates.sort(key=lambda x: x["predicted_rating"], reverse=True)
        return {
            "user_id": resolved_uid,
            "requested_user_id": str(user_id),
            "top_n": top_n,
            "strategy": "fallback_missing_model",
            "model_loaded": False,
            "rated_count": len(live_watched),
            "recommendations": candidates[:top_n],
        }

    trained_users = model_bundle.get("trained_users", set())
    trained_movies = model_bundle.get("trained_movies", set())
    model_user_rated = model_bundle.get("user_rated", {})

    rated_in_model = set(model_user_rated.get(resolved_uid, {}).keys())
    rated_in_csv = set(csv_user_rated.get(resolved_uid, {}).keys())
    excluded_movies = rated_in_model | rated_in_csv | live_watched

    is_known_user = resolved_uid in trained_users and len(rated_in_model) >= 1

    candidates = []
    for mid, info in movies_catalog.items():
        if mid in excluded_movies:
            continue

        is_new_movie = mid not in trained_movies
        movie_genres_en = [g.strip() for g in str(info.get("genres_en") or "").split("|") if g.strip()]

        if is_known_user:
            if is_new_movie:
                # Phim mới chưa xuất hiện trong tập train -> dự đoán fallback theo global mean + thể loại
                st = movie_stats.get(mid, {"avg_rating": 4.2, "rating_count": 0})
                base = float(st["avg_rating"]) if st["rating_count"] > 0 else 4.2
                score = round(base, 2)
                reason = "Phim mới ra mắt · Dự đoán phù hợp xu hướng chung"
            else:
                base = predict_single_score(model_bundle, resolved_uid, mid)
                overlap = [g for g in movie_genres_en if live_liked_genres.get(g, 0.0) > 0]
                if overlap and live_liked_genres:
                    boost = min(0.2, 0.1 * len(overlap))
                    score = round(min(5.0, base + boost), 2)
                else:
                    score = round(base, 2)
                reason = f"Dự đoán SVD: {score}/5 theo lịch sử đánh giá của bạn"
        else:
            # Cold-start user / thiếu dữ liệu đánh giá -> Fallback theo phim phổ biến + thể loại đã xem (nếu có)
            st = movie_stats.get(mid, {"avg_rating": 4.2, "rating_count": 0})
            base = float(st["avg_rating"])
            overlap = [g for g in movie_genres_en if live_liked_genres.get(g, 0.0) > 0]
            boost = min(0.45, 0.2 * len(overlap)) if overlap else 0.0
            score = round(min(5.0, base + boost), 2)
            if overlap:
                reason = "Đề xuất theo thể loại bạn vừa quan tâm (Tài khoản mới)"
            else:
                reason = f"Top phim được đánh giá cao ({st['rating_count']} lượt · Fallback tài khoản mới)"

        candidates.append({
            "movie_id": mid,
            "title": info["title"],
            "genres": info["genres"],
            "poster_url": info["poster_url"],
            "status": info.get("status", "Đang chiếu"),
            "predicted_rating": score,
            "is_new_movie": is_new_movie,
            "reason": reason,
        })

    # Nếu user đã xem/đánh giá toàn bộ kho phim -> fallback nhẹ các phim điểm cao nhất chưa gắn thẻ loại trừ
    if not candidates:
        for mid, info in movies_catalog.items():
            st = movie_stats.get(mid, {"avg_rating": 4.2, "rating_count": 0})
            candidates.append({
                "movie_id": mid,
                "title": info["title"],
                "genres": info["genres"],
                "poster_url": info["poster_url"],
                "status": info.get("status", "Đang chiếu"),
                "predicted_rating": round(float(st["avg_rating"]), 2),
                "is_new_movie": mid not in trained_movies,
                "reason": "Gợi ý xem lại các tác phẩm nổi bật nhất tại Movix",
            })

    candidates.sort(key=lambda x: x["predicted_rating"], reverse=True)
    strategy = "svd" if is_known_user else "fallback_cold_start_user"

    return {
        "user_id": resolved_uid,
        "requested_user_id": str(user_id),
        "top_n": top_n,
        "strategy": strategy,
        "backend": model_bundle.get("backend"),
        "model_loaded": True,
        "model_stats": model_bundle.get("stats", {}),
        "rated_count": len(excluded_movies),
        "recommendations": candidates[:top_n],
    }


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(description="Dự đoán Top N phim gợi ý từ model SVD đã lưu")
    parser.add_argument("user_id", help="Mã tài khoản người dùng (ví dụ: usr-1, usr-2 hoặc guest)")
    parser.add_argument("--top-n", type=int, default=DEFAULT_SVD_CONFIG["top_n"], help="Số lượng phim gợi ý")
    parser.add_argument("--model", default=MODEL_PATH, help="Đường dẫn file model (.pkl)")
    parser.add_argument("--json", action="store_true", help="Xuất kết quả dạng JSON")
    args = parser.parse_args()

    res = recommend_top_n(args.user_id, top_n=args.top_n, model_path=args.model)
    if args.json:
        print(json.dumps(res, ensure_ascii=False))
    else:
        print(f"Gợi ý Top {args.top_n} cho User '{res['user_id']}' (strategy={res['strategy']}):")
        for idx, item in enumerate(res["recommendations"], 1):
            print(f"  {idx}. {item['title']} | {item['genres']} | Dự đoán: {item['predicted_rating']}★")
            print(f"     Lý do: {item['reason']}")
