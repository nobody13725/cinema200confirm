import argparse
import json
import math
import os
import pickle
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from config import MODEL_PATH


def predict_pure_python_raw(weights, uid, mid):
    mu = weights["mu"]
    bu = weights["b_u"].get(uid, 0.0)
    bi = weights["b_i"].get(mid, 0.0)
    pu = weights["P"].get(uid)
    qi = weights["Q"].get(mid)
    dot_val = sum(a * b for a, b in zip(pu, qi)) if (pu is not None and qi is not None) else 0.0
    pred = mu + bu + bi + dot_val
    return max(1.0, min(5.0, pred))


def evaluate_saved_model(model_path: str = MODEL_PATH, verbose: bool = True) -> dict:
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Chưa tìm thấy model tại '{model_path}'. Hãy chạy `python train_model.py` trước."
        )

    with open(model_path, "rb") as f:
        bundle = pickle.load(f)

    backend = bundle["backend"]
    testset = bundle.get("testset", [])
    if not testset:
        raise ValueError("Model không chứa tập Test để đánh giá.")

    if backend == "surprise_svd":
        from surprise import accuracy

        algo = bundle["algo"]
        predictions = algo.test(testset)
        rmse_val = float(accuracy.rmse(predictions, verbose=False))
        mae_val = float(accuracy.mae(predictions, verbose=False))
    else:
        weights = bundle["weights"]
        sq_errors = []
        abs_errors = []
        for uid, mid, true_r in testset:
            est = predict_pure_python_raw(weights, uid, mid)
            err = true_r - est
            sq_errors.append(err * err)
            abs_errors.append(abs(err))
        rmse_val = math.sqrt(sum(sq_errors) / len(sq_errors))
        mae_val = sum(abs_errors) / len(abs_errors)

    summary = {
        "ok": True,
        "backend": backend,
        "test_samples": len(testset),
        "rmse": round(rmse_val, 4),
        "mae": round(mae_val, 4),
        "config": bundle.get("config", {}),
        "stats": bundle.get("stats", {}),
    }

    if verbose:
        print("=" * 60)
        print("ĐÁNH GIÁ MÔ HÌNH SVD TRÊN TẬP TEST")
        print("=" * 60)
        print(f"- Model file   : {model_path}")
        print(f"- Engine       : {backend}")
        print(f"- Số mẫu Test  : {summary['test_samples']}")
        print(f"- Tham số SVD  : {summary['config']}")
        print(f"- RMSE         : {summary['rmse']:.4f}")
        print(f"- MAE          : {summary['mae']:.4f}")
        print("=" * 60)

    return summary


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(description="Đánh giá mô hình SVD đã lưu (RMSE, MAE)")
    parser.add_argument("--model", default=MODEL_PATH, help="Đường dẫn file model (.pkl)")
    parser.add_argument("--json", action="store_true", help="Xuất kết quả dạng JSON")
    args = parser.parse_args()

    res = evaluate_saved_model(model_path=args.model, verbose=not args.json)
    if args.json:
        print(json.dumps(res, ensure_ascii=False))
