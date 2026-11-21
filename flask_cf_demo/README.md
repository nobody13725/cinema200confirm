# Movix Collaborative Filtering Demo (Flask + SQLite + MovieLens SVD)

## Thành phần hệ thống
- `app.py`: Website Flask chạy độc lập (cổng 5000), sử dụng session đăng nhập và hiển thị phân tách dữ liệu.
- `svd_engine.py`: Thuật toán Biased SVD (Matrix Factorization qua SGD) huấn luyện trên dữ liệu MovieLens + đánh giá website và lưu thành `svd_model.pkl`.
- `movix_cf.db`: Database SQLite chứa:
  - `users`: 4 tài khoản demo (`user1`, `user2`, `user3`, `user4`, mật khẩu mặc định `123`).
  - `movies`: 20 phim kinh điển từ tập dữ liệu MovieLens.
  - `movielens_ratings`: Dữ liệu đánh giá mẫu có sẵn từ MovieLens (216 ratings).
  - `website_ratings`: Dữ liệu đánh giá mới phát sinh trên website, kèm cột `included_in_model` (0 = chờ huấn luyện lại, 1 = đã cập nhật vào `svd_model.pkl`).
  - `model_metadata`: Thông số phiên bản, RMSE, thời gian huấn luyện của `svd_model.pkl`.
- `svd_model.pkl`: File mô hình SVD đã huấn luyện và serialize bằng `pickle`.

## Cách chạy Flask độc lập trên máy cá nhân
```bash
cd flask_cf_demo
pip install -r requirements.txt
python app.py
```
Truy cập: `http://127.0.0.1:5000`
