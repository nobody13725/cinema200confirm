import json
import math
import os
import pickle
import random
import sqlite3
import sys
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DB_PATH = os.path.join(BASE_DIR, "movix_cf.db")
MODEL_PATH = os.path.join(BASE_DIR, "svd_model.pkl")
AI_MODULE_DIR = os.path.join(PROJECT_ROOT, "AI_Recommendation")


def sync_ai_recommendation(retrain_ai_model=False):
    """Đồng bộ ratings.csv, movies.csv (và model nếu được yêu cầu) sang thư mục AI_Recommendation."""
    try:
        if AI_MODULE_DIR not in sys.path:
            sys.path.insert(0, AI_MODULE_DIR)
        from sync_data import export_from_sqlite

        export_from_sqlite(include_movielens_seed=True)
        if retrain_ai_model:
            from train_model import train_pipeline
            train_pipeline(verbose=False)
    except Exception:
        pass

# Ánh xạ danh mục Movix (cat-1..cat-7) sang chuẩn thể loại thống nhất
CATEGORY_ID_MAP = {
    "cat-1": "Action",
    "cat-2": "Sci-Fi",
    "cat-3": "Mystery|Horror",
    "cat-4": "Drama",
    "cat-5": "Animation",
    "cat-6": "Comedy",
    "cat-7": "Family|Romance",
}

GENRE_VI_MAP = {
    "Action": "Hành động",
    "Adventure": "Phiêu lưu",
    "Animation": "Hoạt hình & Anime",
    "Children": "Thiếu nhi",
    "Comedy": "Hài hước",
    "Crime": "Hình sự",
    "Drama": "Chính kịch & Tâm lý",
    "Family": "Gia đình",
    "Fantasy": "Giả tưởng",
    "History": "Lịch sử",
    "Horror": "Kinh dị",
    "Mystery": "Bí ẩn",
    "Romance": "Tình cảm",
    "Sci-Fi": "Khoa học viễn tưởng",
    "Thriller": "Giật gân",
}

# Danh sách tài khoản thống nhất với hệ thống Movix (INITIAL_USERS)
UNIFIED_USERS = [
    (1, "usr-1", "thangnguyen", "123", "Nguyễn Toàn Thắng", "thangnguyen13725@gmail.com", "Sci-Fi & Hành động", "customer"),
    (2, "usr-2", "thaole", "123", "Lê Phương Thảo", "thaole@gmail.com", "Sci-Fi, Hoạt hình & Anime", "customer"),
    (3, "usr-3", "minhanh", "123", "Trần Minh Anh", "minhanh@gmail.com", "Gia đình & Tâm lý Việt", "customer"),
    (4, "usr-admin-01", "admin", "123", "Quản trị viên Movix", "admin@movix.vn", "Quản trị viên hệ thống", "admin"),
    (5, "usr-staff-01", "nhanvien", "123", "Nguyễn Văn Nhân Viên", "nhanvien@movix.vn", "Nhân viên vận hành rạp", "employee"),
    (6, "usr-4", "nampham", "123", "Phạm Hoàng Nam", "nampham@gmail.com", "Chính kịch, Lịch sử & IMAX", "customer"),
    (7, "usr-5", "linhdo", "123", "Đỗ Khánh Linh", "linhdo@gmail.com", "Tâm lý & Kinh dị sinh tồn", "customer"),
    (8, "usr-6", "haivu", "123", "Vũ Đức Hải", "haivu@gmail.com", "Gia đình, Hoạt hình & Kinh dị Việt", "customer"),
    (9, "usr-staff-02", "nhanvien2", "123", "Trần Thị Thu Hà", "thuha@movix.vn", "Nhân viên vận hành rạp", "employee"),
]

# Danh sách 18 phim thống nhất 1-1 với Movix Website (INITIAL_FILMS: film-1..film-18)
UNIFIED_MOVIES = [
    (1, "film-1", "Avatar: The Way of Water", "Sci-Fi|Action|Adventure", 2026, "ML-Ref #1",
     "Jake Sully và Neytiri cùng các con khám phá các rạn san hô kỳ vĩ trên Pandora và chiến đấu bảo vệ gia đình."),
    (2, "film-2", "Dune: Part Two", "Sci-Fi|Action|Drama", 2026, "ML-Ref #2",
     "Paul Atreides hợp lực cùng Chani và tộc người Fremen thực hiện cuộc chiến quyết định vận mệnh vũ trụ."),
    (3, "film-3", "Deadpool & Wolverine", "Action|Comedy|Sci-Fi", 2026, "ML-Ref #3",
     "Deadpool tái xuất giang hồ và tìm kiếm sự hỗ trợ từ Wolverine để bảo vệ dòng thời gian đa vũ trụ."),
    (4, "film-4", "Spider-Man: Across the Spider-Verse", "Animation|Action|Sci-Fi", 2026, "ML-Ref #4",
     "Miles Morales phóng qua đa vũ trụ, chạm trán Quân đoàn Người Nhện bảo vệ các thực tại song song."),
    (5, "film-5", "Lật Mặt 7: Một Điều Ước", "Family|Drama|Comedy", 2026, "ML-Ref #5",
     "Bộ phim cảm động về tình mẫu tử thiêng liêng của bà Hai và năm người con với thông điệp sum vầy."),
    (6, "film-6", "Mai (Trấn Thành)", "Drama|Romance", 2026, "ML-Ref #6",
     "Câu chuyện tình yêu đầy trắc trở giữa Mai và Dương giữa những định kiến cuộc sống đô thị."),
    (7, "film-7", "Oppenheimer", "Drama|Action|History", 2026, "ML-Ref #7",
     "Thiên sử thi về nhà vật lý J. Robert Oppenheimer và dự án Manhattan thay đổi lịch sử nhân loại."),
    (8, "film-8", "Inside Out 2", "Animation|Comedy|Family", 2026, "ML-Ref #8",
     "Bộ chỉ huy tâm trí cô bé Riley xáo trộn với sự xuất hiện của các cảm xúc mới tuổi dậy thì."),
    (9, "film-9", "Godzilla x Kong: The New Empire", "Action|Sci-Fi|Adventure", 2026, "ML-Ref #9",
     "Hai đại quái thú Godzilla và Kong hợp lực chống lại mối đe dọa khổng lồ ẩn sâu trong Trái Đất Rỗng."),
    (10, "film-10", "Exhuma: Quật Mộ Trùng Ma", "Horror|Mystery|Drama", 2026, "ML-Ref #10",
     "Bộ đôi pháp sư và thầy phong thủy khai quật ngôi mộ cổ kỳ quái trên đỉnh núi hoang vu."),
    (11, "film-11", "Detective Conan: The Million-dollar Pentagram", "Animation|Action|Mystery", 2026, "ML-Ref #11",
     "Cuộc đối đầu kịch tính giữa Siêu đạo chích Kid và Hattori Heiji tại Hakodate xoay quanh báu vật cổ."),
    (12, "film-12", "The Wild Robot", "Animation|Family|Sci-Fi", 2026, "ML-Ref #12",
     "Robot Roz bị đắm tàu dạt vào đảo hoang, học cách hòa nhập thiên nhiên và nuôi nấng chú ngỗng non."),
    (13, "film-13", "A Quiet Place: Day One", "Horror|Mystery|Sci-Fi|Action", 2026, "ML-Ref #13",
     "Phần tiền truyện kịch tính về ngày đầu tiên thành phố New York rơi vào thảm họa sinh vật săn mồi theo âm thanh."),
    (14, "film-14", "Kung Fu Panda 4", "Animation|Comedy|Action", 2026, "ML-Ref #14",
     "Thần Long Đại Hiệp Po tìm kiếm người kế vị và đối đầu phù thủy tắc kè hoa tại Thung lũng Bình Yên."),
    (15, "film-15", "Interstellar (IMAX Re-release)", "Sci-Fi|Drama", 2026, "ML-Ref #15",
     "Kiệt tác du hành không gian của Christopher Nolan trở lại màn ảnh IMAX Laser."),
    (16, "film-16", "Ma Da", "Horror|Mystery|Drama", 2026, "ML-Ref #16",
     "Phim kinh dị dân gian miền Tây xoay quanh bà Lệ làm nghề vớt xác đối mặt lời nguyền sông nước."),
    (17, "film-17", "Transformers One", "Animation|Action|Sci-Fi", 2026, "ML-Ref #17",
     "Câu chuyện nguồn gốc tình anh em giữa Optimus Prime và Megatron trên hành tinh Cybertron."),
    (18, "film-18", "Venom: The Last Dance", "Action|Sci-Fi|Comedy", 2026, "ML-Ref #18",
     "Eddie Brock và Venom bước vào cuộc chạy trốn sinh tử cuối cùng chống lại thế lực symbiote vũ trụ."),
]


