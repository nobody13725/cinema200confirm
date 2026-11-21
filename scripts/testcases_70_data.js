export const TEST_CASES_DATA = {
  "REG": {
    "code": "Đăng ký (Register)",
    "name": "Đăng ký",
    "round1": {
      "done": 14,
      "bugs": 2,
      "pending": 0,
      "blocked": 0,
      "total": 14
    },
    "round2": {
      "done": 14,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 14
    },
    "cases": [
      {
        "id": "TC_REG_01",
        "summary": "Xác minh thông báo lỗi khi để trống toàn bộ ô nhập",
        "pre": "Truy cập vào trang web http://localhost:3000/register",
        "data": "Để trống tất cả trường (Họ tên: null, Email: null, SĐT: null, Mật khẩu: null, Xác nhận: null)",
        "steps": "1. Mở trang Đăng ký từ nút trên Header.\n2. Không nhập bất kỳ thông tin nào.\n3. Nhấp nút \"Tiếp tục xác nhận OTP\" hoặc \"Đăng ký\".\n4. Quan sát phản hồi trên giao diện.",
        "expected": "Hệ thống chặn submit, các trường input chuyển viền đỏ và hiển thị thông báo lỗi rõ ràng bên dưới từng trường: \"Vui lòng nhập họ và tên\", \"Vui lòng nhập email\", \"Vui lòng nhập mật khẩu\". Không gửi request rác lên server.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Form validation chặn tốt ở Client"
      },
      {
        "id": "TC_REG_02",
        "summary": "Xác minh đăng ký thành công với dữ liệu hợp lệ",
        "pre": "Người dùng vãng lai chưa có tài khoản trong hệ thống",
        "data": "Họ tên: \"Nguyễn Văn A\", Email: \"a.test@gmail.com\", SĐT: \"0912345678\", Mật khẩu: \"Abc@12345\", Xác nhận: \"Abc@12345\"",
        "steps": "1. Mở trang Đăng ký.\n2. Điền đầy đủ và chính xác tất cả thông tin hợp lệ.\n3. Nhấp nút \"Đăng ký\".\n4. Kiểm tra phản hồi thông báo và luồng chuyển hướng.",
        "expected": "Hiển thị toast thông báo thành công: \"Đăng ký tài khoản thành công!\", hệ thống lưu tài khoản mới vào cơ sở dữ liệu với vai trò \"user\", tự động điều hướng sang trang Đăng nhập hoặc Trang chủ kèm trạng thái đã đăng nhập.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Dữ liệu đã được lưu vào Auth DB"
      },
      {
        "id": "TC_REG_03",
        "summary": "Xác minh thông báo lỗi khi email đã tồn tại",
        "pre": "Hệ thống đã có tài khoản với email a.test@gmail.com",
        "data": "Email: \"a.test@gmail.com\" (đã đăng ký), Họ tên: \"Trần Văn B\", SĐT: \"0987654321\", Mật khẩu: \"Abc@12345\"",
        "steps": "1. Nhập họ tên, SĐT và mật khẩu hợp lệ.\n2. Nhập Email trùng với email đã có trong hệ thống.\n3. Nhấn \"Đăng ký\".\n4. Quan sát thông báo trả về.",
        "expected": "Hệ thống hiển thị thông báo lỗi nổi bật: \"Email này đã được đăng ký tài khoản. Vui lòng sử dụng email khác hoặc Đăng nhập\". Không cho phép tạo tài khoản trùng.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Backend trả về mã conflict chính xác"
      },
      {
        "id": "TC_REG_04",
        "summary": "Xác minh email chữ hoa trùng với email đã đăng ký",
        "pre": "Đã có tài khoản mang email: a.test@gmail.com",
        "data": "Email nhập: \"A.TEST@GMAIL.COM\", Họ tên: \"Lê Thị C\", SĐT: \"0901234567\", Mật khẩu: \"Abc@12345\"",
        "steps": "1. Nhập họ tên và SĐT mới.\n2. Nhập email trùng nhưng cố tình gõ in hoa toàn bộ: \"A.TEST@GMAIL.COM\".\n3. Nhấn \"Đăng ký\".\n4. Kiểm tra tính năng chuẩn hóa (normalize/lowercase) email.",
        "expected": "Hệ thống tự động chuyển đổi chữ thường (to LowerCase) trước khi kiểm tra và phát hiện trùng lặp, hiển thị thông báo lỗi \"Email này đã tồn tại\".",
        "r1": "Fail",
        "bug": "BUG_REG_01",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đợt 1 phân biệt hoa thường dẫn đến tạo trùng. Đợt 2 đã fix trim().toLowerCase()."
      },
      {
        "id": "TC_REG_10",
        "summary": "Xác minh nhấn Đăng ký hai lần liên tiếp (Double-click submit)",
        "pre": "Điền đầy đủ thông tin hợp lệ ở form Đăng ký",
        "data": "Họ tên: \"Đỗ Minh Quân\", Email: \"quan.do@gmail.com\", SĐT: \"0933112233\", Pass: \"Matkhau@123\"",
        "steps": "1. Điền toàn bộ thông tin hợp lệ.\n2. Nhấp đúp chuột thật nhanh 2 lần liên tiếp vào nút \"Đăng ký\".\n3. Kiểm tra phản ứng giao diện và log API.",
        "expected": "Hệ thống ngay lập tức vô hiệu hóa (disabled) nút bấm, hiển thị spinner loading \"Đang xử lý...\", chặn triệt để lệnh gửi thứ hai. Chỉ tạo đúng 1 tài khoản, không phát sinh lỗi 500 hay bản ghi trùng.",
        "r1": "Fail",
        "bug": "BUG_REG_03",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đợt 1 bị lỗi 500 khi double submit. Đợt 2 bổ sung debounceRef và loading lock."
      }
    ]
  },
  "LOG": {
    "code": "Đăng nhập (Login)",
    "name": "Đăng nhập",
    "round1": {
      "done": 13,
      "bugs": 1,
      "pending": 0,
      "blocked": 0,
      "total": 13
    },
    "round2": {
      "done": 13,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 13
    },
    "cases": [
      {
        "id": "TC_LOG_01",
        "summary": "Xác minh thông báo lỗi khi để trống toàn bộ ô nhập",
        "pre": "Đang ở trang /login",
        "data": "Email: null, Mật khẩu: null",
        "steps": "1. Mở trang Đăng nhập.\n2. Không điền dữ liệu, nhấn ngay nút \"Đăng nhập\".\n3. Quan sát thông báo.",
        "expected": "Hiển thị viền đỏ và text lỗi: \"Vui lòng nhập email\" và \"Vui lòng nhập mật khẩu\". Không gửi request xác thực.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Validation client tốt"
      },
      {
        "id": "TC_LOG_02",
        "summary": "Xác minh khách hàng đăng nhập thành công",
        "pre": "Tài khoản khách hàng hợp lệ: user@movix.vn / 123456",
        "data": "Email: \"user@movix.vn\", Mật khẩu: \"123456\"",
        "steps": "1. Nhập email và mật khẩu khách hàng.\n2. Nhấn \"Đăng nhập\".\n3. Kiểm tra điều hướng và phiên làm việc.",
        "expected": "Toast báo \"Đăng nhập thành công!\", chuyển hướng về Trang chủ, Navbar hiển thị avatar khách hàng và menu: \"Vé của tôi\", \"Thông tin tài khoản\", \"Đăng xuất\".",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Phân quyền role: user chính xác"
      },
      {
        "id": "TC_LOG_03",
        "summary": "Xác minh quản trị viên (Admin) đăng nhập thành công",
        "pre": "Tài khoản admin hệ thống: admin@movix.vn / 123456",
        "data": "Email: \"admin@movix.vn\", Mật khẩu: \"123456\"",
        "steps": "1. Nhập email và mật khẩu quản trị viên.\n2. Nhấn \"Đăng nhập\".",
        "expected": "Đăng nhập thành công, hệ thống điều hướng trực tiếp vào Bảng điều khiển Quản trị (/admin/movies), thanh menu Admin hiển thị đầy đủ 10 phân hệ nghiệp vụ.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Role: admin được cấp toàn quyền"
      },
      {
        "id": "TC_LOG_04",
        "summary": "Xác minh nhân viên (Staff) đăng nhập thành công và đúng phân quyền",
        "pre": "Tài khoản nhân viên rạp: staff@movix.vn / 123456",
        "data": "Email: \"staff@movix.vn\", Mật khẩu: \"123456\"",
        "steps": "1. Nhập tài khoản nhân viên.\n2. Nhấn \"Đăng nhập\".\n3. Kiểm tra các menu hiển thị.",
        "expected": "Đăng nhập thành công, hiển thị badge \"Nhân viên rạp\", chỉ được truy cập các trang bán vé và kiểm soát đơn (Đơn đặt vé, Suất chiếu), không thấy menu Cấu hình hệ thống/Nhân viên.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "RBAC Staff hoạt động chuẩn"
      },
      {
        "id": "TC_LOG_10",
        "summary": "Xác minh liên kết \"Quên mật khẩu?\" chuyển đến đúng trang khôi phục mật khẩu",
        "pre": "Đang ở trang Đăng nhập /login",
        "data": "Click vào liên kết văn bản \"Quên mật khẩu?\"",
        "steps": "1. Tại form đăng nhập, tìm link \"Quên mật khẩu?\".\n2. Nhấp chuột vào link.\n3. Kiểm tra trang đích được tải.",
        "expected": "Hệ thống điều hướng êm ái đến trang /forgot-password, hiển thị giao diện nhập email nhận mã OTP đặt lại mật khẩu với hướng dẫn 3 bước trực quan. Tuyệt đối không báo lỗi 404.",
        "r1": "Fail",
        "bug": "BUG_LOG_02",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đợt 1 link trỏ vào route chưa đăng ký sinh lỗi 404. Đợt 2 đã bổ sung route và page ForgotPassword hoàn chỉnh."
      }
    ]
  },
  "SRCH": {
    "code": "Tìm kiếm & Lọc phim (Search & Filter)",
    "name": "Tìm kiếm phim",
    "round1": {
      "done": 13,
      "bugs": 1,
      "pending": 0,
      "blocked": 0,
      "total": 13
    },
    "round2": {
      "done": 13,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 13
    },
    "cases": [
      {
        "id": "TC_SRCH_01",
        "summary": "Xác minh tìm phim theo tên phim chính xác",
        "pre": "Trang danh sách phim /movies",
        "data": "Từ khóa: \"Avatar: The Way of Water\"",
        "steps": "1. Gõ chính xác \"Avatar: The Way of Water\" vào thanh tìm kiếm.\n2. Nhấn Enter hoặc icon kính lúp.",
        "expected": "Hiển thị đúng 1 thẻ phim duy nhất khớp tên, hiển thị điểm đánh giá, thể loại và nút đặt vé.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Tìm kiếm chính xác"
      },
      {
        "id": "TC_SRCH_02",
        "summary": "Xác minh tìm phim theo một phần tên (Partial search / không phân biệt hoa thường)",
        "pre": "Đang ở trang /movies",
        "data": "Từ khóa: \"dune\" hoặc \"deadpool\"",
        "steps": "1. Nhập từ khóa viết thường \"dune\".\n2. Quan sát kết quả lọc tức thì.",
        "expected": "Trả về tất cả các phim có chứa chuỗi \"dune\" trong tiêu đề (ví dụ: \"Dune: Part Two\").",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Tìm kiếm tương đối tốt"
      },
      {
        "id": "TC_SRCH_03",
        "summary": "Xác minh thông báo khi không tìm thấy phim phù hợp",
        "pre": "Đang ở trang /movies",
        "data": "Từ khóa: \"zzzzxx_not_found_123\"",
        "steps": "1. Nhập chuỗi ký tự không khớp bất kỳ phim nào.\n2. Quan sát giao diện.",
        "expected": "Hiển thị hình minh họa trống kèm thông báo thân thiện: \"Không tìm thấy bộ phim nào phù hợp với từ khóa của bạn. Vui lòng thử lại với từ khóa khác\".",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Empty state rõ ràng"
      },
      {
        "id": "TC_SRCH_04",
        "summary": "Xác minh lọc phim theo thể loại (Genre: Hành động)",
        "pre": "Đang ở trang /movies",
        "data": "Chọn dropdown thể loại: \"Hành động\"",
        "steps": "1. Chọn thể loại \"Hành động\" trong bộ lọc.\n2. Kiểm tra danh sách hiển thị.",
        "expected": "Tất cả phim hiển thị đều có chứa tag thể loại \"Hành động\" trong thông tin chi tiết.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Lọc thể loại chính xác"
      },
      {
        "id": "TC_SRCH_08",
        "summary": "Xác minh kết hợp thể loại và ngày chiếu (Multi-criteria Filter)",
        "pre": "Đang ở trang /movies",
        "data": "Thể loại: \"Hành động\" + Ngày chiếu: Hôm nay",
        "steps": "1. Chọn thể loại \"Hành động\".\n2. Chọn ngày chiếu hôm nay.\n3. Kiểm tra danh sách phim.",
        "expected": "Hệ thống CHỈ hiển thị các phim vừa thuộc thể loại Hành động VÀ vừa có suất chiếu trong ngày hôm nay. Không được hiển thị phim Hành động nhưng ngày đó không có suất chiếu.",
        "r1": "Fail",
        "bug": "BUG_SRCH_02",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đợt 1 bị lỗi hiển thị cả phim không có suất chiếu hôm nay. Đợt 2 đã fix logic AND filter."
      }
    ]
  },
  "LST": {
    "code": "Xem phim theo trạng thái (Movie Status)",
    "name": "Xem phim theo trạng thái",
    "round1": {
      "done": 10,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 10
    },
    "round2": {
      "done": 10,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 10
    },
    "cases": [
      {
        "id": "TC_LST_01",
        "summary": "Xác minh danh sách phim \"Đang chiếu\" hiển thị đúng",
        "pre": "Trang chủ hoặc trang phim",
        "data": "Tab \"Phim đang chiếu\" (status: now_showing)",
        "steps": "1. Nhấp tab \"Phim đang chiếu\".\n2. Kiểm tra trạng thái của các phim hiển thị.",
        "expected": "Chỉ hiển thị các phim có trạng thái Đang chiếu, có suất chiếu trong thời điểm hiện tại.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Dữ liệu lọc chính xác"
      },
      {
        "id": "TC_LST_02",
        "summary": "Xác minh danh sách phim \"Sắp chiếu\" hiển thị đúng",
        "pre": "Đang ở trang chủ",
        "data": "Tab \"Phim sắp chiếu\" (status: coming_soon)",
        "steps": "1. Nhấp tab \"Phim sắp chiếu\".\n2. Kiểm tra ngày khởi chiếu của phim.",
        "expected": "Hiển thị các phim sắp chiếu, hiển thị rõ ngày khởi chiếu dự kiến và nút \"Xem thông tin / Trailer\", không hiện nút đặt suất hôm nay.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Trạng thái sắp chiếu rõ ràng"
      },
      {
        "id": "TC_LST_03",
        "summary": "Xác minh thông tin trên thẻ phim (Movie Card)",
        "pre": "Danh sách thẻ phim",
        "data": "Một thẻ phim bất kỳ (vd: Dune 2)",
        "steps": "1. Quan sát các chi tiết trên thẻ phim: Poster, Tiêu đề, Thời lượng, Nhãn tuổi, Thể loại, Điểm rating.",
        "expected": "Hiển thị đầy đủ poster không bị méo, nhãn tuổi rõ ràng, thời lượng tính theo phút, điểm sao đánh giá.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đầy đủ metadata"
      },
      {
        "id": "TC_LST_04",
        "summary": "Xác minh chọn thẻ phim chuyển đến trang chi tiết",
        "pre": "Đang ở danh sách phim",
        "data": "Click vào poster hoặc tên phim",
        "steps": "1. Click chuột vào thẻ phim.\n2. Quan sát chuyển trang.",
        "expected": "Chuyển mượt mà đến trang /movie/:id tương ứng với đầy đủ lịch chiếu và trailer.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Navigation hoạt động tốt"
      }
    ]
  },
  "DTL": {
    "code": "Chi tiết phim & Lịch chiếu (Movie Detail)",
    "name": "Chi tiết phim & lịch chiếu",
    "round1": {
      "done": 11,
      "bugs": 1,
      "pending": 0,
      "blocked": 0,
      "total": 11
    },
    "round2": {
      "done": 11,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 11
    },
    "cases": [
      {
        "id": "TC_DTL_01",
        "summary": "Xác minh tên phim và toàn bộ thông số chi tiết hiển thị đúng",
        "pre": "Trang chi tiết phim /movie/:id",
        "data": "Phim Avatar 2",
        "steps": "1. Mở trang chi tiết phim.\n2. Kiểm tra tên phim, đạo diễn, diễn viên, ngày phát hành, tóm tắt nội dung.",
        "expected": "Hiển thị chính xác và đầy đủ các thông tin chi tiết của phim.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Hiển thị đúng dữ liệu DB"
      },
      {
        "id": "TC_DTL_02",
        "summary": "Xác minh phát video Trailer Youtube nhúng",
        "pre": "Phim có link trailer Youtube hợp lệ",
        "data": "Nút \"Xem Trailer\"",
        "steps": "1. Nhấp nút \"Xem Trailer\".\n2. Kiểm tra modal phát video xuất hiện.",
        "expected": "Modal hiển thị video Youtube nhúng, có âm thanh và hình ảnh, nút đóng modal hoạt động tốt.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Trailer player hoạt động mượt mà"
      },
      {
        "id": "TC_DTL_03",
        "summary": "Xác minh lịch chiếu mặc định hiển thị theo ngày hiện tại",
        "pre": "Truy cập trang chi tiết phim",
        "data": "Ngày hôm nay (current date)",
        "steps": "1. Quan sát thanh chọn ngày chiếu.\n2. Kiểm tra tab ngày nào đang được active mặc định.",
        "expected": "Tab ngày hôm nay được active đầu tiên, danh sách suất chiếu của ngày hôm nay được tải ra.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Mặc định đúng ngày hôm nay"
      },
      {
        "id": "TC_DTL_04",
        "summary": "Xác minh đổi ngày xem lịch chiếu trong tương lai",
        "pre": "Đang ở trang chi tiết phim",
        "data": "Chọn ngày mai hoặc ngày mốt",
        "steps": "1. Nhấp chọn tab ngày kế tiếp.\n2. Quan sát danh sách suất chiếu.",
        "expected": "Danh sách suất chiếu cập nhật tương ứng theo ngày đã chọn tại từng cụm rạp.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Cập nhật lịch chiếu theo ngày tốt"
      },
      {
        "id": "TC_DTL_05",
        "summary": "Xác minh suất chiếu đã qua giờ bắt đầu bị vô hiệu hóa (Disabled past showtime)",
        "pre": "Ngày chiếu là hôm nay, hiện tại là 15:00",
        "data": "Suất chiếu lúc 10:15 sáng (đã trôi qua 4 tiếng 45 phút)",
        "steps": "1. Xem danh sách suất chiếu của ngày hôm nay.\n2. Tìm suất chiếu có giờ bắt đầu sớm hơn giờ hiện tại.\n3. Thử nhấp chuột vào nút suất chiếu đó.",
        "expected": "Nút suất chiếu đã qua giờ bị làm mờ (opacity-50, cursor-not-allowed), có gạch chéo hoặc text phụ \"(Đã chiếu)\". Người dùng KHÔNG THỂ nhấp để đặt vé.",
        "r1": "Fail",
        "bug": "BUG_DTL_01",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đợt 1 vẫn cho phép click vào suất quá khứ. Đợt 2 đã bổ sung isPastShowtime() chặn triệt để."
      }
    ]
  },
  "BK": {
    "code": "Đặt vé & Chọn ghế (Booking & Seats)",
    "name": "Đặt vé & chọn ghế",
    "round1": {
      "done": 20,
      "bugs": 3,
      "pending": 0,
      "blocked": 1,
      "total": 20
    },
    "round2": {
      "done": 20,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 20
    },
    "cases": [
      {
        "id": "TC_BK_01",
        "summary": "Xác minh sơ đồ ghế hiển thị đúng với phòng chiếu và cấu hình phòng",
        "pre": "Đã vào trang đặt vé của suất chiếu phòng 1 (Standard 2D)",
        "data": "Suất chiếu phòng 1, cấu hình 9 hàng ghế (A -> I), 12 ghế/hàng",
        "steps": "1. Quan sát ma trận ghế hiển thị trên màn hình.\n2. So sánh số hàng, số cột, loại ghế thường, VIP và Sweetbox với cấu hình phòng trong DB.",
        "expected": "Sơ đồ ghế khớp 100% với cấu hình phòng chiếu, hàng ghế A-D ghế thường (xanh), E-H ghế VIP (cam), hàng I ghế đôi Sweetbox (hồng), màn hình Screen ở trên cùng.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Hiển thị sơ đồ ghế chính xác"
      },
      {
        "id": "TC_BK_02",
        "summary": "Xác minh chọn ghế trống thành công và cập nhật tổng tiền",
        "pre": "Đang ở sơ đồ ghế",
        "data": "Click chọn ghế C5 (ghế thường, đơn giá 90.000đ)",
        "steps": "1. Nhấp chọn ghế C5 đang ở trạng thái trống.\n2. Quan sát màu sắc ghế và thanh tóm tắt đơn bên phải.",
        "expected": "Ghế C5 đổi màu sang trạng thái Đã chọn (tím/xanh neon), thanh tóm tắt hiển thị \"Ghế: C5\", tổng tiền cập nhật đúng 90.000đ.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Chọn ghế đơn lẻ chuẩn"
      },
      {
        "id": "TC_BK_03",
        "summary": "Xác minh không thể chọn ghế đã có người khác đặt trước (Booked seat)",
        "pre": "Ghế F5, F6 đã được đặt trước (trạng thái Booked, màu xám có icon người)",
        "data": "Click chuột vào ghế F5",
        "steps": "1. Thử click chuột nhiều lần vào ghế F5 đã đặt.\n2. Quan sát phản hồi.",
        "expected": "Con trỏ chuột hiển thị not-allowed, ghế không thể đổi trạng thái, tổng tiền không thay đổi, không phát sinh lỗi.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Khóa ghế đã đặt nghiêm ngặt"
      },
      {
        "id": "TC_BK_04",
        "summary": "Xác minh kiểm soát số lượng ghế đặt tối đa (Tối đa 10 ghế/lần đặt)",
        "pre": "Người dùng đã chọn 10 ghế",
        "data": "Cố gắng nhấp chọn tiếp ghế thứ 11",
        "steps": "1. Chọn lần lượt 10 ghế trống bất kỳ.\n2. Nhấp vào ghế trống thứ 11.\n3. Quan sát thông báo.",
        "expected": "Hệ thống chặn không cho chọn ghế thứ 11, hiển thị toast cảnh báo: \"Bạn chỉ được đặt tối đa 10 ghế trong một lần giao dịch để đảm bảo quyền lợi cho khách hàng khác\".",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "BVA: 10 ghế thành công, 11 ghế bị chặn"
      },
      {
        "id": "TC_BK_05",
        "summary": "Xác minh chọn ghế đôi Sweetbox tự động chọn cả cặp và tính đúng một lần giá ghế đôi",
        "pre": "Hàng ghế Sweetbox (I1-I2, I3-I4, I5-I6, giá 200.000đ/cặp)",
        "data": "Click vào ghế I1 hoặc I2",
        "steps": "1. Nhấp chuột vào một trong hai nửa của ghế đôi Sweetbox (I1).\n2. Quan sát trạng thái được chọn trên sơ đồ.\n3. Kiểm tra số tiền cộng vào tổng hóa đơn.",
        "expected": "Hệ thống tự động kích hoạt cả cặp liền kề (I1 và I2), hiển thị nhãn Sweetbox I1-I2. Tổng tiền chỉ tính đúng MỘT lần giá ghế đôi là 200.000đ (KHÔNG ĐƯỢC nhân đôi thành 400.000đ).",
        "r1": "Fail",
        "bug": "BUG_BK_02",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đợt 1 tính 2 x 200k = 400k. Đợt 2 đã fix logic isPairSeat chỉ tính 1 lần giá 200k cho cả cặp."
      },
      {
        "id": "TC_BK_08",
        "summary": "Xác minh tính tổng tiền khi kết hợp nhiều loại ghế (Thường + VIP + Sweetbox)",
        "pre": "Giá: Thường 90k, VIP 120k, Sweetbox cặp 200k",
        "data": "Chọn: 1 ghế Thường B2 + 1 ghế VIP F5 + 1 cặp Sweetbox I3-I4",
        "steps": "1. Chọn B2 (90k).\n2. Chọn F5 (120k).\n3. Chọn cặp Sweetbox I3-I4 (200k).\n4. Kiểm tra dòng chi tiết và tổng cộng.",
        "expected": "Bảng chi tiết liệt kê rõ ràng từng loại ghế, Tổng tiền = 90.000 + 120.000 + 200.000 = 410.000đ hoàn toàn chính xác.",
        "r1": "Fail",
        "bug": "BUG_BK_02",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đợt 1 bị tính lệch 610.000đ do Sweetbox bị lặp. Đợt 2 đã fix chuẩn 410.000đ."
      },
      {
        "id": "TC_BK_14",
        "summary": "Xác minh hai tài khoản không thể đặt trùng cùng một ghế (Concurrency / Race Condition)",
        "pre": "Hai tài khoản A và B cùng mở suất chiếu lúc 19:30",
        "data": "Tài khoản A chọn ghế G5 và thanh toán trước, Tài khoản B cũng chọn ghế G5 và bấm thanh toán sau 2 giây",
        "steps": "1. Trình duyệt A: User A chọn ghế G5 và bấm \"Thanh toán\".\n2. Trình duyệt B: User B cũng đang chọn ghế G5 và bấm \"Thanh toán\" ngay sau đó.\n3. Quan sát kết quả xử lý của hệ thống.",
        "expected": "User A thanh toán thành công nhận vé. Hệ thống phát hiện xung đột đồng thời của User B, lập tức hủy thao tác của B, hiển thị cảnh báo: \"Rất tiếc! Ghế G5 vừa được khách hàng khác thanh toán thành công. Vui lòng chọn ghế khác\". Ghế G5 trên màn hình của B tự động chuyển xám.",
        "r1": "Fail",
        "bug": "BUG_BK_03",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đợt 1 không kiểm tra conflict trước khi commit làm 2 người trùng vé. Đợt 2 bổ sung atomic verification check."
      },
      {
        "id": "TC_BK_20",
        "summary": "Xác minh hiển thị sơ đồ ghế trên màn hình điện thoại (Responsive Mobile)",
        "pre": "Màn hình điện thoại iPhone / Android (375x667)",
        "data": "Giao diện đặt vé trên mobile",
        "steps": "1. Mở trang sơ đồ ghế trên điện thoại 375px width.\n2. Quan sát lưới 12-14 cột ghế và thanh thanh toán.",
        "expected": "Lưới ghế tự động co giãn linh hoạt hoặc cho phép vuốt nhẹ theo khung nhìn tối ưu (overflow-x-auto mượt mà có chỉ dẫn \"Vuốt ngang để xem toàn bộ ghế\"), KHÔNG LÀM TRÀN TOÀN BỘ TRANG WEB, thanh tổng tiền ghim cố định ở đáy màn hình (bottom sticky bar) dễ bấm.",
        "r1": "Fail",
        "bug": "BUG_BK_04",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Đợt 1 sơ đồ ghế vỡ layout tràn ngang màn hình điện thoại. Đợt 2 bổ sung wrapper container và sticky summary bar."
      }
    ]
  },
  "PRF": {
    "code": "Thông tin cá nhân & Lịch sử (Profile & History)",
    "name": "Thông tin cá nhân & lịch sử",
    "round1": {
      "done": 14,
      "bugs": 0,
      "pending": 0,
      "blocked": 1,
      "total": 14
    },
    "round2": {
      "done": 14,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 14
    },
    "cases": [
      {
        "id": "TC_PRF_01",
        "summary": "Xác minh email hiển thị và bị khóa không cho sửa (Read-only Email)",
        "pre": "Đã đăng nhập vào trang /profile",
        "data": "Email: user@movix.vn",
        "steps": "1. Mở trang Hồ sơ cá nhân.\n2. Nhấp chuột vào trường Email và cố gắng chỉnh sửa.",
        "expected": "Trường Email ở trạng thái disabled / read-only, con trỏ chuột dạng not-allowed, có ghi chú \"Email tài khoản không thể thay đổi\".",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Khóa sửa email đúng quy định bảo mật"
      },
      {
        "id": "TC_PRF_02",
        "summary": "Xác minh sửa đổi họ tên thành công",
        "pre": "Hồ sơ người dùng",
        "data": "Họ tên mới: \"Nguyễn Văn Hùng\"",
        "steps": "1. Nhập họ tên mới.\n2. Nhấn \"Lưu thay đổi\".\n3. Tải lại trang kiểm tra.",
        "expected": "Toast báo \"Cập nhật thông tin thành công!\", tên mới hiển thị trên Header và hồ sơ.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Cập nhật tên tốt"
      },
      {
        "id": "TC_PRF_03",
        "summary": "Xác minh thông báo lỗi khi để trống họ tên",
        "pre": "Đang ở trang /profile",
        "data": "Họ tên: \"\" (xóa rỗng)",
        "steps": "1. Xóa hết ký tự trong ô Họ tên.\n2. Nhấn \"Lưu thay đổi\".",
        "expected": "Báo lỗi đỏ: \"Họ và tên không được để trống\". Không lưu vào DB.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Validation client chặt chẽ"
      },
      {
        "id": "TC_PRF_04",
        "summary": "Xác minh thông báo lỗi khi số điện thoại sai định dạng",
        "pre": "Đang sửa thông tin",
        "data": "SĐT mới: \"09ab12\"",
        "steps": "1. Nhập SĐT chứa chữ hoặc không đủ 10 số.\n2. Nhấn \"Lưu thay đổi\".",
        "expected": "Hiển thị thông báo \"Số điện thoại không hợp lệ\". Chặn cập nhật.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Regex phone kiểm tra đúng"
      },
      {
        "id": "TC_PRF_05",
        "summary": "Xác minh tải ảnh đại diện hợp lệ (.jpg, .png < 5MB)",
        "pre": "Đang ở trang hồ sơ",
        "data": "File ảnh avatar.jpg kích thước 1.2MB",
        "steps": "1. Bấm nút chọn ảnh đại diện mới.\n2. Chọn file avatar.jpg hợp lệ.\n3. Bấm \"Cập nhật\".",
        "expected": "Ảnh avatar được tải lên và hiển thị xem trước tức thì, lưu thành công vào hồ sơ người dùng.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "18/10/2026",
        "notes": "Tải ảnh đại diện thành công"
      }
    ]
  },
  "AI": {
    "code": "Chatbot AI Tư vấn điện ảnh (AI Assistant)",
    "name": "Chatbot AI",
    "round1": {
      "done": 16,
      "bugs": 2,
      "pending": 0,
      "blocked": 0,
      "total": 16
    },
    "round2": {
      "done": 16,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 16
    },
    "cases": [
      {
        "id": "TC_AI_01",
        "summary": "Xác minh mở khung chatbot nổi ở góc phải màn hình",
        "pre": "Người dùng ở bất kỳ trang nào trên website Movix",
        "data": "Click vào biểu tượng nút tròn Chatbot AI màu tím cam ở góc dưới cùng bên phải",
        "steps": "1. Nhấp chuột vào nút mở chatbot.\n2. Quan sát hoạt ảnh mở popup sổ lên.",
        "expected": "Cửa sổ chat mở lên mượt mà, hiển thị lời chào mở đầu thân thiện: \"Xin chào! Tôi là Movix AI Assistant...\", kèm các nút gợi ý câu hỏi nhanh.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Khung chat mở mượt mà"
      },
      {
        "id": "TC_AI_02",
        "summary": "Xác minh gợi ý phim theo thể loại người dùng yêu cầu",
        "pre": "Khung chat đang mở",
        "data": "Câu hỏi: \"Gợi ý cho tôi các phim hành động hấp dẫn đang chiếu\"",
        "steps": "1. Nhập câu hỏi và gửi.\n2. Quan sát phản hồi của AI.",
        "expected": "AI phản hồi liệt kê đúng các phim hành động đang có trong rạp (ví dụ: Avatar 2, Dune 2), kèm tóm tắt ngắn và nút bấm chuyển đến trang phim.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Gợi ý thể loại chính xác"
      },
      {
        "id": "TC_AI_03",
        "summary": "Xác minh gợi ý phim theo tâm trạng hoặc nhóm người xem (Gia đình, Cặp đôi)",
        "pre": "Khung chat đang mở",
        "data": "Câu hỏi: \"Cuối tuần tôi đi xem phim cùng gia đình có trẻ em thì nên xem phim nào?\"",
        "steps": "1. Gửi câu hỏi về phim gia đình/trẻ em.\n2. Đọc nội dung tư vấn.",
        "expected": "AI nhận diện đối tượng có trẻ nhỏ, ưu tiên gợi ý các phim hoạt hình/gia đình nhãn P (như Doremon, Spider-Man), tuyệt đối không gợi ý phim kinh dị/bạo lực.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Phân tích ngữ cảnh tâm lý tốt"
      },
      {
        "id": "TC_AI_04",
        "summary": "Xác minh cơ chế bảo vệ độ tuổi: Không gợi ý phim C18 cho người dùng dưới 18 tuổi",
        "pre": "Khung chat đang mở",
        "data": "Câu hỏi: \"Em năm nay 15 tuổi, rạp có phim gì hay tư vấn cho em với?\"",
        "steps": "1. Nhập câu hỏi nêu rõ độ tuổi 15 tuổi.\n2. Kiểm tra danh sách phim AI gợi ý trong câu trả lời.",
        "expected": "AI nhận biết khách hàng 15 tuổi, CHỈ gợi ý phim nhãn P hoặc T13. TUYỆT ĐỐI KHÔNG gợi ý phim C18 (Deadpool & Wolverine), đồng thời có câu nhắc nhở thân thiện về quy định độ tuổi tại rạp.",
        "r1": "Fail",
        "bug": "BUG_AI_01",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Đợt 1 AI vẫn gợi ý phim C18 cho người 15 tuổi do prompt thiếu guardrail. Đợt 2 đã bổ sung system instruction & age filter."
      },
      {
        "id": "TC_AI_11",
        "summary": "Xác minh xử lý khi mất kết nối mạng hoặc lỗi server AI (Network Failure Resilience)",
        "pre": "Mất kết nối mạng internet hoặc ngắt proxy API",
        "data": "Gửi tin nhắn: \"Tư vấn phim giúp tôi\"",
        "steps": "1. Ngắt kết nối mạng trong tab Network DevTools (Offline mode).\n2. Gửi câu hỏi vào khung chat.\n3. Quan sát phản hồi và trạng thái khung chat.",
        "expected": "Giao diện KHÔNG ĐƯỢC TREO đơ ở trạng thái loading spinner vĩnh viễn. Sau thời gian ngắn, hệ thống hiển thị thông báo lỗi thân thiện: \"Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra kết nối mạng và thử lại sau ít phút\", kèm nút bấm \"Thử lại\". Khung chat vẫn nhập được câu hỏi mới.",
        "r1": "Fail",
        "bug": "BUG_AI_02",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Đợt 1 khung chat bị treo vĩnh viễn ở trạng thái \"Đang gõ...\". Đợt 2 đã bổ sung khối try/catch timeout và nút thử lại."
      }
    ]
  },
  "MOV": {
    "code": "Quản lý phim (Admin Movie Management)",
    "name": "Quản lý phim",
    "round1": {
      "done": 17,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 17
    },
    "round2": {
      "done": 17,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 17
    },
    "cases": [
      {
        "id": "TC_MOV_01",
        "summary": "Xác minh tìm phim theo tên phim chính xác trong bảng quản trị",
        "pre": "Đã đăng nhập tài khoản Quản trị viên, mở trang /admin/movies",
        "data": "Từ khóa tìm: \"Avatar: The Way of Water\"",
        "steps": "1. Nhập tên phim vào thanh tìm kiếm quản trị.\n2. Quan sát danh sách.",
        "expected": "Bảng hiển thị đúng dòng dữ liệu phim Avatar kèm thông tin thời lượng, thể loại, trạng thái và nút hành động.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Tìm kiếm admin nhanh chóng"
      },
      {
        "id": "TC_MOV_02",
        "summary": "Xác minh thông báo khi không tìm thấy kết quả phù hợp trong quản trị",
        "pre": "Đang ở trang /admin/movies",
        "data": "Từ khóa: \"zzzz_phim_khong_ton_tai\"",
        "steps": "1. Nhập từ khóa không có thực.\n2. Nhấn tìm kiếm.",
        "expected": "Hiển thị thông báo \"Không tìm thấy phim nào phù hợp với bộ lọc\".",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Empty state hiển thị tốt"
      },
      {
        "id": "TC_MOV_03",
        "summary": "Xác minh danh sách phim hiển thị đủ cột và đúng dữ liệu",
        "pre": "Trang /admin/movies",
        "data": "Toàn bộ danh sách phim trong hệ thống",
        "steps": "1. Kiểm tra các tiêu đề cột: Poster, Tên phim, Thể loại, Thời lượng, Độ tuổi, Trạng thái, Ngày khởi chiếu, Hành động (Sửa/Xóa).",
        "expected": "Hiển thị đầy đủ tất cả các cột, dữ liệu ánh xạ chính xác từ bảng movies trong database.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Bảng dữ liệu chuẩn xác"
      },
      {
        "id": "TC_MOV_04",
        "summary": "Xác minh thêm phim mới thành công với dữ liệu hợp lệ",
        "pre": "Đang mở modal \"Thêm phim mới\"",
        "data": "Tên phim: \"Mission Impossible 8\", Thể loại: \"Hành động\", Thời lượng: 165 phút, Độ tuổi: \"C16\", Trailer: URL Youtube, Poster: file ảnh hợp lệ",
        "steps": "1. Nhấp nút \"+ Thêm phim mới\".\n2. Điền đầy đủ thông tin hợp lệ.\n3. Nhấn nút \"Lưu phim\".",
        "expected": "Modal đóng lại, hiển thị toast thành công: \"Thêm phim mới thành công!\", phim mới xuất hiện ngay lập tức ở đầu danh sách quản trị.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Tạo phim mới thành công"
      },
      {
        "id": "TC_MOV_05",
        "summary": "Xác minh thông báo lỗi khi để trống toàn bộ trường khi thêm mới",
        "pre": "Mở modal \"Thêm phim mới\"",
        "data": "Tất cả các trường: null",
        "steps": "1. Mở modal thêm phim.\n2. Nhấn nút \"Lưu phim\" ngay lập tức mà không điền thông tin.",
        "expected": "Chặn lưu, hiển thị viền đỏ và thông báo yêu cầu bắt buộc nhập các trường: Tên phim, Thể loại, Thời lượng.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Form validation nghiêm ngặt"
      }
    ]
  },
  "ROM": {
    "code": "Quản lý phòng chiếu (Room Management)",
    "name": "Quản lý phòng chiếu",
    "round1": {
      "done": 15,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 15
    },
    "round2": {
      "done": 15,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 15
    },
    "cases": [
      {
        "id": "TC_ROM_01",
        "summary": "Xác minh tìm phòng chiếu theo tên phòng chính xác",
        "pre": "Đã vào trang /admin/rooms",
        "data": "Từ khóa: \"Phòng 1 (Standard 2D)\"",
        "steps": "1. Nhập tên phòng vào ô tìm kiếm.\n2. Quan sát bảng.",
        "expected": "Hiển thị chính xác phòng chiếu cần tìm kèm số lượng ghế và cụm rạp sở hữu.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Tìm kiếm phòng nhanh"
      },
      {
        "id": "TC_ROM_02",
        "summary": "Xác minh danh sách phòng chiếu hiển thị đủ cột và dữ liệu chuẩn",
        "pre": "Trang /admin/rooms",
        "data": "Danh sách phòng chiếu",
        "steps": "1. Kiểm tra các cột: Tên phòng, Cụm rạp, Tổng số ghế, Số hàng, Số cột, Loại phòng (2D/3D/IMAX), Hành động.",
        "expected": "Hiển thị đủ tất cả các trường dữ liệu và số lượng ghế khớp thực tế.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Bảng dữ liệu chuẩn"
      },
      {
        "id": "TC_ROM_03",
        "summary": "Xác minh thêm phòng chiếu mới thành công với dữ liệu hợp lệ",
        "pre": "Modal \"Thêm phòng chiếu\"",
        "data": "Tên: \"Phòng 3 (IMAX Laser)\", Rạp: \"CGV Bà Triệu\", Hàng ghế: 8, Cột ghế: 10",
        "steps": "1. Điền tên phòng, chọn cụm rạp, nhập số hàng 8, số cột 10.\n2. Nhấn \"Lưu phòng chiếu\".",
        "expected": "Tạo phòng mới thành công, tự động khởi tạo ma trận 80 ghế (8x10) mặc định.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Tạo phòng thành công"
      },
      {
        "id": "TC_ROM_04",
        "summary": "Xác minh thông báo lỗi khi để trống toàn bộ trường khi thêm phòng",
        "pre": "Modal thêm phòng chiếu",
        "data": "Tất cả: null",
        "steps": "1. Nhấn Lưu ngay khi các ô trống.",
        "expected": "Báo lỗi yêu cầu nhập đầy đủ Tên phòng, Cụm rạp và Số hàng ghế.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Chặn submit rỗng"
      },
      {
        "id": "TC_ROM_05",
        "summary": "Xác minh chặn nhập Số hàng ghế là số âm hoặc số 0 (BVA)",
        "pre": "Modal thêm phòng",
        "data": "Số hàng ghế: -5 hoặc 0",
        "steps": "1. Nhập Số hàng ghế = -5.\n2. Nhấn Lưu.",
        "expected": "Hiển thị thông báo lỗi: \"Số hàng ghế phải là số nguyên dương lớn hơn 0 (từ 1 đến 20 hàng)\".",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "BVA số hàng ghế chuẩn"
      }
    ]
  },
  "SHW": {
    "code": "Quản lý suất chiếu (Showtime Management)",
    "name": "Quản lý suất chiếu",
    "round1": {
      "done": 17,
      "bugs": 1,
      "pending": 0,
      "blocked": 0,
      "total": 17
    },
    "round2": {
      "done": 17,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 17
    },
    "cases": [
      {
        "id": "TC_SHW_01",
        "summary": "Xác minh tìm suất chiếu theo tên phim chính xác",
        "pre": "Đã vào trang /admin/showtimes",
        "data": "Từ khóa: \"Avatar: The Way of Water\"",
        "steps": "1. Nhập tên phim vào thanh lọc suất chiếu.\n2. Quan sát kết quả.",
        "expected": "Chỉ hiển thị các suất chiếu của phim Avatar, liệt kê rõ rạp, phòng, ngày và giờ chiếu.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Tìm suất chiếu nhanh"
      },
      {
        "id": "TC_SHW_02",
        "summary": "Xác minh danh sách suất chiếu hiển thị đủ cột và dữ liệu chuẩn",
        "pre": "Trang /admin/showtimes",
        "data": "Danh sách suất chiếu",
        "steps": "1. Kiểm tra các cột: Phim, Cụm rạp & Phòng, Ngày chiếu, Giờ bắt đầu, Giờ kết thúc, Giá vé gốc, Ghế đã đặt, Trạng thái, Thao tác.",
        "expected": "Hiển thị đầy đủ mọi cột, giờ kết thúc tự tính chuẩn xác theo thời lượng phim.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Dữ liệu hiển thị chi tiết"
      },
      {
        "id": "TC_SHW_03",
        "summary": "Xác minh thêm suất chiếu mới thành công với dữ liệu hợp lệ",
        "pre": "Modal \"Thêm suất chiếu\"",
        "data": "Phim: \"Avatar 2\" (192 phút), Rạp: CGV Bà Triệu, Phòng 1, Ngày mai, Bắt đầu: 14:00, Giá vé: 100.000đ",
        "steps": "1. Chọn phim, rạp, phòng, ngày chiếu và giờ bắt đầu.\n2. Kiểm tra giờ kết thúc tự tính (14:00 + 192p = 17:12).\n3. Nhấn \"Lưu suất chiếu\".",
        "expected": "Tạo thành công, thông báo \"Thêm suất chiếu mới thành công!\", suất chiếu xuất hiện trong danh sách.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Thêm suất chiếu tốt"
      },
      {
        "id": "TC_SHW_04",
        "summary": "Xác minh thông báo lỗi khi để trống toàn bộ trường khi thêm",
        "pre": "Modal thêm suất chiếu",
        "data": "Tất cả: null",
        "steps": "1. Bấm Lưu mà không chọn phim hay nhập giờ.",
        "expected": "Chặn submit, báo lỗi bắt buộc chọn Phim, Cụm rạp, Phòng chiếu và Giờ chiếu.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Validation chuẩn"
      },
      {
        "id": "TC_SHW_05",
        "summary": "Xác minh chặn nhập Giá vé là số âm hoặc bằng 0",
        "pre": "Modal thêm suất chiếu",
        "data": "Giá vé: -50.000đ hoặc 0đ",
        "steps": "1. Nhập Giá vé = -50000.\n2. Nhấn Lưu.",
        "expected": "Hệ thống báo lỗi: \"Giá vé phải là số nguyên dương hợp lệ (tối thiểu 40.000đ)\".",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "BVA giá vé chuẩn"
      },
      {
        "id": "TC_SHW_14",
        "summary": "Xác minh khi SỬA giờ chiếu của suất hiện tại cũng phải kiểm tra trùng lịch (Collision Check on Edit)",
        "pre": "Phòng 2 có 2 suất: Suất 1 (14:00 - 16:00) và Suất 2 (18:00 - 20:00)",
        "data": "Mở sửa Suất 2, đổi giờ bắt đầu thành 15:00 (chồng lấn vào Suất 1)",
        "steps": "1. Nhấp Sửa Suất 2.\n2. Đổi giờ từ 18:00 thành 15:00.\n3. Nhấn \"Cập nhật suất chiếu\".\n4. Quan sát phản hồi.",
        "expected": "Hệ thống kiểm tra va chạm lịch (bỏ qua chính ID của suất đang sửa) và phát hiện xung đột với Suất 1, hiển thị cảnh báo lỗi trùng lịch, KHÔNG CHO PHÉP LƯU.",
        "r1": "Fail",
        "bug": "BUG_SHW_01",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Đợt 1 khi sửa giờ không gọi hàm kiểm tra trùng lịch nên cho lưu đè. Đợt 2 đã fix checkOverlap() cả khi edit."
      }
    ]
  },
  "ORD": {
    "code": "Quản lý vé & Đơn đặt vé (Order & Booking Management)",
    "name": "Quản lý vé & đơn đặt vé",
    "round1": {
      "done": 15,
      "bugs": 1,
      "pending": 0,
      "blocked": 1,
      "total": 15
    },
    "round2": {
      "done": 15,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 15
    },
    "cases": [
      {
        "id": "TC_ORD_01",
        "summary": "Xác minh tìm đơn đặt vé theo Mã đơn chính xác (Order Code)",
        "pre": "Đã vào trang /admin/orders",
        "data": "Mã đơn có sẵn: \"MVX-92813\"",
        "steps": "1. Nhập \"MVX-92813\" vào ô tìm kiếm.\n2. Quan sát kết quả.",
        "expected": "Hiển thị chính xác đơn hàng có mã MVX-92813 kèm tên khách, phim, ghế và số tiền.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Tìm kiếm mã đơn nhanh"
      },
      {
        "id": "TC_ORD_02",
        "summary": "Xác minh tìm đơn theo tên khách hàng",
        "pre": "Trang quản lý đơn",
        "data": "Tên khách: \"Nguyễn Toàn Thắng\"",
        "steps": "1. Nhập tên khách hàng.\n2. Quan sát danh sách.",
        "expected": "Hiển thị toàn bộ các đơn hàng do khách hàng Nguyễn Toàn Thắng thực hiện.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Lọc theo khách chuẩn"
      },
      {
        "id": "TC_ORD_03",
        "summary": "Xác minh lọc đơn theo trạng thái (Đã thanh toán / Chờ thanh toán / Đã hủy)",
        "pre": "Trang quản lý đơn",
        "data": "Dropdown trạng thái: \"Đã thanh toán\"",
        "steps": "1. Chọn lọc trạng thái \"Đã thanh toán\".\n2. Kiểm tra các dòng dữ liệu.",
        "expected": "Tất cả các đơn hiển thị đều có badge màu xanh lá \"Đã thanh toán\" (status: paid).",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Lọc trạng thái chính xác"
      },
      {
        "id": "TC_ORD_04",
        "summary": "Xác minh lọc đơn theo ngày giao dịch",
        "pre": "Trang quản lý đơn",
        "data": "Bộ chọn ngày: Ngày hôm nay",
        "steps": "1. Chọn xem các đơn phát sinh trong ngày hôm nay.",
        "expected": "Hiển thị chính xác các đơn hàng được tạo trong ngày đã chọn.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Lọc ngày tốt"
      },
      {
        "id": "TC_ORD_09",
        "summary": "Xác minh HOÀN TRẢ GHẾ về trạng thái trống ngay sau khi Hủy đơn hàng (Seat Release on Order Cancel)",
        "pre": "Đơn hàng MVX-92813 đã đặt các ghế G5, G6",
        "data": "Thực hiện thao tác Hủy đơn MVX-92813",
        "steps": "1. Quản trị viên nhấp Hủy đơn MVX-92813 và xác nhận.\n2. Đơn hàng chuyển sang trạng thái \"Đã hủy\".\n3. Mở sơ đồ ghế của suất chiếu đó trên màn hình đặt vé.\n4. Quan sát trạng thái của hai ghế G5 và G6.",
        "expected": "Sau khi đơn bị hủy, hệ thống TỰ ĐỘNG giải phóng hai ghế G5 và G6, đưa trạng thái từ Booked trở lại trạng thái AVAILABLE (ghế trống). Khách hàng khác có thể tiếp tục nhấp chọn và mua hai ghế này bình thường.",
        "r1": "Fail",
        "bug": "BUG_ORD_01",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Đợt 1 đơn hủy nhưng ghế vẫn bị kẹt trạng thái Booked. Đợt 2 đã fix releaseSeatsOnCancel() giải phóng ghế ngay lập tức."
      }
    ]
  },
  "CUS": {
    "code": "Quản lý khách hàng (Customer Management)",
    "name": "Quản lý khách hàng",
    "round1": {
      "done": 11,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 11
    },
    "round2": {
      "done": 11,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 11
    },
    "cases": [
      {
        "id": "TC_CUS_01",
        "summary": "Xác minh tìm khách hàng theo họ tên chính xác",
        "pre": "Trang /admin/users (tab Khách hàng)",
        "data": "Từ khóa: \"Lê Phương Thảo\"",
        "steps": "1. Nhập tên vào ô tìm kiếm.\n2. Quan sát kết quả.",
        "expected": "Hiển thị chính xác dòng thông tin khách hàng Lê Phương Thảo kèm email, SĐT, ngày đăng ký.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Tìm kiếm khách hàng chuẩn"
      },
      {
        "id": "TC_CUS_02",
        "summary": "Xác minh sửa thông tin khách hàng thành công",
        "pre": "Chọn 1 khách hàng",
        "data": "Sửa họ tên, cập nhật số điện thoại mới",
        "steps": "1. Bấm nút Sửa.\n2. Nhập thông tin mới hợp lệ.\n3. Nhấn Lưu.",
        "expected": "Cập nhật thành công, dữ liệu mới hiển thị ngay lập tức.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Sửa khách hàng tốt"
      },
      {
        "id": "TC_CUS_03",
        "summary": "Xác minh thông báo lỗi khi sửa để trống Họ tên",
        "pre": "Modal sửa khách hàng",
        "data": "Họ tên: \"\" (xóa rỗng)",
        "steps": "1. Xóa rỗng ô Họ tên.\n2. Nhấn Lưu.",
        "expected": "Báo lỗi: \"Họ và tên khách hàng không được để trống\". Chặn lưu.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Validation tốt"
      }
    ]
  },
  "EMP": {
    "code": "Quản lý nhân viên (Employee & Staff Management)",
    "name": "Quản lý nhân viên",
    "round1": {
      "done": 14,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 14
    },
    "round2": {
      "done": 14,
      "bugs": 0,
      "pending": 0,
      "blocked": 0,
      "total": 14
    },
    "cases": [
      {
        "id": "TC_EMP_01",
        "summary": "Xác minh tìm nhân viên theo họ tên chính xác",
        "pre": "Trang /admin/users (tab Nhân viên)",
        "data": "Từ khóa: \"Trần Minh Anh\"",
        "steps": "1. Nhập tên nhân viên vào ô tìm kiếm.\n2. Quan sát kết quả.",
        "expected": "Hiển thị chính xác nhân viên Trần Minh Anh kèm vai trò và quyền hạn được phân.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Tìm kiếm nhân viên tốt"
      },
      {
        "id": "TC_EMP_02",
        "summary": "Xác minh thêm nhân viên mới thành công với dữ liệu hợp lệ",
        "pre": "Modal \"Thêm nhân viên mới\"",
        "data": "Họ tên: \"Phạm Quốc Bảo\", Email: \"bao.pham@movix.vn\", SĐT: \"0968112233\", Mật khẩu: \"Staff@123\", Vai trò: \"staff\"",
        "steps": "1. Mở modal thêm nhân viên.\n2. Điền đầy đủ thông tin hợp lệ.\n3. Chọn phân quyền \"Nhân viên rạp\".\n4. Nhấn \"Lưu nhân viên\".",
        "expected": "Tạo thành công, thông báo \"Thêm nhân viên mới thành công!\", tài khoản mới có thể đăng nhập ngay vào hệ thống.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Thêm nhân viên thành công"
      },
      {
        "id": "TC_EMP_03",
        "summary": "Xác minh thông báo lỗi khi để trống toàn bộ trường khi thêm",
        "pre": "Modal thêm nhân viên",
        "data": "Tất cả: null",
        "steps": "1. Bấm Lưu mà không nhập.",
        "expected": "Báo lỗi bắt buộc nhập Họ tên, Email, Số điện thoại và Mật khẩu khởi tạo.",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Validation chuẩn"
      },
      {
        "id": "TC_EMP_04",
        "summary": "Xác minh thông báo lỗi khi Email nhân viên sai định dạng",
        "pre": "Modal thêm nhân viên",
        "data": "Email: \"nhanvien@\"",
        "steps": "1. Nhập email sai định dạng.\n2. Nhấn Lưu.",
        "expected": "Báo lỗi: \"Định dạng email nhân viên không hợp lệ\".",
        "r1": "Pass",
        "bug": "",
        "r2": "Pass",
        "tester": "Nguyễn Hữu Thăng",
        "date": "19/10/2026",
        "notes": "Kiểm tra regex email"
      }
    ]
  }
};