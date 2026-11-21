import csv
import os
import sqlite3
from config import MOVIES_CSV_PATH, RATINGS_CSV_PATH, SQLITE_DB_PATH

# Ánh xạ poster & thể loại tiếng Việt khớp 1-1 với INITIAL_FILMS trên Movix
FILM_POSTER_MAP = {
    "film-1": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    "film-2": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    "film-3": "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    "film-4": "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80",
    "film-5": "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80",
    "film-6": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    "film-7": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
    "film-8": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
    "film-9": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    "film-10": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    "film-11": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    "film-12": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
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


def format_genres_vi(genres_pipe: str) -> str:
    parts = [p.strip() for p in str(genres_pipe or "").split("|") if p.strip()]
    return ", ".join(GENRE_VI_MAP.get(p, p) for p in parts) or "Đang cập nhật"


def export_from_sqlite(include_movielens_seed: bool = True) -> dict:
    """
    Trích xuất dữ liệu thật từ SQLite (movix_cf.db) sang AI_Recommendation/ratings.csv và movies.csv.
    - user_id dùng mã định danh chuẩn của website (usr-1, usr-2, usr-3...) hoặc ml-101.. cho tập tham chiếu MovieLens.
    - movie_id dùng mã phim chuẩn của website (film-1..film-12).
    """
    if not os.path.exists(SQLITE_DB_PATH):
        return {"ok": False, "error": f"Không tìm thấy database tại {SQLITE_DB_PATH}"}

    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    users_map = {
        r["id"]: (r["web_user_id"] or f"usr-{r['id']}")
        for r in cur.execute("SELECT id, web_user_id FROM users").fetchall()
    }
    movies_rows = cur.execute(
        "SELECT id, web_film_id, title, genres, poster_url, status FROM movies ORDER BY id"
    ).fetchall() if _has_col(cur, "movies", "poster_url") else cur.execute(
        "SELECT id, web_film_id, title, genres FROM movies ORDER BY id"
    ).fetchall()

    movies_map = {}
    with open(MOVIES_CSV_PATH, "w", newline="", encoding="utf-8") as mf:
        writer = csv.writer(mf)
        writer.writerow(["movie_id", "title", "genres", "genres_en", "poster_url", "status"])
        for m in movies_rows:
            wf_id = m["web_film_id"] or f"film-{m['id']}"
            movies_map[m["id"]] = wf_id
            poster_url = (m["poster_url"] if "poster_url" in m.keys() and m["poster_url"] else "") or FILM_POSTER_MAP.get(
                wf_id,
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
            )
            status = m["status"] if "status" in m.keys() and m["status"] else "Đang chiếu"
            writer.writerow([wf_id, m["title"], format_genres_vi(m["genres"]), m["genres"], poster_url, status])

    combined = {}
    if include_movielens_seed:
        for row in cur.execute("SELECT user_id, movie_id, rating FROM movielens_ratings ORDER BY user_id, movie_id").fetchall():
            uid_str = users_map.get(row["user_id"], f"ml-{row['user_id']}")
            mid_str = movies_map.get(row["movie_id"], f"film-{row['movie_id']}")
            combined[(uid_str, mid_str)] = round(float(row["rating"]), 1)

    for row in cur.execute("SELECT user_id, movie_id, rating FROM website_ratings ORDER BY id").fetchall():
        uid_str = users_map.get(row["user_id"], f"usr-{row['user_id']}")
        mid_str = movies_map.get(row["movie_id"], f"film-{row['movie_id']}")
        combined[(uid_str, mid_str)] = round(float(row["rating"]), 1)

    with open(RATINGS_CSV_PATH, "w", newline="", encoding="utf-8") as rf:
        writer = csv.writer(rf)
        writer.writerow(["user_id", "movie_id", "rating"])
        for (uid_str, mid_str), rating in sorted(combined.items()):
            writer.writerow([uid_str, mid_str, rating])

    conn.close()
    return {
        "ok": True,
        "ratings_count": len(combined),
        "movies_count": len(movies_rows),
        "ratings_csv": RATINGS_CSV_PATH,
        "movies_csv": MOVIES_CSV_PATH,
    }


def _has_col(cur, table: str, col: str) -> bool:
    cols = {r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()}
    return col in cols


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Xuất dữ liệu đánh giá từ SQLite sang ratings.csv & movies.csv")
    parser.add_argument("--website-only", action="store_true", help="Chỉ xuất đánh giá từ website_ratings (không gồm MovieLens seed)")
    args = parser.parse_args()
    res = export_from_sqlite(include_movielens_seed=not args.website_only)
    print(json.dumps(res, ensure_ascii=False, indent=2))