def build_movielens_seed_ratings():
    """
    Tạo tập đánh giá mẫu MovieLens benchmark (movielens_ratings) gắn với 18 phim hợp nhất:
    - Các cụm người dùng lịch sử MovieLens (User 101..128) để SVD học tương quan đánh giá & thể loại.
    - Dữ liệu mẫu ban đầu của User 1..3, 6..8 khớp với lịch sử/bình luận gốc trên Movix.
    """
    seeds = []

    # Lịch sử đánh giá ban đầu khớp với INITIAL_COMMENTS / INITIAL_ORDERS trên Movix
    seeds.extend([
        (1, 1, 5.0),   # User 1 (Nguyễn Toàn Thắng) đã xem & đánh giá 5 sao Avatar: The Way of Water
        (1, 15, 5.0),  # User 1 đã xem & đánh giá 5 sao Interstellar IMAX
        (2, 2, 5.0),   # User 2 (Lê Phương Thảo) đã xem & đánh giá 5 sao Dune: Part Two
        (2, 4, 5.0),   # User 2 đã đánh giá 5 sao Spider-Man: Across the Spider-Verse
        (2, 8, 5.0),   # User 2 đã đánh giá 5 sao Inside Out 2
        (3, 5, 5.0),   # User 3 (Trần Minh Anh) đã xem & đánh giá 5 sao Lật Mặt 7
        (3, 12, 5.0),  # User 3 đã đánh giá 5 sao The Wild Robot
        (6, 7, 5.0),   # User 4 (Phạm Hoàng Nam) đã xem & đánh giá 5 sao Oppenheimer
        (6, 15, 5.0),  # User 4 đã đánh giá 5 sao Interstellar IMAX
        (7, 6, 5.0),   # User 5 (Đỗ Khánh Linh) đã xem & đánh giá 5 sao Mai
        (7, 13, 4.0),  # User 5 đã đánh giá 4 sao A Quiet Place: Day One
        (8, 14, 5.0),  # User 6 (Vũ Đức Hải) đã đánh giá 5 sao Kung Fu Panda 4
        (8, 16, 4.0),  # User 6 đã đánh giá 4 sao Ma Da
    ])

    scifi_action_ids = [1, 2, 3, 7, 9, 15, 18]
    anim_family_ids = [4, 8, 11, 12, 14, 17]
    family_drama_ids = [5, 6, 8, 12, 14]
    mystery_thriller_ids = [7, 10, 11, 13, 16, 2]

    rng = random.Random(2026)

    # Cụm A: Fan Sci-Fi & Hành động (Users 101..107)
    for uid in range(101, 108):
        for mid in scifi_action_ids:
            seeds.append((uid, mid, round(rng.choice([4.5, 4.8, 5.0]), 1)))
        for mid in [4, 13, 17]:
            seeds.append((uid, mid, round(rng.choice([4.0, 4.4]), 1)))
        for mid in [5, 6, 8, 12, 14, 16]:
            seeds.append((uid, mid, round(rng.choice([1.8, 2.2, 2.5]), 1)))
        seeds.append((uid, 10, round(rng.choice([2.5, 3.0]), 1)))

    # Cụm B: Fan Hoạt hình, Anime & Sci-Fi đa vũ trụ (Users 108..114)
    for uid in range(108, 115):
        for mid in anim_family_ids:
            seeds.append((uid, mid, round(rng.choice([4.5, 4.9, 5.0]), 1)))
        for mid in [1, 2, 3, 15]:
            seeds.append((uid, mid, round(rng.choice([3.6, 4.0]), 1)))
        for mid in [6, 10, 7, 13, 16]:
            seeds.append((uid, mid, round(rng.choice([1.8, 2.2, 2.5]), 1)))

    # Cụm C: Fan Phim Việt, Gia đình & Tình cảm Tâm lý (Users 115..121)
    for uid in range(115, 122):
        for mid in family_drama_ids:
            seeds.append((uid, mid, round(rng.choice([4.5, 4.8, 5.0]), 1)))
        for mid in [1, 2, 3, 9, 18]:
            seeds.append((uid, mid, round(rng.choice([1.5, 2.0, 2.5]), 1)))
        for mid in [10, 13]:
            seeds.append((uid, mid, round(rng.choice([1.8, 2.2]), 1)))
        for mid in [7, 15, 16]:
            seeds.append((uid, mid, round(rng.choice([3.2, 3.8]), 1)))

    # Cụm D: Fan Trinh thám, Kinh dị & Bí ẩn (Users 122..128)
    for uid in range(122, 129):
        for mid in mystery_thriller_ids:
            seeds.append((uid, mid, round(rng.choice([4.5, 4.8, 5.0]), 1)))
        for mid in [15, 18]:
            seeds.append((uid, mid, round(rng.choice([3.8, 4.2]), 1)))
        for mid in [5, 8, 12, 14]:
            seeds.append((uid, mid, round(rng.choice([1.8, 2.2, 2.5]), 1)))

    base_ts = 874965758
    return [(u, m, r, base_ts + idx * 317) for idx, (u, m, r) in enumerate(seeds)]


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _needs_unified_migration(cur):
    tables = {r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()}
    if "movies" not in tables or "watch_history" not in tables or "recommendation_settings" not in tables:
        return True
    movie_cols = {r[1] for r in cur.execute("PRAGMA table_info(movies)").fetchall()}
    user_cols = {r[1] for r in cur.execute("PRAGMA table_info(users)").fetchall()}
    if "web_film_id" not in movie_cols or "web_user_id" not in user_cols:
        return True
    has_film18 = cur.execute("SELECT 1 FROM movies WHERE web_film_id = 'film-18'").fetchone()
    has_usr6 = cur.execute("SELECT 1 FROM users WHERE web_user_id = 'usr-6'").fetchone()
    if not has_film18 or not has_usr6:
        return True
    return False


