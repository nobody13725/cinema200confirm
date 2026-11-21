import os
import zipfile
from xml.sax.saxutils import escape

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PATHS = [
    os.path.join(PROJECT_ROOT, "public", "Huong_Dan_Thuyet_Trinh_Demo_SVD.docx"),
    os.path.join(PROJECT_ROOT, "AI_Recommendation", "Huong_Dan_Thuyet_Trinh_Demo_SVD.docx"),
]


def xml_text(text: str) -> str:
    return escape(text or "")


def make_run(text: str, bold=False, italic=False, size_pt=11, color=None, font="Calibri"):
    rpr_parts = [f'<w:rFonts w:ascii="{font}" w:hAnsi="{font}" w:cs="{font}"/>']
    if bold:
        rpr_parts.append("<w:b/>")
    if italic:
        rpr_parts.append("<w:i/>")
    if color:
        rpr_parts.append(f'<w:color w:val="{color}"/>')
    sz = int(size_pt * 2)
    rpr_parts.append(f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>')
    rpr = "<w:rPr>" + "".join(rpr_parts) + "</w:rPr>"
    return f'<w:r>{rpr}<w:t xml:space="preserve">{xml_text(text)}</w:t></w:r>'


def make_paragraph(runs_xml: str, space_before=0, space_after=120, line=276, shading=None, left_indent=0, border_left=None, align=None):
    ppr = []
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    ppr.append(f'<w:spacing w:before="{space_before}" w:after="{space_after}" w:line="{line}" w:lineRule="auto"/>')
    if left_indent:
        ppr.append(f'<w:ind w:left="{left_indent}"/>')
    if shading:
        ppr.append(f'<w:shd w:val="clear" w:color="auto" w:fill="{shading}"/>')
    if border_left:
        ppr.append(f'<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="{border_left}"/></w:pBdr>')
    return f"<w:p><w:pPr>{''.join(ppr)}</w:pPr>{runs_xml}</w:p>"


def h1(text: str):
    return make_paragraph(
        make_run(text, bold=True, size_pt=15, color="1E3A8A"),
        space_before=260,
        space_after=100,
        border_left="2563EB",
    )


def h2(text: str):
    return make_paragraph(
        make_run(text, bold=True, size_pt=12.5, color="1D4ED8"),
        space_before=180,
        space_after=80,
    )


def p(text: str, bold_prefix=None, italic=False, color="1E293B"):
    runs = ""
    if bold_prefix:
        runs += make_run(bold_prefix, bold=True, size_pt=11, color="0F172A")
    runs += make_run(text, italic=italic, size_pt=11, color=color)
    return make_paragraph(runs, space_before=0, space_after=100)


def bullet(text: str, bold_prefix=None):
    runs = make_run("•  ", bold=True, size_pt=11, color="2563EB")
    if bold_prefix:
        runs += make_run(bold_prefix, bold=True, size_pt=11, color="0F172A")
    runs += make_run(text, size_pt=11, color="1E293B")
    return make_paragraph(runs, space_before=0, space_after=70, left_indent=320)


def quote_box(label: str, text: str):
    runs = make_run(label + "\n", bold=True, size_pt=10.5, color="1E40AF") + make_run(text, italic=True, size_pt=10.5, color="1E293B")
    return make_paragraph(runs, space_before=60, space_after=120, shading="EFF6FF", left_indent=240, border_left="3B82F6")


def code_block(lines):
    paras = []
    for idx, line in enumerate(lines):
        sb = 80 if idx == 0 else 0
        sa = 120 if idx == len(lines) - 1 else 20
        paras.append(
            make_paragraph(
                make_run(line, size_pt=9.5, color="0F172A", font="Consolas"),
                space_before=sb,
                space_after=sa,
                line=240,
                shading="F1F5F9",
                left_indent=200,
            )
        )
    return "".join(paras)


def make_table(headers, rows, col_widths):
    total_w = sum(col_widths)
    grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in col_widths)
    tbl_pr = (
        f'<w:tblPr><w:tblW w:w="{total_w}" w:type="dxa"/>'
        '<w:tblBorders>'
        '<w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        '<w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        '<w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        '<w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
        '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
        '</w:tblBorders></w:tblPr>'
    )

    def cell(txt, width, is_header=False):
        shd = '<w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/>' if is_header else ""
        mar = '<w:tcMar><w:top w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>'
        tc_pr = f'<w:tcPr><w:tcW w:w="{width}" w:type="dxa"/>{shd}{mar}</w:tcPr>'
        run = make_run(txt, bold=is_header, size_pt=10, color="FFFFFF" if is_header else "1E293B")
        para = make_paragraph(run, space_before=0, space_after=0, line=240)
        return f"<w:tc>{tc_pr}{para}</w:tc>"

    tr_list = []
    tr_list.append("<w:tr>" + "".join(cell(h, w, is_header=True) for h, w in zip(headers, col_widths)) + "</w:tr>")
    for r in rows:
        tr_list.append("<w:tr>" + "".join(cell(c, w, is_header=False) for c, w in zip(r, col_widths)) + "</w:tr>")

    return f"<w:tbl>{tbl_pr}<w:tblGrid>{grid}</w:tblGrid>{''.join(tr_list)}</w:tbl>"


