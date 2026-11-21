from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from svd_engine import (
    add_website_rating,
    get_dashboard_state,
    init_db,
    login_demo_user,
    reset_website_ratings,
    train_and_save_model,
)

app = Flask(__name__)
app.secret_key = "movix-collaborative-filtering-svd-demo-secret"

# Đảm bảo SQLite và svd_model.pkl được khởi tạo khi Flask chạy
init_db(False)


@app.route("/", methods=["GET"])
def index():
    active_user_id = session.get("user_id", 1)
    alpha = float(request.args.get("alpha", session.get("alpha", 0.65)))
    genre = request.args.get("genre", session.get("genre", "ALL"))
    session["alpha"] = alpha
    session["genre"] = genre
    state = get_dashboard_state(active_user_id, alpha=alpha, genre_filter=genre)
    message = request.args.get("msg", "")
    error = request.args.get("err", "")
    return render_template("index.html", state=state, message=message, error=error)


@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username", "")
    password = request.form.get("password", "")
    user = login_demo_user(username, password)
    if not user:
        return redirect(url_for("index", err="Sai tài khoản hoặc mật khẩu demo (mật khẩu mặc định: 123)"))
    session["user_id"] = user["id"]
    return redirect(url_for("index", msg=f"Đã đăng nhập tài khoản {user['full_name']} (ID: {user['id']})"))


@app.route("/switch-user/<int:user_id>", methods=["POST", "GET"])
def switch_user(user_id):
    session["user_id"] = user_id
    return redirect(url_for("index", msg=f"Đã chuyển sang User ID {user_id}"))


@app.route("/rate", methods=["POST"])
def rate_movie():
    user_id = int(request.form.get("user_id") or session.get("user_id", 1))
    movie_id = int(request.form.get("movie_id"))
    rating = float(request.form.get("rating"))
    comment = request.form.get("comment", "")
    add_website_rating(
        user_id,
        movie_id,
        rating,
        comment,
        alpha=session.get("alpha", 0.65),
        genre_filter=session.get("genre", "ALL"),
    )
    return redirect(
        url_for(
            "index",
            msg=f"Đã lưu đánh giá mới vào SQLite (website_ratings) cho User {user_id}. Hãy bấm 'Huấn luyện lại svd_model.pkl' để mô hình cập nhật!",
        )
    )


@app.route("/retrain", methods=["POST"])
def retrain():
    meta = train_and_save_model()
    return redirect(
        url_for(
            "index",
            msg=f"Đã huấn luyện lại svd_model.pkl v{meta['model_version']} (MovieLens: {meta['movielens_count']} + Website: {meta['website_count']}, RMSE: {meta['rmse']})",
        )
    )


@app.route("/reset", methods=["POST"])
def reset():
    active_user_id = session.get("user_id", 1)
    reset_website_ratings(
        active_user_id,
        alpha=session.get("alpha", 0.65),
        genre_filter=session.get("genre", "ALL"),
    )
    return redirect(url_for("index", msg="Đã xóa đánh giá mới trên website và huấn luyện lại mô hình gốc MovieLens."))


@app.route("/api/state", methods=["GET"])
def api_state():
    uid = int(request.args.get("user_id") or session.get("user_id", 1))
    alpha = float(request.args.get("alpha", session.get("alpha", 0.65)))
    genre = request.args.get("genre", session.get("genre", "ALL"))
    return jsonify(get_dashboard_state(uid, alpha=alpha, genre_filter=genre))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