def init_db(force_reset=False):
    if force_reset and os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    if force_reset and os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)

    if os.path.exists(DB_PATH) and not force_reset:
        conn_check = get_conn()
        try:
            needs_mig = _needs_unified_migration(conn_check.cursor())
        finally:
            conn_check.close()
        if needs_mig:
            os.remove(DB_PATH)
            if os.path.exists(MODEL_PATH):
                os.remove(MODEL_PATH)

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            web_user_id TEXT UNIQUE,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL DEFAULT '123',
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            persona TEXT NOT NULL DEFAULT 'Khán giả Movix',
            role TEXT NOT NULL DEFAULT 'customer'
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            web_film_id TEXT UNIQUE,
            title TEXT NOT NULL,
            genres TEXT NOT NULL,
            year INTEGER NOT NULL DEFAULT 2026,
            movielens_ref TEXT NOT NULL DEFAULT 'Movix Catalog',
            description TEXT NOT NULL DEFAULT ''
        )
    """)

    # Bảng 1: Dữ liệu đánh giá mẫu có sẵn (MovieLens Benchmark Seed)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS movielens_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            rating REAL NOT NULL,
            ml_timestamp INTEGER NOT NULL,
            UNIQUE(user_id, movie_id)
        )
    """)

    # Bảng 2: Đánh giá mới phát sinh trên website Movix (bình luận sao hoặc xem xong)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS website_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            rating REAL NOT NULL,
            comment TEXT DEFAULT '',
            source TEXT NOT NULL DEFAULT 'website_review',
            created_at TEXT NOT NULL,
            included_in_model INTEGER NOT NULL DEFAULT 0,
            UNIQUE(user_id, movie_id)
        )
    """)

    # Bảng 3: Lịch sử phim đã xem / đã đặt vé của người dùng bên Website Movix (thống nhất 2 bên)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS watch_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            source TEXT NOT NULL DEFAULT 'watched',
            order_id TEXT DEFAULT '',
            watched_at TEXT NOT NULL,
            UNIQUE(user_id, movie_id)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS model_metadata (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            trained_at TEXT NOT NULL,
            movielens_count INTEGER NOT NULL,
            website_count INTEGER NOT NULL,
            total_ratings INTEGER NOT NULL,
            n_factors INTEGER NOT NULL,
            epochs INTEGER NOT NULL,
            rmse REAL NOT NULL,
            model_version INTEGER NOT NULL
        )
    """)

    # Bảng 4: Cấu hình SVD & Gợi ý trang chủ (chỉ Admin mới được chỉnh sửa)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS recommendation_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            default_alpha REAL NOT NULL DEFAULT 0.65,
            default_genre_filter TEXT NOT NULL DEFAULT 'ALL',
            home_limit INTEGER NOT NULL DEFAULT 4,
            home_enabled INTEGER NOT NULL DEFAULT 1,
            section_title TEXT NOT NULL DEFAULT 'Gợi ý phim dành riêng cho bạn',
            updated_at TEXT NOT NULL
        )
    """)

    if cur.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
        cur.executemany(
            "INSERT INTO users (id, web_user_id, username, password, full_name, email, persona, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            UNIFIED_USERS,
        )

    if cur.execute("SELECT COUNT(*) FROM movies").fetchone()[0] == 0:
        cur.executemany(
            "INSERT INTO movies (id, web_film_id, title, genres, year, movielens_ref, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
            UNIFIED_MOVIES,
        )

    if cur.execute("SELECT COUNT(*) FROM movielens_ratings").fetchone()[0] == 0:
        seed_rows = build_movielens_seed_ratings()
        cur.executemany(
            "INSERT OR IGNORE INTO movielens_ratings (user_id, movie_id, rating, ml_timestamp) VALUES (?, ?, ?, ?)",
            seed_rows,
        )

    # Khởi tạo lịch sử đã xem khớp với INITIAL_ORDERS trên Movix
    if cur.execute("SELECT COUNT(*) FROM watch_history").fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        initial_watches = [
            (1, 1, "order_confirmed", "ord-1", now_str),   # User 1 đã đặt/xem Avatar: The Way of Water
            (2, 2, "order_confirmed", "ord-2", now_str),   # User 2 đã đặt/xem Dune: Part Two
            (2, 4, "order_confirmed", "ord-5", now_str),   # User 2 đã đặt/xem Spider-Man: Across the Spider-Verse
            (3, 5, "order_used", "ord-3", now_str),        # User 3 đã xem xong Lật Mặt 7
            (6, 7, "order_used", "ord-6", now_str),        # User 4 đã xem xong Oppenheimer
            (7, 6, "order_used", "ord-7", now_str),        # User 5 đã xem xong Mai
            (7, 13, "order_confirmed", "ord-8", now_str),  # User 5 đã đặt/xem A Quiet Place: Day One
            (8, 14, "order_confirmed", "ord-9", now_str),  # User 6 đã đặt/xem Kung Fu Panda 4
            (1, 15, "order_used", "ord-10", now_str),      # User 1 đã xem xong Interstellar IMAX
            (6, 15, "order_used", "ord-13", now_str),      # User 4 đã xem xong Interstellar IMAX
            (8, 16, "order_used", "ord-14", now_str),      # User 6 đã xem xong Ma Da
            (2, 8, "order_used", "ord-15", now_str),       # User 2 đã xem xong Inside Out 2
            (3, 12, "order_used", "ord-16", now_str),      # User 3 đã xem xong The Wild Robot
        ]
        cur.executemany(
            "INSERT OR IGNORE INTO watch_history (user_id, movie_id, source, order_id, watched_at) VALUES (?, ?, ?, ?, ?)",
            initial_watches,
        )

    if cur.execute("SELECT COUNT(*) FROM recommendation_settings").fetchone()[0] == 0:
        cur.execute(
            """
            INSERT INTO recommendation_settings (id, default_alpha, default_genre_filter, home_limit, home_enabled, section_title, updated_at)
            VALUES (1, 0.65, 'ALL', 4, 1, 'Gợi ý phim dành riêng cho bạn', ?)
            """,
            (datetime.now().strftime("%Y-%m-%d %H:%M:%S"),),
        )

    conn.commit()
    conn.close()

    if not os.path.exists(MODEL_PATH):
        train_and_save_model()


def normalize_genres_from_web(category_ids=None, genre_text=None):
    parts = []
    if category_ids and isinstance(category_ids, list):
        for cid in category_ids:
            mapped = CATEGORY_ID_MAP.get(cid)
            if mapped:
                parts.extend(mapped.split("|"))
    if genre_text:
        text_low = str(genre_text).lower()
        mapping = [
            ("hành động", "Action"),
            ("action", "Action"),
            ("viễn tưởng", "Sci-Fi"),
            ("sci-fi", "Sci-Fi"),
            ("kinh dị", "Horror"),
            ("horror", "Horror"),
            ("bí ẩn", "Mystery"),
            ("mystery", "Mystery"),
            ("tâm lý", "Drama"),
            ("chính kịch", "Drama"),
            ("drama", "Drama"),
            ("hoạt hình", "Animation"),
            ("anime", "Animation"),
            ("animation", "Animation"),
            ("hài", "Comedy"),
            ("comedy", "Comedy"),
            ("gia đình", "Family"),
            ("family", "Family"),
            ("tình cảm", "Romance"),
            ("romance", "Romance"),
            ("phiêu lưu", "Adventure"),
            ("adventure", "Adventure"),
            ("hình sự", "Crime"),
            ("crime", "Crime"),
        ]
        for kw, tag in mapping:
            if kw in text_low:
                parts.append(tag)
        # Keep raw English pipe-separated genres if already present
        for raw in str(genre_text).replace(",", "|").split("|"):
            clean = raw.strip()
            if clean in GENRE_VI_MAP:
                parts.append(clean)
    dedup = []
    for p in parts:
        if p not in dedup:
            dedup.append(p)
    return "|".join(dedup) if dedup else "Drama|Action"


def resolve_user_id(cur, user_id=None, web_user_id=None, email=None, full_name=None, username=None, role="customer"):
    if web_user_id:
        row = cur.execute("SELECT id FROM users WHERE web_user_id = ?", (str(web_user_id),)).fetchone()
        if row:
            return row["id"]
    if email:
        row = cur.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (str(email).strip(),)).fetchone()
        if row:
            if web_user_id:
                cur.execute("UPDATE users SET web_user_id = COALESCE(web_user_id, ?) WHERE id = ?", (str(web_user_id), row["id"]))
            return row["id"]
    if user_id is not None:
        try:
            uid_int = int(user_id)
            row = cur.execute("SELECT id FROM users WHERE id = ?", (uid_int,)).fetchone()
            if row:
                return row["id"]
        except (ValueError, TypeError):
            pass

    if web_user_id or email or full_name:
        clean_email = (email or f"{web_user_id or 'user'}@movix.vn").strip()
        clean_name = (full_name or clean_email.split("@")[0]).strip()
        base_uname = (username or clean_email.split("@")[0] or f"user_{int(datetime.now().timestamp())}").strip()
        uname = base_uname
        suffix = 1
        while cur.execute("SELECT 1 FROM users WHERE username = ?", (uname,)).fetchone():
            uname = f"{base_uname}_{suffix}"
            suffix += 1
        cur.execute(
            """
            INSERT INTO users (web_user_id, username, password, full_name, email, persona, role)
            VALUES (?, ?, '123', ?, ?, 'Khán giả Movix', ?)
            """,
            (web_user_id or f"usr-{int(datetime.now().timestamp())}", uname, clean_name, clean_email, role or "customer"),
        )
        return cur.lastrowid
    return 1


def resolve_movie_id(cur, movie_id=None, web_film_id=None, title=None, genres=None, description=""):
    if web_film_id:
        row = cur.execute("SELECT id FROM movies WHERE web_film_id = ?", (str(web_film_id),)).fetchone()
        if row:
            return row["id"]
    if movie_id is not None:
        try:
            mid_int = int(movie_id)
            row = cur.execute("SELECT id FROM movies WHERE id = ?", (mid_int,)).fetchone()
            if row:
                return row["id"]
        except (ValueError, TypeError):
            # Might be passed as "film-1"
            row = cur.execute("SELECT id FROM movies WHERE web_film_id = ?", (str(movie_id),)).fetchone()
            if row:
                return row["id"]
    if title:
        row = cur.execute("SELECT id FROM movies WHERE LOWER(title) = LOWER(?)", (str(title).strip(),)).fetchone()
        if row:
            return row["id"]
        clean_genres = genres or "Drama|Action"
        wf_id = web_film_id or f"film-{int(datetime.now().timestamp())}"
        cur.execute(
            """
            INSERT INTO movies (web_film_id, title, genres, year, movielens_ref, description)
            VALUES (?, ?, ?, 2026, 'Movix Web', ?)
            """,
            (wf_id, str(title).strip(), clean_genres, description or ""),
        )
        return cur.lastrowid
    return None


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def train_svd_from_records(records, n_factors=8, epochs=95, lr=0.015, reg=0.045, seed=42):
    rng = random.Random(seed)
    mu = sum(r for _, _, r in records) / max(len(records), 1)

    user_ids = sorted({u for u, _, _ in records})
    movie_ids = sorted({m for _, m, _ in records})

    b_u = {u: 0.0 for u in user_ids}
    b_i = {m: 0.0 for m in movie_ids}
    P = {u: [rng.gauss(0.0, 0.08) for _ in range(n_factors)] for u in user_ids}
    Q = {m: [rng.gauss(0.0, 0.08) for _ in range(n_factors)] for m in movie_ids}

    train_list = list(records)
    for _ in range(epochs):
        rng.shuffle(train_list)
        for u, m, r in train_list:
            pu = P[u]
            qi = Q[m]
            pred = mu + b_u[u] + b_i[m] + dot(pu, qi)
            err = r - pred

            b_u[u] += lr * (err - reg * b_u[u])
            b_i[m] += lr * (err - reg * b_i[m])

            for f in range(n_factors):
                puf = pu[f]
                qif = qi[f]
                pu[f] += lr * (err * qif - reg * puf)
                qi[f] += lr * (err * puf - reg * qif)

    sq_err = 0.0
    for u, m, r in train_list:
        pred = mu + b_u[u] + b_i[m] + dot(P[u], Q[m])
        pred = max(1.0, min(5.0, pred))
        sq_err += (r - pred) ** 2
    rmse = math.sqrt(sq_err / max(len(train_list), 1))

    return {
        "algorithm": "Hybrid Collaborative Filtering (Biased SVD + Genre Profile)",
        "mu": mu,
        "b_u": b_u,
        "b_i": b_i,
        "P": P,
        "Q": Q,
        "n_factors": n_factors,
        "epochs": epochs,
        "reg": reg,
        "lr": lr,
        "rmse": round(rmse, 4),
    }


def compute_genre_profiles(records, movies_rows, mu):
    movie_genres = {}
    all_genres_set = set()
    for m in movies_rows:
        gs = [g.strip() for g in m["genres"].split("|") if g.strip()]
        movie_genres[m["id"]] = gs
        all_genres_set.update(gs)

    all_genres = sorted(all_genres_set)

    movie_vecs = {}
    for mid, gs in movie_genres.items():
        norm = math.sqrt(len(gs)) if gs else 1.0
        movie_vecs[mid] = {g: 1.0 / norm for g in gs}

    user_ratings_by_genre = {}
    user_raw_ratings = {}
    for u, m, r in records:
        user_raw_ratings.setdefault(u, []).append(r)
        for g in movie_genres.get(m, []):
            user_ratings_by_genre.setdefault(u, {}).setdefault(g, []).append(r)

    user_genre_profiles = {}
    prior_weight = 1.5

    for u, r_list in user_raw_ratings.items():
        u_mean = sum(r_list) / len(r_list)
        g_map = user_ratings_by_genre.get(u, {})

        genre_scores = {}
        pos_vec = {}
        affinity_list = []

        for g in all_genres:
            vals = g_map.get(g, [])
            if vals:
                smoothed = (sum(vals) + prior_weight * u_mean) / (len(vals) + prior_weight)
                raw_avg = sum(vals) / len(vals)
                pos_weight = max(0.0, raw_avg - 3.0)
                if pos_weight > 0:
                    pos_vec[g] = pos_weight
                affinity_list.append({
                    "genre": g,
                    "genre_vi": GENRE_VI_MAP.get(g, g),
                    "avg_rating": round(raw_avg, 2),
                    "smoothed_score": round(smoothed, 3),
                    "count": len(vals),
                    "delta_from_mean": round(raw_avg - u_mean, 2),
                })
                genre_scores[g] = round(smoothed, 3)
            else:
                genre_scores[g] = round(0.5 * u_mean + 0.5 * mu, 3)

        vec_norm = math.sqrt(sum(v * v for v in pos_vec.values()))
        norm_pos_vec = {g: (v / vec_norm) for g, v in pos_vec.items()} if vec_norm > 0 else {}

        affinity_list.sort(key=lambda x: (x["avg_rating"], x["count"]), reverse=True)
        user_genre_profiles[u] = {
            "user_mean": round(u_mean, 3),
            "genre_scores": genre_scores,
            "pos_vec": norm_pos_vec,
            "affinity": affinity_list,
        }

    return {
        "all_genres": all_genres,
        "movie_genres": movie_genres,
        "movie_vecs": movie_vecs,
        "user_genre_profiles": user_genre_profiles,
    }


def predict_with_model(model, user_id, movie_id, alpha=0.65):
    mu = model["mu"]
    bu = model["b_u"].get(user_id, 0.0)
    bi = model["b_i"].get(movie_id, 0.0)
    pu = model["P"].get(user_id)
    qi = model["Q"].get(movie_id)
    raw_svd = mu + bu + bi + (dot(pu, qi) if (pu is not None and qi is not None) else 0.0)
    svd_score = round(max(1.0, min(5.0, raw_svd)), 3)

    gs = model.get("movie_genres", {}).get(movie_id, [])
    u_prof = model.get("user_genre_profiles", {}).get(user_id)
    m_vec = model.get("movie_vecs", {}).get(movie_id, {})

    if u_prof and gs:
        g_scores = [u_prof["genre_scores"].get(g, mu) for g in gs]
        base_genre_score = sum(g_scores) / len(g_scores)
        pos_vec = u_prof.get("pos_vec", {})
        cos_sim = sum(pos_vec.get(g, 0.0) * m_vec.get(g, 0.0) for g in gs)
        cos_sim = max(0.0, min(1.0, cos_sim))
        raw_genre = base_genre_score + 0.35 * cos_sim
        genre_score = round(max(1.0, min(5.0, raw_genre)), 3)
        genre_match_pct = round(cos_sim * 100.0, 1)
        matched_genres = [g for g in gs if pos_vec.get(g, 0.0) > 0]
    else:
        genre_score = svd_score
        genre_match_pct = 0.0
        matched_genres = []

    alpha = max(0.0, min(1.0, float(alpha)))
    hybrid_score = round(max(1.0, min(5.0, alpha * svd_score + (1.0 - alpha) * genre_score)), 3)

    return {
        "predicted_rating": hybrid_score,
        "svd_score": svd_score,
        "genre_score": genre_score,
        "genre_match_pct": genre_match_pct,
        "matched_genres": matched_genres,
    }


def train_and_save_model():
    conn = get_conn()
    cur = conn.cursor()

    movies_rows = cur.execute("SELECT id, web_film_id, title, genres FROM movies").fetchall()
    ml_rows = cur.execute("SELECT user_id, movie_id, rating FROM movielens_ratings").fetchall()
    web_rows = cur.execute("SELECT user_id, movie_id, rating FROM website_ratings").fetchall()
    watch_rows = cur.execute("SELECT user_id, movie_id FROM watch_history").fetchall()

    combined_map = {}
    for row in ml_rows:
        combined_map[(row["user_id"], row["movie_id"])] = float(row["rating"])
    for row in watch_rows:
        if (row["user_id"], row["movie_id"]) not in combined_map:
            combined_map[(row["user_id"], row["movie_id"])] = 4.5
    for row in web_rows:
        combined_map[(row["user_id"], row["movie_id"])] = float(row["rating"])

    records = [(u, m, r) for (u, m), r in combined_map.items()]
    model = train_svd_from_records(records)

    genre_data = compute_genre_profiles(records, movies_rows, model["mu"])
    model.update(genre_data)
    model["algorithm"] = "Hybrid Collaborative Filtering (Biased SVD + Genre Profile)"

    prev_meta = cur.execute("SELECT model_version FROM model_metadata WHERE id = 1").fetchone()
    next_version = (prev_meta["model_version"] + 1) if prev_meta else 1
    trained_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    model["meta"] = {
        "trained_at": trained_at,
        "movielens_count": len(ml_rows),
        "website_count": len(web_rows),
        "total_ratings": len(records),
        "n_factors": model["n_factors"],
        "epochs": model["epochs"],
        "rmse": model["rmse"],
        "model_version": next_version,
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    cur.execute("UPDATE website_ratings SET included_in_model = 1")
    cur.execute(
        """
        INSERT OR REPLACE INTO model_metadata
        (id, trained_at, movielens_count, website_count, total_ratings, n_factors, epochs, rmse, model_version)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            trained_at,
            len(ml_rows),
            len(web_rows),
            len(records),
            model["n_factors"],
            model["epochs"],
            model["rmse"],
            next_version,
        ),
    )

    conn.commit()
    conn.close()
    sync_ai_recommendation(retrain_ai_model=True)
    return model["meta"]