def build_document_xml():
    parts = []

    # Cover / Title
    parts.append(
        make_paragraph(
            make_run("TÀI LIỆU HƯỚNG DẪN THUYẾT TRÌNH & DEMO LIVE", bold=True, size_pt=20, color="1E3A8A"),
            space_before=120,
            space_after=80,
            align="center",
        )
    )
    parts.append(
        make_paragraph(
            make_run("Chức năng 1: Gợi ý Phim ML (SVD)  &  Chức năng 2: Trợ lý AI Movix (Gemini Function Calling)", bold=True, size_pt=12.5, color="334155"),
            space_before=0,
            space_after=80,
            align="center",
        )
    )
    parts.append(
        make_paragraph(
            make_run("Dự án: Website Đặt Vé Rạp Chiếu Phim Movix  |  Module: AI_Recommendation, server.ts (/api/chat) & Chatbot.jsx", italic=True, size_pt=10.5, color="64748B"),
            space_before=0,
            space_after=240,
            align="center",
        )
    )

    # Phan 1
    parts.append(h1("PHẦN 1: MỤC TIÊU & BỐ CỤC BÀI THUYẾT TRÌNH (7–9 PHÚT)"))
    parts.append(p("Tài liệu này là kịch bản trình bày và Demo Live trọn vẹn cho CẢ HAI chức năng AI cốt lõi của hệ thống Movix: (1) Hệ thống Gợi ý Phim Cá nhân hóa bằng thuật toán Matrix Factorization SVD và (2) Trợ lý AI Movix Thông minh kết nối trực tiếp tài khoản người dùng, công cụ Gemini Function Calling trên server.ts, thẻ đặt vé tức thì và nút nhấn điều hướng kèm bộ lọc sẵn."))
    parts.append(
        make_table(
            ["Phần", "Nội dung trọng tâm", "Thời lượng gợi ý"],
            [
                ["1. Mở đầu & Bài toán", "Hai bài toán thực tế tại rạp: quá tải lựa chọn phim & nhu cầu hỏi đáp lịch chiếu, đặt vé bằng ngôn ngữ tự nhiên.", "45 giây"],
                ["2. Chức năng 1: Kiến trúc ML SVD", "Collaborative Filtering + Matrix Factorization SVD; luồng Offline Train -> Save -> Load -> Online Recommend & Cold-Start.", "1 phút 30 giây"],
                ["3. Chức năng 2: Trợ lý AI Movix", "Kiến trúc 2 tầng: Tầng 1 dữ liệu nội bộ tức thì + Tầng 2 Gemini Function Calling (6 tools trên server.ts) & nút nhấn bộ lọc.", "1 phút 30 giây"],
                ["4. Demo Live Chức năng 1 (SVD)", "Terminal (train, evaluate RMSE/MAE, recommend usr-1 vs usr-3) + So sánh Website + Duyệt vé -> Đánh giá -> Retrain.", "2 phút"],
                ["5. Demo Live Chức năng 2 (Chatbot)", "Hỏi gợi ý SVD, tra vé #MVX-77410, lọc tuổi 15, khuyến mãi & bấm nút 'Mở Lịch chiếu Hà Nội (20/11)' nhảy thẳng tới trang lọc sẵn.", "2 phút"],
                ["6. Tổng kết & Q&A", "Tóm tắt giá trị, chống đánh giá ảo, chống bịa dữ liệu (Anti-Hallucination) và trả lời phản biện.", "1 phút"],
            ],
            [1900, 5500, 1800],
        )
    )

    # Phan 2: Chuc nang 1
    parts.append(h1("PHẦN 2: CHỨC NĂNG 1 — HỆ THỐNG GỢI Ý PHIM MACHINE LEARNING (SVD)"))
    parts.append(h2("2.1. Collaborative Filtering & Matrix Factorization (SVD) là gì?"))
    parts.append(bullet("Collaborative Filtering (Lọc cộng tác) dự đoán sở thích của khán giả dựa trên lịch sử đánh giá (1–5 sao) của chính họ và những người dùng có gu tương đồng.", "Ý tưởng cốt lõi: "))
    parts.append(bullet("SVD (Singular Value Decomposition) phân rã ma trận thưa User–Movie thành các vector đặc trưng ẩn (Latent Factors) đại diện cho sở thích ngầm của người dùng (p_u) và đặc tính ngầm của phim (q_i).", "Thuật toán SVD: "))
    parts.append(bullet("r_hat(u, i) = mu + b_u + b_i + q_i^T * p_u (mu là điểm trung bình toàn hệ thống, b_u là độ khắt khe/dễ tính của user, b_i là chất lượng nền của phim).", "Công thức dự đoán: "))
    parts.append(quote_box("Câu nói mẫu khi thuyết trình:", '"Thay vì hiển thị cùng một danh sách phim hot cho tất cả mọi người, mô hình SVD học từ dữ liệu đánh giá thực tế 1–5 sao để nắm bắt sở thích ẩn của từng tài khoản, từ đó xếp hạng Top 5 phim phù hợp nhất cho riêng mỗi khán giả."'))

    parts.append(h2("2.2. Kiến trúc 4 bước: OFFLINE TRAINING -> SAVE MODEL -> LOAD MODEL -> ONLINE RECOMMENDATION"))
    parts.append(bullet("Huấn luyện mô hình trên tập dữ liệu lịch sử ratings.csv (đồng bộ từ SQLite / đánh giá thật trên web), chia 80% Train / 20% Test để kiểm định khách quan.", "Bước 1 - Offline Training: "))
    parts.append(bullet("Lưu toàn bộ tham số đã học (p_u, q_i, b_u, b_i và metadata) xuống file AI_Recommendation/model/svd_model.pkl.", "Bước 2 - Save Model: "))
    parts.append(bullet("FastAPI (cổng 8000) hoặc script recommend.py do server.ts gọi chỉ đọc svd_model.pkl vào bộ nhớ — TUYỆT ĐỐI KHÔNG train lại mỗi khi khách tải trang.", "Bước 3 - Load Model: "))
    parts.append(bullet("Khi khán giả mở Trang chủ hoặc Chatbot hỏi gợi ý, backend trả ngay Top 5 phim kèm poster, tên phim, thể loại, điểm dự đoán sao và lý do gợi ý.", "Bước 4 - Online Recommendation: "))

    parts.append(h2("2.3. Tham số cấu hình, Chỉ số đánh giá & Xử lý ngoại lệ"))
    parts.append(
        make_table(
            ["Tham số / Cơ chế", "Giá trị / Chiến lược", "Ý nghĩa khi trình bày với Hội đồng"],
            [
                ["n_factors / n_epochs", "20 nhân tố / 50 vòng lặp", "Số chiều đặc trưng ẩn & số vòng SGD tối ưu sai số."],
                ["lr_all / reg_all", "0.01 / 0.05", "Tốc độ học & hệ số chuẩn hóa L2 chống Overfitting."],
                ["RMSE / MAE (Test 20%)", "RMSE = 0.7416 | MAE = 0.5184", "Trên thang 1–5 sao, độ lệch dự đoán trung bình chỉ ~0.52 sao (trên 47 mẫu Test chưa từng thấy)."],
                ["Cold-start User / Item", "fallback_cold_start_user + Hybrid Alpha", "Tài khoản mới hoặc phim mới chưa có rating vẫn có Top phim chất lượng cao nhờ kết hợp trọng số thể loại."],
                ["Verified Watcher", "Duyệt vé / Check-in mới được đánh giá", "Chống spam rating ảo: chỉ khách đã xem phim thật mới có quyền chấm sao làm dữ liệu đầu vào cho SVD."],
            ],
            [2200, 2400, 4600],
        )
    )

    # Phan 3: Chuc nang 2
    parts.append(h1("PHẦN 3: CHỨC NĂNG 2 — TRỢ LÝ AI MOVIX THÔNG MINH (CHATBOT & GEMINI)"))
    parts.append(h2("3.1. Kiến trúc 2 tầng hợp nhất trên 1 giao diện gọn gàng"))
    parts.append(p("Chatbot Movix được thiết kế theo mô hình một cửa sổ hội thoại thống nhất (không có thanh chuyển chế độ phức tạp, lời chào ngắn gọn 'Chào bạn! Bạn cần Movix giúp gì hôm nay ạ?'), kết hợp chặt chẽ giữa AI tạo sinh và dữ liệu thật của rạp:"))
    parts.append(bullet("Từ App.jsx, thông tin tài khoản (user), giỏ dữ liệu phim, suất chiếu, cụm rạp, khuyến mãi, đơn vé và lịch sử đã xem được đóng gói thành contextSnapshot gọn nhẹ (tự lọc bỏ chuỗi ảnh base64 nặng và chỉ gửi số ghế đã đặt seatsBookedCount).", "Truyền ngữ cảnh thật từ Website: "))
    parts.append(bullet("Mặc định tin nhắn đi qua POST /api/chat trên server.ts. Mô hình Gemini (gemini-4-hydrogen) bắt buộc dùng Function Calling gọi 6 tools về server để đọc dữ liệu SVD & rạp Movix trước khi trả lời — triệt tiêu tình trạng bịa giờ chiếu hay mã giảm giá.", "Tầng chính — Gemini Function Calling (server.ts): "))
    parts.append(bullet("Trong Chatbot.jsx tích hợp sẵn bộ máy tra cứu trực tiếp dữ liệu Movix & SVD nội bộ. Nếu API AI tạm quá tải (503/504), timeout hoặc trả về HTML thay vì JSON, hệ thống tự động chạy ngay tầng dự phòng này để trả kết quả tức thì cho người dùng.", "Tầng dự phòng tự động — Tra cứu nhanh Movix & SVD: "))

    parts.append(h2("3.2. Bộ 6 Function Calling Tools & Cơ chế Nút nhấn Điều hướng Bộ lọc sẵn"))
    parts.append(
        make_table(
            ["Tên Tool (server.ts)", "Dữ liệu thật truy xuất & Hành động tạo ra", "Ví dụ câu hỏi Demo"],
            [
                ["get_svd_recommendations", "Gọi engine Python SVD (recommend.py) theo user đang đăng nhập, hỗ trợ lọc theo thể loại và gắn thẻ phim + nút 'Đặt vé' / 'Xem phim'.", "\"Gợi ý phim hợp gu với tôi hôm nay\""],
                ["search_movies_and_showtimes", "Tìm phim, suất chiếu còn ghế trống theo ngày (hỗ trợ cả '20/11', 'ngày mai'), thành phố, cụm rạp và chặn nghiêm phim vượt tuổi (C18/T16/T13).", "\"Tôi 15 tuổi tối nay xem phim gì ở Hà Nội?\""],
                ["navigate_movix_page", "Tạo NÚT NHẤN nổi bật (không tự ý nhảy trang đột ngột) kèm bộ lọc sẵn: Lịch chiếu (date, cityId, cinemaId, movieId), Cụm rạp, Phim (category), Khuyến mãi, Hồ sơ, Duyệt vé.", "\"Tôi muốn xem lịch chiếu ngày 20/11 các rạp ở Hà Nội\""],
                ["get_active_promotions", "Lấy mã khuyến mãi còn hiệu lực, lượt dùng còn lại và tự tính thử số tiền giảm theo giá trị đơn.", "\"Đơn 250k áp mã nào được giảm nhiều nhất?\""],
                ["check_tickets_and_watch_history", "Tra cứu trạng thái vé (#MVX-77410), lịch sử phim đã xem của user hoặc danh sách vé chờ duyệt nếu là Nhân viên/Admin.", "\"Kiểm tra giúp tôi vé #MVX-77410 duyệt chưa?\""],
                ["get_ticket_pricing_and_combos", "Truy xuất giá ghế Standard (80k), VIP (95k), Sweetbox (150k/cặp) và bảng giá combo bắp nước hiện hành.", "\"Giá vé VIP và combo bắp nước bao nhiêu?\""],
            ],
            [2400, 4200, 2600],
        )
    )
    parts.append(quote_box("Điểm nhấn UX quan trọng khi thuyết trình:", '"Thay vì tự động chuyển trang đột ngột làm khách chưa kịp đọc câu trả lời, Trợ lý AI tóm tắt rõ giờ chiếu còn ghế ngay trong khung chat rồi tạo sẵn Nút nhấn điều hướng nổi bật (ví dụ: Mở Lịch chiếu các rạp ở Hà Nội (20/11/2026) ->). Chỉ với 1 cú bấm, người dùng nhảy thẳng sang đúng trang đã cài sẵn bộ lọc ngày, thành phố, rạp hoặc phim."'))

    # Phan 4: Chuan bi demo
    parts.append(h1("PHẦN 4: CHUẨN BỊ TÀI KHOẢN & MÔI TRƯỜNG TRƯỚC KHI DEMO"))
    parts.append(
        make_table(
            ["Vai trò / Tài khoản", "Email đăng nhập", "Mật khẩu", "Đặc điểm phục vụ Demo cả 2 chức năng"],
            [
                ["Khách hàng 1 (usr-1)", "thangnguyen13725@gmail.com", "123", "Gu Sci-Fi & Hành động (Avatar 5★). Có sẵn vé #MVX-77410 (Dune: Part Two) đang chờ duyệt để demo luồng duyệt vé & tra cứu Chatbot."],
                ["Khách hàng 2 (usr-3)", "minhanh@gmail.com", "123", "Gu Gia đình & Hoạt hình (Lật Mặt 7 5★). Dùng để đối chiếu Top 5 gợi ý SVD khác hoàn toàn usr-1."],
                ["Nhân viên rạp", "nhanvien@movix.vn", "123", "Vào Cổng Duyệt vé & Soát vé (không mở chức năng Admin), duyệt vé #MVX-77410 để mở quyền đánh giá phim cho usr-1."],
                ["Quản trị viên (Admin)", "admin@movix.vn", "123", "Mở tab 'Gợi ý SVD & Setting' xem bảng website_ratings, điều chỉnh Alpha Hybrid và bấm Retrain cập nhật model."],
            ],
            [2000, 2600, 900, 3700],
        )
    )
    parts.append(bullet("Mở sẵn 2 Terminal: Terminal 1 tại AI_Recommendation/ (train, evaluate, FastAPI cổng 8000); Terminal 2 tại thư mục gốc (npm run dev chạy server.ts + Vite cổng 3000).", "Cửa sổ Terminal: "))
    parts.append(bullet("Kiểm tra biến môi trường GEMINI_API_KEY đã cấu hình (Settings > Secrets hoặc .env). Dù API AI có tạm bận (503), Chatbot vẫn tự động tra cứu dữ liệu thật & SVD nội bộ mượt mà.", "Môi trường AI & Trình duyệt: "))

    # Phan 5: Kich ban demo live
    parts.append(h1("PHẦN 5: KỊCH BẢN DEMO LIVE CHI TIẾT TỪNG BƯỚC (CHO CẢ 2 CHỨC NĂNG)"))

    parts.append(h2("PHẦN 5A — DEMO CHỨC NĂNG 1: GỢI Ý PHIM SVD (TỪ TERMINAL ĐẾN WEBSITE)"))
    parts.append(p("Bước 1: Giới thiệu dữ liệu & Huấn luyện mô hình Offline (Terminal)", bold_prefix="1. "))
    parts.append(code_block([
        "cd AI_Recommendation",
        "python train_model.py",
        "python evaluate_model.py",
        "python recommend.py usr-1",
        "python recommend.py usr-3",
        "python recommend.py nguoi_dung_moi",
    ]))
    parts.append(bullet("Chỉ trên màn hình: 27 user, 12 phim, 236 lượt đánh giá -> lưu thành công svd_model.pkl; tập Test đạt RMSE = 0.7416, MAE = 0.5184.", "Điểm cần nhấn: "))
    parts.append(bullet("Chỉ sự khác biệt rõ ràng: usr-1 ra Dune: Part Two (4.79★), Deadpool & Wolverine (4.76★); usr-3 ra The Wild Robot (4.79★), Inside Out 2 (4.78★); nguoi_dung_moi kích hoạt fallback_cold_start_user.", "Đối chiếu CLI: "))

    parts.append(p("Bước 2: So sánh gợi ý cá nhân hóa ngay trên Website Movix", bold_prefix="2. "))
    parts.append(bullet("Đăng nhập usr-1 (thangnguyen13725@gmail.com / 123) -> chỉ mục 'Gợi ý phim dành riêng cho bạn' trên Trang chủ (thiên về Sci-Fi / Hành động).", "Tài khoản usr-1: "))
    parts.append(bullet("Đăng xuất -> đăng nhập usr-3 (minhanh@gmail.com / 123) -> danh sách Top phim đổi ngay sang Hoạt hình / Gia đình / Tâm lý.", "Tài khoản usr-3: "))

    parts.append(p("Bước 3: Demo vòng khép kín Duyệt vé -> Đã xem -> Đánh giá -> Retrain Real-time", bold_prefix="3. "))
    parts.append(bullet("Đăng nhập Nhân viên (nhanvien@movix.vn / 123) -> Duyệt vé #MVX-77410 -> Đăng nhập lại usr-1 -> vào Profile > Lịch sử đã xem -> chấm 5★ cho Dune: Part Two.", "Ghi nhận đánh giá thật: "))
    parts.append(bullet("Đăng nhập Admin (admin@movix.vn / 123) -> tab 'Gợi ý SVD & Setting' -> chỉ đánh giá mới trong website_ratings -> bấm 'Huấn luyện lại svd_model.pkl' để model tăng version và cập nhật điểm dự đoán.", "Admin cập nhật model: "))

    parts.append(h2("PHẦN 5B — DEMO CHỨC NĂNG 2: TRỢ LÝ AI MOVIX & NÚT ĐIỀU HƯỚNG BỘ LỌC SẴN"))
    parts.append(p("Đăng nhập usr-1 (thangnguyen13725@gmail.com / 123), mở biểu tượng Trợ lý AI Movix ở góc dưới phải màn hình và thử 4 kịch bản thực tế:"))

    parts.append(bullet("Gõ: \"Gợi ý phim hợp gu tôi\" -> Chatbot trả về Top phim theo điểm dự đoán SVD của chính usr-1, hiển thị thẻ phim có poster, số sao SVD và 2 nút bấm trực tiếp: [Xem phim] và [Đặt vé].", "Kịch bản 1 — Gợi ý SVD & Đặt vé trong chat: "))
    parts.append(bullet("Gõ: \"Tôi muốn xem lịch chiếu ngày 20/11 các rạp ở Hà Nội\" -> Chatbot liệt kê ngay các suất chiếu còn ghế tại Hà Nội ngày 20/11 kèm nút nhấn nổi bật [🗓️ Mở Lịch chiếu các rạp ở Hà Nội (20/11/2026) →]. Nhấn nút để chuyển thẳng sang trang Lịch chiếu đã tự chọn sẵn Khu vực = Hà Nội & Ngày = 20/11!", "Kịch bản 2 — Hỏi lịch chiếu & Nút nhấn mở bộ lọc sẵn: "))
    parts.append(bullet("Gõ: \"Vé MVX-77410 của tôi thế nào rồi và có mã giảm giá nào?\" -> Chatbot báo đúng trạng thái mới nhất của vé #MVX-77410 (chờ duyệt hoặc đã duyệt) cùng danh sách mã khuyến mãi thật đang còn lượt sử dụng.", "Kịch bản 3 — Tra cứu vé cá nhân & Khuyến mãi thật: "))
    parts.append(bullet("Gõ: \"Tôi 15 tuổi tối nay xem phim gì ở TP.HCM?\" -> Hệ thống tự động loại bỏ toàn bộ phim nhãn C18/T16, chỉ gợi ý phim P/T13 phù hợp độ tuổi kèm nút mở lịch chiếu TP.HCM.", "Kịch bản 4 — Câu hỏi tự nhiên có ràng buộc độ tuổi: "))

    parts.append(quote_box("Lời chốt phần Demo Chatbot:", '"Toàn bộ câu trả lời của Trợ lý AI đều bám sát 100% dữ liệu thật từ CSDL rạp Movix và engine SVD qua Gemini Function Calling, tuyệt đối không bịa lịch chiếu hay mã khuyến mãi, đồng thời cung cấp nút bấm điều hướng kèm bộ lọc sẵn để rút ngắn tối đa thao tác đặt vé cho khách hàng."'))

    # Phan 6: Q&A
    parts.append(h1("PHẦN 6: CÂU HỎI PHẢN BIỆN THƯỜNG GẶP & CÁCH TRẢ LỜI (Q&A)"))
    parts.append(
        make_table(
            ["Câu hỏi thường gặp", "Gợi ý câu trả lời ngắn gọn, đúng trọng tâm"],
            [
                ["1. Tại sao chọn SVD thay vì User-based hay Content-based thuần?", "User-based suy giảm khi ma trận thưa. SVD học ra các nhân tố ẩn (latent factors) giúp dự đoán chính xác ngay cả khi 2 user ít xem trùng phim; ngoài ra Movix kết hợp thêm Hybrid Alpha để hỗ trợ phim mới."],
                ["2. Website có train lại model mỗi lần khách mở trang không?", "Không. Hệ thống tuân thủ kiến trúc Offline Training -> Save Model -> Load Model -> Online Recommendation. Trang web chỉ load file svd_model.pkl đã lưu; chỉ Retrain khi Admin bấm huấn luyện lại hoặc chạy train_model.py."],
                ["3. Làm sao chống spam/đánh giá ảo làm nhiễu mô hình SVD?", "Chỉ tài khoản có vé đã được nhân viên duyệt hoặc soát vé check-in (Verified Watcher) mới được phép gửi đánh giá sao trên MovieDetail để đồng bộ vào dữ liệu huấn luyện."],
                ["4. Làm sao Gemini Chatbot không bịa lịch chiếu, giá vé hay mã giảm giá?", "Nhờ cơ chế Function Calling trên server.ts (POST /api/chat): System Instruction ép Gemini gọi 6 tools lấy dữ liệu thật từ recommend.py (SVD) và rạp Movix rồi mới tổng hợp câu trả lời."],
                ["5. Tại sao Chatbot tạo nút nhấn chuyển trang thay vì tự nhảy trang luôn?", "Để người dùng đọc trọn vẹn thông tin giờ chiếu/gợi ý trong khung chat trước rồi chủ động bấm nút 'Mở Lịch chiếu ... →' khi muốn chuyển trang, tránh cảm giác bị giật mất nội dung vừa hỏi."],
                ["6. Nếu API AI quá tải (503) hoặc mạng chậm thì Chatbot có lỗi không?", "Không. Chatbot đã tối ưu kích thước dữ liệu gửi lên (bỏ base64 poster nặng) và có cơ chế tự động chuyển sang tra cứu trực tiếp dữ liệu thật Movix + SVD ngay lập tức để người dùng không bị gián đoạn."],
            ],
            [3200, 6000],
        )
    )

    # Phan 7: Checklist
    parts.append(h1("PHẦN 7: CHECKLIST 60 GIÂY TRƯỚC KHI BẮT ĐẦU THUYẾT TRÌNH"))
    parts.append(bullet("Kiểm tra file AI_Recommendation/model/svd_model.pkl đã tồn tại và chạy thử python evaluate_model.py không lỗi."))
    parts.append(bullet("Đảm bảo cả FastAPI (cổng 8000) và Movix server (cổng 3000) đều đang chạy ổn định."))
    parts.append(bullet("Mở thử Chatbot: kiểm tra lời chào 'Chào bạn! Bạn cần Movix giúp gì hôm nay ạ?', gửi thử câu hỏi lịch chiếu Hà Nội ngày 20/11 và bấm thử nút 'Mở Lịch chiếu ... →'."))
    parts.append(bullet("Nếu vừa demo duyệt vé #MVX-77410 ở buổi thử trước, Admin có thể bấm khôi phục dữ liệu mẫu trước khi lên thuyết trình chính thức."))
    parts.append(bullet("Phóng to font chữ Terminal và VS Code (Ctrl + '+') để người xem phía dưới nhìn rõ bảng RMSE/MAE và Top 5 SVD."))

    body_xml = "".join(parts)
    sect_pr = (
        '<w:sectPr>'
        '<w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>'
        '</w:sectPr>'
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f"<w:body>{body_xml}{sect_pr}</w:body>"
        "</w:document>"
    )


CONTENT_TYPES_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

RELS_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

DOC_RELS_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

STYLES_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
    </w:rPr>
  </w:style>
</w:styles>"""


def write_docx(path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    doc_xml = build_document_xml()
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", CONTENT_TYPES_XML.encode("utf-8"))
        zf.writestr("_rels/.rels", RELS_XML.encode("utf-8"))
        zf.writestr("word/_rels/document.xml.rels", DOC_RELS_XML.encode("utf-8"))
        zf.writestr("word/styles.xml", STYLES_XML.encode("utf-8"))
        zf.writestr("word/document.xml", doc_xml.encode("utf-8"))


if __name__ == "__main__":
    for out in OUTPUT_PATHS:
        write_docx(out)
        print(f"Generated: {out} ({os.path.getsize(out)} bytes)")
