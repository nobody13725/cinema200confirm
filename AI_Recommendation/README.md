# AI Recommendation — Movix SVD (Collaborative Filtering)

Module gợi ý phim sử dụng thuật toán **Matrix Factorization với SVD** (thư viện `scikit-surprise`) theo quy trình chuẩn:

**OFFLINE TRAINING → SAVE MODEL → LOAD MODEL → ONLINE RECOMMENDATION**

---

## 1. Cấu trúc thư mục

```text
AI_Recommendation/
├── ratings.csv          # Dữ liệu đánh giá (user_id, movie_id, rating từ 1–5)
├── movies.csv           # Danh mục phim (poster, tên phim, thể loại) đồng bộ từ Movix
├── config.py            # Cấu hình tham số SVD (n_factors, n_epochs, lr_all, reg_all, test_size)
├── sync_data.py         # Trích xuất dữ liệu đánh giá thật từ SQLite (movix_cf.db) sang CSV
├── train_model.py       # Huấn luyện offline SVD + lưu model vào model/svd_model.pkl
├── evaluate_model.py    # Đánh giá RMSE và MAE trên tập Test đã chia
├── recommend.py         # Tải model đã lưu để dự đoán Top 5 phim + fallback (cold-start)
├── api.py               # FastAPI service: GET /api/recommendations/{user_id}
├── model/
│   └── svd_model.pkl    # File model SVD đã huấn luyện
└── requirements.txt     # Thư viện Python cần cài
```

---

## 2. Cài đặt thư viện Python

Yêu cầu Python 3.10+ (khuyên dùng môi trường ảo `venv` hoặc `conda`):

```bash
cd AI_Recommendation
python -m venv .venv
# Linux / macOS:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

pip install -r requirements.txt
```

---

## 3. Đồng bộ dữ liệu & Huấn luyện Offline (`train_model.py`)

```bash
# (Tùy chọn) Xuất lại ratings.csv & movies.csv mới nhất từ SQLite movix_cf.db
python sync_data.py

# Huấn luyện với tham số mặc định trong config.py
python train_model.py

# Hoặc tùy chỉnh số factors, epochs, learning rate, regularization
python train_model.py --n-factors 20 --n-epochs 60 --lr-all 0.01 --reg-all 0.05
```

Kết quả sẽ hiển thị **số user, số phim, số lượt đánh giá, thời gian train** và lưu mô hình tại `AI_Recommendation/model/svd_model.pkl`.

---

## 4. Đánh giá mô hình (`evaluate_model.py`)

```bash
python evaluate_model.py
```

Hiển thị các chỉ số đánh giá khách quan trên tập Test đã chia:
- **RMSE** (Root Mean Squared Error)
- **MAE** (Mean Absolute Error)

---

## 5. Kiểm thử dự đoán & Chạy FastAPI

### Chạy dự đoán trực tiếp qua CLI (`recommend.py`)
```bash
python recommend.py usr-1
python recommend.py usr-2
python recommend.py nguoi_dung_moi   # Thử kịch bản cold-start
```

### Khởi chạy FastAPI ở cổng `8000`
```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Kiểm tra API:
- `GET http://127.0.0.1:8000/api/recommendations/usr-1`
- `GET http://127.0.0.1:8000/api/recommendations/usr-2`
- Swagger UI: `http://127.0.0.1:8000/docs`

> Khi FastAPI chạy ở cổng `8000`, backend Movix (`server.ts`) tự động chuyển tiếp `GET /api/recommendations/:userId` sang FastAPI. Nếu FastAPI chưa khởi động, `server.ts` vẫn tự động gọi `recommend.py` tải trực tiếp file `model/svd_model.pkl` (không train lại) để đảm bảo website luôn hoạt động ổn định.

---

## 6. Kịch bản Demo 7 bước

1. **Kiểm tra dữ liệu đầu vào:** Mở `AI_Recommendation/ratings.csv` và `movies.csv`.
2. **Train offline:** Chạy `python train_model.py`, quan sát số user, số phim, số lượt đánh giá và thời gian train.
3. **Đánh giá độ chính xác:** Chạy `python evaluate_model.py`, quan sát `RMSE` và `MAE`.
4. **Kiểm tra file model:** Xác nhận file `AI_Recommendation/model/svd_model.pkl` đã được tạo.
5. **Khởi động API & Website:** Chạy `uvicorn api:app --port 8000` và `npm run dev` ở thư mục gốc (`http://localhost:3000`).
6. **So sánh 2 tài khoản trên website:**
   - Đăng nhập **Tài khoản 1**: `thangnguyen13725@gmail.com` / `123` (`usr-1` — từng đánh giá 5★ *Avatar: The Way of Water*) → Trang chủ hiển thị Top 5 gợi ý thiên về Sci-Fi / Hành động.
   - Đăng xuất và đăng nhập **Tài khoản 2**: `minhanh@gmail.com` / `123` (`usr-3` — từng đánh giá 5★ *Lật Mặt 7: Một Điều Ước*) → Trang chủ hiển thị Top 5 gợi ý thiên về Gia đình / Tâm lý Việt.
7. **Thử nghiệm đánh giá mới:** Đánh giá sao thêm 1 bộ phim trong trang Chi tiết phim (`MovieDetail`) → Chạy lại `python sync_data.py && python train_model.py` (hoặc bấm Huấn luyện lại trong Admin) rồi gọi `POST http://127.0.0.1:8000/api/reload-model` để cập nhật gợi ý mới.
