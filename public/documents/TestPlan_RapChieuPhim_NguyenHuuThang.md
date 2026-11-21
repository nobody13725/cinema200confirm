# KẾ HOẠCH KIỂM THỬ PHẦN MỀM (TEST PLAN)
## DỰ ÁN: WEBSITE ĐẶT VÉ XEM PHIM CINEVERSE / MOVIX CINEMAX
**Học phần:** Kiểm thử và Đảm bảo Chất lượng Phần mềm (CS 462 A) - Đại học Duy Tân  
**Giảng viên hướng dẫn:** ThS. Lương Thị Thu Phương  
**Sinh viên thực hiện:** Nguyễn Hữu Thăng - 1968  
**Thời gian thực hiện:** 25/10/2026 - 26/10/2026  
**Quy mô:** 65 Test Cases (trong đó có đúng 8 Test Case cho Trợ lý Điện Ảnh Chatbot AI)

---

### I. GIỚI THIỆU
#### 1. Mục đích
- Đánh giá toàn diện chất lượng hoạt động của hệ thống Website Đặt Vé Xem Phim Cineverse.
- Đảm bảo các luồng chức năng trọng yếu (đăng ký, đăng nhập, tìm kiếm, chọn suất chiếu, chọn ghế, đặt vé, áp dụng voucher, quản trị và tư vấn phim AI) vận hành chính xác và ổn định.
- Thiết kế 65 test case đơn giản, dễ test, ghi nhận và xử lý triệt để 6 lỗi thực tế.

#### 2. Tổng quan hệ thống
Website Cineverse là nền tảng bán vé xem phim trực tuyến hiện đại, gồm phân hệ khách hàng đặt vé và phân hệ quản trị rạp chiếu, tích hợp Trợ lý Trí tuệ Nhân tạo Chatbot AI tư vấn điện ảnh.

#### 3. Phạm vi kiểm thử
- **10 Phân hệ chức năng chính (65 Test Case):**
  1. `MOV - Phim`: Danh sách phim, tìm kiếm, lọc thể loại, xem trailer, nhãn độ tuổi (7 TCs)
  2. `SCH - Lịch chiếu`: Thanh lịch 7 ngày, danh sách suất, khóa giờ quá khứ (6 TCs)
  3. `AUTH - Đăng ký, đăng nhập`: Đăng ký, đăng nhập, đăng xuất, lưu phiên (8 TCs - gồm BUG-01)
  4. `PW - Mật khẩu & Quên mật khẩu`: Độ dài mật khẩu, OTP khôi phục (5 TCs)
  5. `SEAT - Chọn ghế`: Sơ đồ ghế Thường/VIP/Sweetbox, quy tắc ghế đơn độc (7 TCs - gồm BUG-03)
  6. `BOOK - Đặt vé & Thanh toán`: Tóm tắt đơn, thanh toán VNPay/MoMo, chống double click (7 TCs - gồm BUG-06)
  7. `PROMO - Khuyến mãi & Bắp nước`: Combo bắp nước, mã voucher hoa/thường (6 TCs - gồm BUG-04)
  8. `AI - Chatbot & Tư vấn phim`: Gợi ý phim theo thể loại/độ tuổi, link đặt vé (8 TCs - gồm BUG-05)
  9. `ADM - Quản trị hệ thống`: CRUD phim, suất chiếu, phòng chiếu, đơn hàng (7 TCs - gồm BUG-02)
  10. `UI_ERR - Giao diện & Lỗi`: Responsive mobile, trang 404, xử lý mất mạng (4 TCs)

---

### II. TÀI LIỆU THAM KHẢO
1. Đặc tả yêu cầu phần mềm (SRS) dự án Cineverse.
2. Tài liệu học phần CS 462 A - ĐH Duy Tân do ThS. Lương Thị Thu Phương biên soạn.
3. Tiêu chuẩn kiểm thử phần mềm quốc tế ISO/IEC/IEEE 29119.

---

### III. CHIẾN LƯỢC KIỂM THỬ
- **Phương pháp:** Kiểm thử hộp đen (Black-box testing) kết hợp phân vùng tương đương và phân tích giá trị biên.
- **Quy trình:** Kiểm thử chức năng vòng 1 (phát hiện 6 lỗi) -> Đội ngũ phát triển khắc phục -> Kiểm thử hồi quy vòng 2 xác nhận 100% Pass.
- **Tiêu chuẩn hoàn thành:** 65/65 Test Case Pass (100%), 6/6 Defect được đóng thành công.

---

### IV. NHÂN SỰ & MÔI TRƯỜNG
- **Nhân sự thực hiện:** Nguyễn Hữu Thăng (Tester / Test Manager).
- **Môi trường:** Máy tính cá nhân Windows 11, Google Chrome 19.0+, Vite Dev Server localhost:3000.

---

### V. LỊCH TRÌNH KIỂM THỬ
- 20/10 - 21/10/2026: Khảo sát hệ thống và lập Test Plan.
- 22/10 - 24/10/2026: Thiết kế chi tiết 65 Test Case.
- 25/10/2026: Thực thi kiểm thử đợt đầu, phát hiện và log 6 lỗi (BUG-01 -> BUG-06).
- 26/10/2026: Thực thi kiểm thử hồi quy (Regression Test), đóng lỗi và lập Test Report.

---

### VI. DANH SÁCH 6 LỖI ĐÃ ĐƯỢC KHẮC PHỤC (DEFECTS)
1. **BUG-01** (AUTH): Đăng xuất còn sót token trong localStorage khi mạng chập chờn.
2. **BUG-02** (ADM): Modal sửa phim thiếu gán ID phim dẫn đến lỗi cập nhật.
3. **BUG-03** (SEAT): Chọn ghế để lại 1 ghế trống đơn lẻ chưa hiện cảnh báo.
4. **BUG-04** (PROMO): Mã voucher nhập chữ thường bị báo không tồn tại.
5. **BUG-05** (AI): Gửi tin nhắn rỗng/khoảng trắng làm treo loading Chatbot AI.
6. **BUG-06** (BOOK): Double-click nút xác nhận thanh toán gửi 2 request trùng.

---

### VII. SẢN PHẨM BÀN GIAO
- `Testcase_RapChieuPhim_NguyenHuuThang.xlsx` (65 Test Cases chuẩn mẫu 2._TestCase_75102e50.pdf)
- `BugTrackingReport_RapChieuPhim_NguyenHuuThang.xlsx` (Báo cáo theo dõi 6 lỗi)
- `TestReport_RapChieuPhim_NguyenHuuThang.xlsx` (Báo cáo tổng kết Manual 100% Pass)
- `TestPlan_RapChieuPhim_NguyenHuuThang.docx` & `.md` (Kế hoạch kiểm thử hoàn chỉnh)
