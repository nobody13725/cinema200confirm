import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

RATINGS_CSV_PATH = os.path.join(BASE_DIR, "ratings.csv")
MOVIES_CSV_PATH = os.path.join(BASE_DIR, "movies.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "svd_model.pkl")

# Đường dẫn SQLite thống nhất với website Movix
SQLITE_DB_PATH = os.path.join(PROJECT_ROOT, "flask_cf_demo", "movix_cf.db")

# Tham số huấn luyện SVD mặc định (có thể ghi đè qua biến môi trường hoặc tham số dòng lệnh CLI)
DEFAULT_SVD_CONFIG = {
    "n_factors": int(os.environ.get("SVD_N_FACTORS", "20")),
    "n_epochs": int(os.environ.get("SVD_N_EPOCHS", "50")),
    "lr_all": float(os.environ.get("SVD_LR_ALL", "0.01")),
    "reg_all": float(os.environ.get("SVD_REG_ALL", "0.05")),
    "test_size": float(os.environ.get("SVD_TEST_SIZE", "0.2")),
    "random_state": int(os.environ.get("SVD_RANDOM_STATE", "42")),
    "top_n": int(os.environ.get("SVD_TOP_N", "5")),
}

# Ánh xạ ID số ngắn (1, 2, 3...) sang user_id chuẩn của website Movix (usr-1, usr-2, usr-3...)
USER_ALIAS_MAP = {
    "1": "usr-1",
    "2": "usr-2",
    "3": "usr-3",
    "4": "usr-admin-01",
    "5": "usr-staff-01",
}