def load_model():
    if not os.path.exists(MODEL_PATH):
        init_db(False)
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    if "user_genre_profiles" not in model:
        train_and_save_model()
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
    return model


def get_settings(cur=None):
    own_conn = False
    if cur is None:
        init_db(False)
        conn = get_conn()
        cur = conn.cursor()
        own_conn = True
    row = cur.execute("SELECT * FROM recommendation_settings WHERE id = 1").fetchone()
    if own_conn:
        conn.close()
    if not row:
        return {
            "default_alpha": 0.65,
            "default_genre_filter": "ALL",
            "home_limit": 4,
            "home_enabled": True,
            "section_title": "Gợi ý phim dành riêng cho bạn",
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
    d = dict(row)
    d["home_enabled"] = bool(d["home_enabled"])
    return d


def update_settings(payload):
    init_db(False)
    conn = get_conn()
    cur = conn.cursor()
    current = get_settings(cur)

    default_alpha = float(payload.get("default_alpha", current["default_alpha"]))
    default_alpha = max(0.0, min(1.0, default_alpha))
    default_genre = str(payload.get("default_genre_filter", current["default_genre_filter"]) or "ALL").strip()
    home_limit = max(2, min(12, int(payload.get("home_limit", current["home_limit"]))))
    home_enabled = 1 if payload.get("home_enabled", current["home_enabled"]) else 0
    section_title = str(payload.get("section_title", current["section_title"]) or "Gợi ý phim dành riêng cho bạn").strip()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cur.execute(
        """
        INSERT OR REPLACE INTO recommendation_settings
        (id, default_alpha, default_genre_filter, home_limit, home_enabled, section_title, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?)
        """,
        (default_alpha, default_genre, home_limit, home_enabled, section_title, now_str),
    )
    conn.commit()
    conn.close()
    return get_dashboard_state(int(payload.get("active_user_id", 1)), alpha=default_alpha, genre_filter=default_genre)


def get_viewer_recommendations(
    web_user_id=None,
    email=None,
    user_id=None,
    full_name=None,
    limit=None,
    alpha_override=None,
    genre_filter_override=None,
):
    """
    Endpoint công khai cho người xem trên Trang chủ / Chi tiết phim:
    - Trả về danh sách phim gợi ý theo đúng cấu hình Admin (recommendation_settings) & svd_model.pkl.
    - Loại trừ toàn bộ phim người xem đã xem / đặt vé / đánh giá (từ watch_history & website_ratings).
    - Nếu người xem vừa xem xong phim mới trên Web (chưa kịp retrain SVD), tự động tăng điểm cho phim cùng thể loại
      để đề xuất thêm phim phù hợp ngay lập tức!
    """
    init_db(False)
    model = load_model()
    conn = get_conn()
    cur = conn.cursor()

    settings = get_settings(cur)
    is_preview = (alpha_override is not None) or (genre_filter_override is not None)
    if not settings["home_enabled"] and not is_preview:
        conn.close()
        return {
            "enabled": False,
            "section_title": settings["section_title"],
            "is_personalized": False,
            "watched_movies": [],
            "recommendations": [],
            "applied_settings": settings,
        }

    is_logged_in = bool(web_user_id or email or user_id)
    uid = resolve_user_id(cur, user_id=user_id, web_user_id=web_user_id, email=email, full_name=full_name) if is_logged_in else None
    conn.commit()

    movies = [dict(r) for r in cur.execute("SELECT * FROM movies ORDER BY id").fetchall()]
    max_items = int(limit) if (limit is not None and int(limit) > 0) else int(settings["home_limit"])
    alpha_val = float(alpha_override) if alpha_override is not None else float(settings["default_alpha"])
    alpha_val = max(0.0, min(1.0, alpha_val))
    genre_filter = str(genre_filter_override if genre_filter_override is not None else settings["default_genre_filter"] or "ALL").strip()

    watched_rows = []
    watched_ids = set()
    recent_liked_genres = {}
    recent_watched_titles = []

    if uid is not None:
        watched_rows = [
            dict(r)
            for r in cur.execute(
                """
                SELECT wh.movie_id, wh.source, wh.watched_at, m.web_film_id, m.title, m.genres
                FROM watch_history wh
                JOIN movies m ON m.id = wh.movie_id
                WHERE wh.user_id = ?
                ORDER BY wh.watched_at DESC, wh.id DESC
                """,
                (uid,),
            ).fetchall()
        ]
        web_rated_rows = [
            dict(r)
            for r in cur.execute(
                """
                SELECT wr.movie_id, wr.rating, wr.source, wr.created_at, wr.included_in_model,
                       m.web_film_id, m.title, m.genres
                FROM website_ratings wr
                JOIN movies m ON m.id = wr.movie_id
                WHERE wr.user_id = ?
                ORDER BY wr.created_at DESC, wr.id DESC
                """,
                (uid,),
            ).fetchall()
        ]

        seen_w = set()
        for w in watched_rows:
            mid = w["movie_id"]
            watched_ids.add(mid)
            if mid not in seen_w:
                seen_w.add(mid)
                recent_watched_titles.append({"web_film_id": w["web_film_id"], "title": w["title"], "genres": w["genres"]})
            for g in w["genres"].split("|"):
                g = g.strip()
                if g:
                    recent_liked_genres[g] = recent_liked_genres.get(g, 0.0) + 1.0

        for wr in web_rated_rows:
            mid = wr["movie_id"]
            watched_ids.add(mid)
            if mid not in seen_w:
                seen_w.add(mid)
                recent_watched_titles.append({"web_film_id": wr["web_film_id"], "title": wr["title"], "genres": wr["genres"]})
            if float(wr["rating"]) >= 4.0:
                weight = 1.2 if not wr["included_in_model"] else 0.7
                for g in wr["genres"].split("|"):
                    g = g.strip()
                    if g:
                        recent_liked_genres[g] = recent_liked_genres.get(g, 0.0) + weight

    # Đọc điểm phổ biến MovieLens làm chuẩn fallback khi khách vãng lai chưa đăng nhập
    ml_avg_map = {}
    for row in cur.execute("SELECT movie_id, AVG(rating) AS avg_r, COUNT(*) AS cnt FROM movielens_ratings GROUP BY movie_id").fetchall():
        ml_avg_map[row["movie_id"]] = (round(row["avg_r"], 2), row["cnt"])

    candidates = []
    for m in movies:
        mid = m["id"]
        if mid in watched_ids:
            continue

        movie_gs = [g.strip() for g in m["genres"].split("|") if g.strip()]
        if genre_filter != "ALL" and genre_filter not in movie_gs:
            continue

        if uid is not None:
            pred = predict_with_model(model, uid, mid, alpha=alpha_val)
            base_score = pred["predicted_rating"]
            # Cộng hưởng thời gian thực theo tỷ lệ thể loại trùng khớp với các phim user đã xem
            rt_overlap = [g for g in movie_gs if recent_liked_genres.get(g, 0.0) > 0]
            overlap_ratio = len(rt_overlap) / max(len(movie_gs), 1)
            rt_boost = min(0.35, overlap_ratio * 0.25 + sum(recent_liked_genres.get(g, 0.0) for g in rt_overlap) * 0.04)
            raw_sort_score = base_score + rt_boost
            final_score = round(min(5.0, raw_sort_score), 3)

            matched_vi = [GENRE_VI_MAP.get(g, g) for g in (rt_overlap or pred["matched_genres"] or movie_gs[:2])]
            if recent_watched_titles:
                anchor = next(
                    (w["title"] for w in recent_watched_titles if any(g in w["genres"].split("|") for g in movie_gs)),
                    recent_watched_titles[0]["title"],
                )
                reason = f"Vì bạn đã xem {anchor} · Hợp sở thích {', '.join(matched_vi[:2])}"
            else:
                reason = f"Phù hợp thể loại {', '.join(matched_vi[:2])}"
        else:
            ml_avg, _ = ml_avg_map.get(mid, (4.0, 0))
            raw_sort_score = ml_avg
            final_score = round(ml_avg, 3)
            matched_vi = [GENRE_VI_MAP.get(g, g) for g in movie_gs[:2]]
            reason = f"Đề xuất nổi bật · Thể loại {', '.join(matched_vi)}"

        genres_vi = ", ".join(GENRE_VI_MAP.get(g, g) for g in movie_gs)
        candidates.append({
            "movie_id": mid,
            "web_film_id": m["web_film_id"],
            "title": m["title"],
            "genres": genres_vi,
            "genres_en": m["genres"],
            "score": final_score,
            "predicted_rating": final_score,
            "svd_score": pred["svd_score"] if uid is not None else final_score,
            "genre_score": pred["genre_score"] if uid is not None else final_score,
            "genre_match_pct": pred["genre_match_pct"] if uid is not None else 0.0,
            "_sort_score": raw_sort_score,
            "reason": reason,
        })

    candidates.sort(key=lambda x: x["_sort_score"], reverse=True)
    for c in candidates:
        c.pop("_sort_score", None)
    conn.close()

    return {
        "enabled": bool(settings["home_enabled"]),
        "section_title": settings["section_title"],
        "is_personalized": uid is not None,
        "watched_movies": recent_watched_titles,
        "recommendations": candidates[:max_items],
        "applied_settings": {
            "alpha": alpha_val,
            "genre_filter": genre_filter,
            "home_limit": max_items,
            "home_enabled": bool(settings["home_enabled"]),
            "section_title": settings["section_title"],
        },
    }


def record_website_activity(payload):
    """
    Ghi nhận hành vi từ bên Website Movix:
    - 'watched' / 'order_used' / 'order_confirmed' / 'booked': ghi vào watch_history + tín hiệu website_ratings
    - 'rated' / 'website_review': ghi điểm sao thực tế của khán giả vào website_ratings (included_in_model = 0)
    """
    init_db(False)
    conn = get_conn()
    cur = conn.cursor()

    uid = resolve_user_id(
        cur,
        user_id=payload.get("user_id"),
        web_user_id=payload.get("web_user_id"),
        email=payload.get("email"),
        full_name=payload.get("full_name"),
    )

    genres_str = normalize_genres_from_web(payload.get("category_ids"), payload.get("genres"))
    mid = resolve_movie_id(
        cur,
        movie_id=payload.get("movie_id"),
        web_film_id=payload.get("web_film_id"),
        title=payload.get("film_title") or payload.get("title"),
        genres=genres_str,
        description=payload.get("description", ""),
    )

    if mid is None:
        conn.close()
        raise ValueError("Không xác định được bộ phim cần ghi nhận")

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    event_type = payload.get("event_type", "watched")

    if event_type in ("watched", "booked", "order_used", "order_confirmed"):
        cur.execute(
            """
            INSERT INTO watch_history (user_id, movie_id, source, order_id, watched_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, movie_id) DO UPDATE SET
                source = excluded.source,
                order_id = CASE WHEN excluded.order_id != '' THEN excluded.order_id ELSE watch_history.order_id END,
                watched_at = excluded.watched_at
            """,
            (uid, mid, event_type, str(payload.get("order_id") or ""), now_str),
        )
        # Ghi nhận tín hiệu ưa thích ngầm (4.5 sao) vào website_ratings nếu user chưa tự chấm điểm phim này
        existing_wr = cur.execute(
            "SELECT id, source FROM website_ratings WHERE user_id = ? AND movie_id = ?",
            (uid, mid),
        ).fetchone()
        if not existing_wr:
            cur.execute(
                """
                INSERT INTO website_ratings (user_id, movie_id, rating, comment, source, created_at, included_in_model)
                VALUES (?, ?, ?, ?, ?, ?, 0)
                """,
                (
                    uid,
                    mid,
                    float(payload.get("rating") or 4.5),
                    str(payload.get("comment") or "Đã xem xong / Đặt vé trên website Movix"),
                    event_type,
                    now_str,
                ),
            )
    elif event_type in ("rated", "website_review"):
        rating_val = float(payload.get("rating") or 5.0)
        rating_val = max(1.0, min(5.0, rating_val))
        cur.execute(
            """
            INSERT INTO website_ratings (user_id, movie_id, rating, comment, source, created_at, included_in_model)
            VALUES (?, ?, ?, ?, 'website_review', ?, 0)
            ON CONFLICT(user_id, movie_id) DO UPDATE SET
                rating = excluded.rating,
                comment = excluded.comment,
                source = 'website_review',
                created_at = excluded.created_at,
                included_in_model = 0
            """,
            (uid, mid, rating_val, str(payload.get("comment") or "").strip(), now_str),
        )
        # Nếu đánh giá >= 1 sao tức là đã xem/trải nghiệm phim -> đồng thời lưu watch_history
        cur.execute(
            """
            INSERT OR IGNORE INTO watch_history (user_id, movie_id, source, order_id, watched_at)
            VALUES (?, ?, 'website_review', '', ?)
            """,
            (uid, mid, now_str),
        )
    elif event_type == "unwatch":
        cur.execute("DELETE FROM watch_history WHERE user_id = ? AND movie_id = ?", (uid, mid))
        cur.execute(
            "DELETE FROM website_ratings WHERE user_id = ? AND movie_id = ? AND source IN ('watched', 'booked', 'order_used', 'order_confirmed')",
            (uid, mid),
        )

    conn.commit()
    conn.close()
    sync_ai_recommendation(retrain_ai_model=False)

    return get_viewer_recommendations(
        web_user_id=payload.get("web_user_id"),
        email=payload.get("email"),
        user_id=uid,
    )


def sync_from_side_a(payload):
    """
    Đồng bộ danh sách phim, tài khoản, đơn hàng & bình luận từ localStorage Movix sang SQLite.
    """
    init_db(False)
    conn = get_conn()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for f in payload.get("films", []):
        wf_id = f.get("id")
        if not wf_id:
            continue
        genres_str = normalize_genres_from_web(f.get("categoryIds"), f.get("genre"))
        existing = cur.execute("SELECT id FROM movies WHERE web_film_id = ?", (wf_id,)).fetchone()
        if existing:
            cur.execute(
                "UPDATE movies SET title = ?, genres = ?, description = ? WHERE id = ?",
                (f.get("title", ""), genres_str, f.get("description", ""), existing["id"]),
            )
        else:
            cur.execute(
                "INSERT INTO movies (web_film_id, title, genres, year, movielens_ref, description) VALUES (?, ?, ?, 2026, 'Movix Admin', ?)",
                (wf_id, f.get("title", "Phim mới"), genres_str, f.get("description", "")),
            )

    for u in payload.get("users", []):
        resolve_user_id(
            cur,
            web_user_id=u.get("id"),
            email=u.get("email"),
            full_name=u.get("fullName") or u.get("name"),
            username=u.get("username"),
            role=u.get("role", "customer"),
        )

    active_order_pairs = set()
    for ord_item in payload.get("orders", []):
        status = ord_item.get("orderStatus")
        if status not in ("confirmed", "used"):
            continue
        uid = resolve_user_id(cur, web_user_id=ord_item.get("userId"), email=ord_item.get("email"), full_name=ord_item.get("userName"))
        mid = resolve_movie_id(cur, web_film_id=ord_item.get("filmId"), title=ord_item.get("filmTitle"))
        if uid and mid:
            active_order_pairs.add((uid, mid))
            src = "order_used" if status == "used" else "order_confirmed"
            cur.execute(
                """
                INSERT INTO watch_history (user_id, movie_id, source, order_id, watched_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(user_id, movie_id) DO UPDATE SET
                    source = CASE WHEN excluded.source = 'order_used' THEN 'order_used' ELSE watch_history.source END
                """,
                (uid, mid, src, str(ord_item.get("id") or ""), now_str),
            )

    existing_order_watches = cur.execute(
        "SELECT id, user_id, movie_id FROM watch_history WHERE source IN ('order_confirmed', 'order_used', 'booked')"
    ).fetchall()
    for row in existing_order_watches:
        if (row["user_id"], row["movie_id"]) not in active_order_pairs:
            cur.execute("DELETE FROM watch_history WHERE id = ?", (row["id"],))

    for cm in payload.get("comments", []):
        uid = resolve_user_id(cur, web_user_id=cm.get("userId"), full_name=cm.get("userName"))
        mid = resolve_movie_id(cur, web_film_id=cm.get("filmId"), title=cm.get("filmTitle"))
        if uid and mid and cm.get("rate"):
            rating_val = max(1.0, min(5.0, float(cm["rate"])))
            # Kiểm tra xem có phải dữ liệu seed ban đầu không
            is_seed = str(cm.get("id", "")) in {"cm-1", "cm-2", "cm-3", "cm-4"}
            if not is_seed:
                cur.execute(
                    """
                    INSERT OR IGNORE INTO website_ratings (user_id, movie_id, rating, comment, source, created_at, included_in_model)
                    VALUES (?, ?, ?, ?, 'website_review', ?, 0)
                    """,
                    (uid, mid, rating_val, str(cm.get("content") or ""), now_str),
                )

    conn.commit()
    conn.close()
    sync_ai_recommendation(retrain_ai_model=False)
    return {"ok": True}


def get_dashboard_state(active_user_id=1, alpha=None, genre_filter=None):
    init_db(False)
    model = load_model()
    conn = get_conn()
    cur = conn.cursor()

    settings = get_settings(cur)
    raw_alpha = alpha if alpha is not None else settings["default_alpha"]
    try:
        alpha_float = float(raw_alpha)
        if math.isnan(alpha_float) or math.isinf(alpha_float):
            alpha_float = float(settings["default_alpha"])
    except (ValueError, TypeError):
        alpha_float = float(settings["default_alpha"])
    alpha_val = max(0.0, min(1.0, alpha_float))
    genre_filter_clean = str(genre_filter if genre_filter is not None else settings["default_genre_filter"] or "ALL").strip()

    users = [dict(r) for r in cur.execute("SELECT id, web_user_id, username, full_name, email, persona, role FROM users ORDER BY id").fetchall()]
    movies = [dict(r) for r in cur.execute("SELECT * FROM movies ORDER BY id").fetchall()]

    ml_rows = [
        dict(r)
        for r in cur.execute(
            """
            SELECT mr.id, mr.user_id, mr.movie_id, mr.rating, mr.ml_timestamp,
                   m.title AS movie_title, m.genres AS movie_genres, m.web_film_id,
                   COALESCE(u.full_name, 'MovieLens User #' || mr.user_id) AS user_name
            FROM movielens_ratings mr
            JOIN movies m ON m.id = mr.movie_id
            LEFT JOIN users u ON u.id = mr.user_id
            ORDER BY mr.user_id, mr.rating DESC
            """
        ).fetchall()
    ]

    web_rows = [
        dict(r)
        for r in cur.execute(
            """
            SELECT wr.id, wr.user_id, wr.movie_id, wr.rating, wr.comment, wr.source, wr.created_at, wr.included_in_model,
                   m.title AS movie_title, m.genres AS movie_genres, m.web_film_id,
                   u.full_name AS user_name, u.username AS username
            FROM website_ratings wr
            JOIN movies m ON m.id = wr.movie_id
            JOIN users u ON u.id = wr.user_id
            ORDER BY wr.created_at DESC, wr.id DESC
            """
        ).fetchall()
    ]

    watch_rows = [
        dict(r)
        for r in cur.execute(
            """
            SELECT wh.id, wh.user_id, wh.movie_id, wh.source, wh.order_id, wh.watched_at,
                   m.title AS movie_title, m.title AS title,
                   m.genres AS movie_genres, m.genres AS genres, m.web_film_id,
                   u.full_name AS user_name, u.username AS username
            FROM watch_history wh
            JOIN movies m ON m.id = wh.movie_id
            JOIN users u ON u.id = wh.user_id
            ORDER BY wh.watched_at DESC, wh.id DESC
            """
        ).fetchall()
    ]

    meta_row = cur.execute("SELECT * FROM model_metadata WHERE id = 1").fetchone()
    meta = dict(meta_row) if meta_row else model.get("meta", {})
    meta["model_file"] = "svd_model.pkl"
    meta["model_size_bytes"] = os.path.getsize(MODEL_PATH) if os.path.exists(MODEL_PATH) else 0
    meta["db_file"] = "movix_cf.db"
    meta["db_size_bytes"] = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0
    meta["algorithm"] = model.get("algorithm", "Hybrid CF (SVD + Genre)")

    pending_retrain_count = cur.execute("SELECT COUNT(*) FROM website_ratings WHERE included_in_model = 0").fetchone()[0]

    def build_recommendations_for_user(uid, apply_genre_filter=False):
        user_ml = {r["movie_id"]: r["rating"] for r in ml_rows if r["user_id"] == uid}
        user_web = {r["movie_id"]: {"rating": r["rating"], "included": r["included_in_model"], "source": r["source"]} for r in web_rows if r["user_id"] == uid}
        user_watched = {r["movie_id"]: r for r in watch_rows if r["user_id"] == uid}

        ml_stats = {}
        for r in ml_rows:
            mid = r["movie_id"]
            ml_stats.setdefault(mid, []).append(r["rating"])

        predictions = []
        for m in movies:
            mid = m["id"]
            pred_info = predict_with_model(model, uid, mid, alpha=alpha_val)
            ml_list = ml_stats.get(mid, [])
            ml_avg = round(sum(ml_list) / len(ml_list), 2) if ml_list else 0.0
            web_entry = user_web.get(mid)
            watch_entry = user_watched.get(mid)
            movie_gs = [g.strip() for g in m["genres"].split("|") if g.strip()]

            predictions.append({
                "movie_id": mid,
                "web_film_id": m["web_film_id"],
                "title": m["title"],
                "genres": m["genres"],
                "year": m["year"],
                "movielens_ref": m["movielens_ref"],
                "description": m["description"],
                "predicted_rating": pred_info["predicted_rating"],
                "svd_score": pred_info["svd_score"],
                "genre_score": pred_info["genre_score"],
                "genre_match_pct": pred_info["genre_match_pct"],
                "matched_genres": pred_info["matched_genres"],
                "movielens_avg": ml_avg,
                "movielens_count": len(ml_list),
                "user_movielens_rating": user_ml.get(mid),
                "user_website_rating": web_entry["rating"] if web_entry else None,
                "website_included_in_model": bool(web_entry["included"]) if web_entry else None,
                "user_watched": bool(watch_entry),
                "watched_source": watch_entry["source"] if watch_entry else None,
                "already_rated": (mid in user_ml) or (mid in user_web) or (mid in user_watched),
                "matches_filter": (genre_filter_clean == "ALL") or (genre_filter_clean in movie_gs),
            })

        top_candidates = [p for p in predictions if not p["already_rated"]]
        if apply_genre_filter and genre_filter_clean != "ALL":
            top_candidates = [p for p in top_candidates if p["matches_filter"]]
        top_unrated = sorted(top_candidates, key=lambda x: x["predicted_rating"], reverse=True)
        all_ranked = sorted(predictions, key=lambda x: x["predicted_rating"], reverse=True)

        u_prof = model.get("user_genre_profiles", {}).get(uid, {})
        watched_list = [r for r in watch_rows if r["user_id"] == uid]
        return {
            "user_id": uid,
            "top_recommendations": top_unrated[:6],
            "all_predictions": all_ranked,
            "genre_affinity": u_prof.get("affinity", []),
            "watched_list": watched_list,
        }

    active_recs = build_recommendations_for_user(active_user_id, apply_genre_filter=True)
    user1_recs = build_recommendations_for_user(1, apply_genre_filter=False)
    user2_recs = build_recommendations_for_user(2, apply_genre_filter=False)

    conn.close()

    return {
        "users": users,
        "movies": movies,
        "all_genres": model.get("all_genres", []),
        "active_user_id": active_user_id,
        "alpha": alpha_val,
        "genre_filter": genre_filter_clean,
        "settings": settings,
        "user_genre_affinity": active_recs["genre_affinity"],
        "user_watched_movies": active_recs["watched_list"],
        "watch_history": watch_rows,
        "movielens_ratings": ml_rows,
        "website_ratings": web_rows,
        "pending_retrain_count": pending_retrain_count,
        "model_info": meta,
        "recommendations": active_recs["top_recommendations"],
        "all_predictions": active_recs["all_predictions"],
        "comparison": {
            "user1_top": user1_recs["top_recommendations"][:5],
            "user2_top": user2_recs["top_recommendations"][:5],
        },
    }


def add_website_rating(user_id, movie_id, rating, comment="", alpha=0.65, genre_filter="ALL"):
    init_db(False)
    rating = float(rating)
    if rating < 1.0 or rating > 5.0:
        raise ValueError("Rating must be between 1.0 and 5.0")

    conn = get_conn()
    cur = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur.execute(
        """
        INSERT INTO website_ratings (user_id, movie_id, rating, comment, source, created_at, included_in_model)
        VALUES (?, ?, ?, ?, 'admin_test', ?, 0)
        ON CONFLICT(user_id, movie_id) DO UPDATE SET
            rating = excluded.rating,
            comment = excluded.comment,
            source = 'admin_test',
            created_at = excluded.created_at,
            included_in_model = 0
        """,
        (int(user_id), int(movie_id), rating, comment.strip(), now_str),
    )
    cur.execute(
        """
        INSERT OR IGNORE INTO watch_history (user_id, movie_id, source, order_id, watched_at)
        VALUES (?, ?, 'admin_test', '', ?)
        """,
        (int(user_id), int(movie_id), now_str),
    )
    conn.commit()
    conn.close()
    sync_ai_recommendation(retrain_ai_model=False)
    return get_dashboard_state(int(user_id), alpha=alpha, genre_filter=genre_filter)


def reset_website_ratings(active_user_id=1, alpha=0.65, genre_filter="ALL"):
    init_db(False)
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM website_ratings")
    cur.execute("DELETE FROM watch_history WHERE source NOT IN ('order_confirmed', 'order_used')")
    conn.commit()
    conn.close()
    train_and_save_model()
    return get_dashboard_state(int(active_user_id), alpha=alpha, genre_filter=genre_filter)


def login_demo_user(username, password):
    init_db(False)
    conn = get_conn()
    cur = conn.cursor()
    row = cur.execute(
        "SELECT id, web_user_id, username, full_name, email, persona, role FROM users WHERE (username = ? OR email = ?) AND password = ?",
        (username.strip(), username.strip(), password.strip()),
    ).fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "state"
    if cmd == "init":
        init_db(force_reset=False)
        print(json.dumps({"ok": True, "message": "Unified SQLite & svd_model.pkl initialized"}, ensure_ascii=False))
    elif cmd == "state":
        uid = int(sys.argv[2]) if len(sys.argv) > 2 else 1
        alpha_arg = float(sys.argv[3]) if (len(sys.argv) > 3 and sys.argv[3] not in ("", "null", "None")) else None
        genre_arg = sys.argv[4] if (len(sys.argv) > 4 and sys.argv[4] not in ("", "null", "None")) else None
        print(json.dumps(get_dashboard_state(uid, alpha=alpha_arg, genre_filter=genre_arg), ensure_ascii=False))
    elif cmd == "viewer_recs":
        payload = json.loads(sys.stdin.read() or "{}")
        res = get_viewer_recommendations(
            web_user_id=payload.get("web_user_id"),
            email=payload.get("email"),
            user_id=payload.get("user_id"),
            full_name=payload.get("full_name"),
            limit=payload.get("limit"),
            alpha_override=payload.get("alpha"),
            genre_filter_override=payload.get("genre_filter"),
        )
        print(json.dumps(res, ensure_ascii=False))
    elif cmd == "activity":
        payload = json.loads(sys.stdin.read() or "{}")
        print(json.dumps(record_website_activity(payload), ensure_ascii=False))
    elif cmd == "sync":
        payload = json.loads(sys.stdin.read() or "{}")
        print(json.dumps(sync_from_side_a(payload), ensure_ascii=False))
    elif cmd == "settings":
        payload = json.loads(sys.stdin.read() or "{}")
        print(json.dumps(update_settings(payload), ensure_ascii=False))
    elif cmd == "rate":
        payload = json.loads(sys.stdin.read() or "{}")
        res = add_website_rating(
            payload["user_id"],
            payload["movie_id"],
            payload["rating"],
            payload.get("comment", ""),
            alpha=payload.get("alpha", 0.65),
            genre_filter=payload.get("genre_filter", "ALL"),
        )
        print(json.dumps(res, ensure_ascii=False))
    elif cmd == "retrain":
        uid = int(sys.argv[2]) if len(sys.argv) > 2 else 1
        alpha_arg = float(sys.argv[3]) if (len(sys.argv) > 3 and sys.argv[3] not in ("", "null", "None")) else None
        genre_arg = sys.argv[4] if (len(sys.argv) > 4 and sys.argv[4] not in ("", "null", "None")) else None
        meta = train_and_save_model()
        state = get_dashboard_state(uid, alpha=alpha_arg, genre_filter=genre_arg)
        state["retrained_meta"] = meta
        print(json.dumps(state, ensure_ascii=False))
    elif cmd == "reset":
        uid = int(sys.argv[2]) if len(sys.argv) > 2 else 1
        alpha_arg = float(sys.argv[3]) if (len(sys.argv) > 3 and sys.argv[3] not in ("", "null", "None")) else None
        genre_arg = sys.argv[4] if (len(sys.argv) > 4 and sys.argv[4] not in ("", "null", "None")) else None
        print(json.dumps(reset_website_ratings(uid, alpha=alpha_arg, genre_filter=genre_arg), ensure_ascii=False))
    elif cmd == "login":
        payload = json.loads(sys.stdin.read() or "{}")
        user = login_demo_user(payload.get("username", ""), payload.get("password", ""))
        if not user:
            print(json.dumps({"error": "Sai tài khoản hoặc mật khẩu demo"}, ensure_ascii=False))
            sys.exit(1)
        print(json.dumps({"user": user}, ensure_ascii=False))
