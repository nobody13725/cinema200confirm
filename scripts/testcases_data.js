// Data for 200 Detailed Test Cases across 14 Modules for Movix Cinemax
export const TEST_CASES_DATA = {
  REG: {
    code: 'Đăng ký (Register)',
    name: 'Đăng ký',
    round1: { done: 14, bugs: 2, pending: 0, blocked: 0, total: 14 },
    round2: { done: 14, bugs: 0, pending: 0, blocked: 0, total: 14 },
    cases: [
      {
        id: 'TC_REG_01',
        summary: 'Xác minh thông báo lỗi khi để trống toàn bộ ô nhập',
        pre: 'Truy cập vào trang web http://localhost:3000/register',
        data: 'Để trống tất cả trường (Họ tên: null, Email: null, SĐT: null, Mật khẩu: null, Xác nhận: null)',
        steps: '1. Mở trang Đăng ký từ nút trên Header.\n2. Không nhập bất kỳ thông tin nào.\n3. Nhấp nút "Tiếp tục xác nhận OTP" hoặc "Đăng ký".\n4. Quan sát phản hồi trên giao diện.',
        expected: 'Hệ thống chặn submit, các trường input chuyển viền đỏ và hiển thị thông báo lỗi rõ ràng bên dưới từng trường: "Vui lòng nhập họ và tên", "Vui lòng nhập email", "Vui lòng nhập mật khẩu". Không gửi request rác lên server.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Form validation chặn tốt ở Client'
      },
      {
        id: 'TC_REG_02',
        summary: 'Xác minh đăng ký thành công với dữ liệu hợp lệ',
        pre: 'Người dùng vãng lai chưa có tài khoản trong hệ thống',
        data: 'Họ tên: "Nguyễn Văn A", Email: "a.test@gmail.com", SĐT: "0912345678", Mật khẩu: "Abc@12345", Xác nhận: "Abc@12345"',
        steps: '1. Mở trang Đăng ký.\n2. Điền đầy đủ và chính xác tất cả thông tin hợp lệ.\n3. Nhấp nút "Đăng ký".\n4. Kiểm tra phản hồi thông báo và luồng chuyển hướng.',
        expected: 'Hiển thị toast thông báo thành công: "Đăng ký tài khoản thành công!", hệ thống lưu tài khoản mới vào cơ sở dữ liệu với vai trò "user", tự động điều hướng sang trang Đăng nhập hoặc Trang chủ kèm trạng thái đã đăng nhập.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Dữ liệu đã được lưu vào Auth DB'
      },
      {
        id: 'TC_REG_03',
        summary: 'Xác minh thông báo lỗi khi email đã tồn tại',
        pre: 'Hệ thống đã có tài khoản với email a.test@gmail.com',
        data: 'Email: "a.test@gmail.com" (đã đăng ký), Họ tên: "Trần Văn B", SĐT: "0987654321", Mật khẩu: "Abc@12345"',
        steps: '1. Nhập họ tên, SĐT và mật khẩu hợp lệ.\n2. Nhập Email trùng với email đã có trong hệ thống.\n3. Nhấn "Đăng ký".\n4. Quan sát thông báo trả về.',
        expected: 'Hệ thống hiển thị thông báo lỗi nổi bật: "Email này đã được đăng ký tài khoản. Vui lòng sử dụng email khác hoặc Đăng nhập". Không cho phép tạo tài khoản trùng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Backend trả về mã conflict chính xác'
      },
      {
        id: 'TC_REG_04',
        summary: 'Xác minh email chữ hoa trùng với email đã đăng ký',
        pre: 'Đã có tài khoản mang email: a.test@gmail.com',
        data: 'Email nhập: "A.TEST@GMAIL.COM", Họ tên: "Lê Thị C", SĐT: "0901234567", Mật khẩu: "Abc@12345"',
        steps: '1. Nhập họ tên và SĐT mới.\n2. Nhập email trùng nhưng cố tình gõ in hoa toàn bộ: "A.TEST@GMAIL.COM".\n3. Nhấn "Đăng ký".\n4. Kiểm tra tính năng chuẩn hóa (normalize/lowercase) email.',
        expected: 'Hệ thống tự động chuyển đổi chữ thường (to LowerCase) trước khi kiểm tra và phát hiện trùng lặp, hiển thị thông báo lỗi "Email này đã tồn tại".',
        r1: 'Fail', bug: 'BUG_REG_01', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 phân biệt hoa thường dẫn đến tạo trùng. Đợt 2 đã fix trim().toLowerCase().'
      },
      {
        id: 'TC_REG_05',
        summary: 'Xác minh thông báo lỗi khi email thiếu ký tự @ hoặc sai định dạng',
        pre: 'Đang ở form Đăng ký',
        data: 'Email nhập: "a.testgmail.com", "user@domain..com", "@gmail.com"',
        steps: '1. Nhập thông tin họ tên, SĐT, mật khẩu hợp lệ.\n2. Nhập email thiếu ký tự "@" hoặc sai cú pháp RFC 5322.\n3. Nhấp ra ngoài trường nhập (blur) hoặc nhấn "Đăng ký".',
        expected: 'Trường Email lập tức chuyển màu đỏ, hiển thị tooltip hoặc thông báo lỗi: "Định dạng email không hợp lệ (Ví dụ: tenban@gmail.com)". Nút Đăng ký không kích hoạt gửi dữ liệu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Regex kiểm tra email hoạt động chuẩn'
      },
      {
        id: 'TC_REG_06',
        summary: 'Xác minh xác nhận mật khẩu không khớp',
        pre: 'Đang ở form Đăng ký',
        data: 'Mật khẩu: "Abc@12345", Nhập lại mật khẩu: "Abc@1234"',
        steps: '1. Nhập đầy đủ thông tin hợp lệ.\n2. Nhập Mật khẩu: "Abc@12345".\n3. Nhập ô Xác nhận mật khẩu khác: "Abc@1234".\n4. Nhấn "Đăng ký".',
        expected: 'Hiển thị thông báo đỏ ngay dưới ô xác nhận mật khẩu: "Mật khẩu xác nhận không trùng khớp". Chặn gửi biểu mẫu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'So sánh realtime khớp ký tự'
      },
      {
        id: 'TC_REG_07',
        summary: 'Xác minh mật khẩu ngắn hơn độ dài tối thiểu theo đặc tả',
        pre: 'Đang ở form Đăng ký',
        data: 'Mật khẩu: "Ab@1" (4 ký tự, dưới 6 ký tự chuẩn SRS)',
        steps: '1. Nhập họ tên, email, SĐT hợp lệ.\n2. Nhập mật khẩu 4 ký tự: "Ab@1".\n3. Nhấn "Đăng ký".',
        expected: 'Hiển thị lỗi: "Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên (khuyến khích bao gồm chữ hoa, chữ thường và số)". Chặn đăng ký.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'BVA: 5 ký tự báo lỗi, 6 ký tự hợp lệ'
      },
      {
        id: 'TC_REG_08',
        summary: 'Xác minh số điện thoại chứa chữ cái hoặc không đủ 10 chữ số',
        pre: 'Đang ở form Đăng ký',
        data: 'SĐT: "09123abc78" hoặc "0912345"',
        steps: '1. Nhập SĐT chứa chữ cái hoặc ít hơn 10 chữ số.\n2. Nhấn "Đăng ký".',
        expected: 'Hiển thị cảnh báo lỗi: "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng 10 chữ số bắt đầu bằng đầu số Việt Nam (03, 05, 07, 08, 09)".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Regex SĐT Việt Nam kiểm tra chính xác'
      },
      {
        id: 'TC_REG_09',
        summary: 'Xác minh số điện thoại đã tồn tại trên tài khoản khác',
        pre: 'Số 0912345678 đã được đăng ký bởi người dùng khác',
        data: 'SĐT: "0912345678", Email: "newuser123@gmail.com"',
        steps: '1. Nhập thông tin người dùng mới với SĐT đã tồn tại.\n2. Nhấn "Đăng ký".',
        expected: 'Hệ thống báo lỗi: "Số điện thoại này đã được liên kết với một tài khoản khác".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Kiểm tra ràng buộc duy nhất của SĐT'
      },
      {
        id: 'TC_REG_10',
        summary: 'Xác minh nhấn Đăng ký hai lần liên tiếp (Double-click submit)',
        pre: 'Điền đầy đủ thông tin hợp lệ ở form Đăng ký',
        data: 'Họ tên: "Đỗ Minh Quân", Email: "quan.do@gmail.com", SĐT: "0933112233", Pass: "Matkhau@123"',
        steps: '1. Điền toàn bộ thông tin hợp lệ.\n2. Nhấp đúp chuột thật nhanh 2 lần liên tiếp vào nút "Đăng ký".\n3. Kiểm tra phản ứng giao diện và log API.',
        expected: 'Hệ thống ngay lập tức vô hiệu hóa (disabled) nút bấm, hiển thị spinner loading "Đang xử lý...", chặn triệt để lệnh gửi thứ hai. Chỉ tạo đúng 1 tài khoản, không phát sinh lỗi 500 hay bản ghi trùng.',
        r1: 'Fail', bug: 'BUG_REG_03', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 bị lỗi 500 khi double submit. Đợt 2 bổ sung debounceRef và loading lock.'
      },
      {
        id: 'TC_REG_11',
        summary: 'Xác minh đăng nhập được ngay bằng tài khoản vừa đăng ký thành công',
        pre: 'Vừa hoàn tất đăng ký tài khoản a.test@gmail.com',
        data: 'Email: "a.test@gmail.com", Mật khẩu: "Abc@12345"',
        steps: '1. Điều hướng sang trang Đăng nhập (/login).\n2. Nhập thông tin tài khoản vừa đăng ký.\n3. Nhấn "Đăng nhập".',
        expected: 'Đăng nhập thành công, nhận JWT Token/Session, hiển thị thông tin chào mừng "Xin chào, Nguyễn Văn A" trên Navbar.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Xác thực tài khoản mới trơn tru'
      },
      {
        id: 'TC_REG_12',
        summary: 'Xác minh giao diện hiển thị đúng thiết kế, không vỡ bố cục trên desktop',
        pre: 'Màn hình máy tính độ phân giải 1920x1080',
        data: 'URL: http://localhost:3000/register',
        steps: '1. Mở trang đăng ký trên màn hình lớn.\n2. Quan sát tỷ lệ card, khoảng cách lề, font chữ, độ tương phản màu tím đen thương hiệu Movix.',
        expected: 'Khung form căn giữa màn hình, viền bo góc mượt mà, màu sắc chuẩn nhận diện Movix Cinemax, các nút bấm và icon hiển thị sắc nét.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'CSS Tailwind v4 hiển thị chuẩn'
      },
      {
        id: 'TC_REG_13',
        summary: 'Xác minh hiển thị và hoạt động trên trình duyệt Google Chrome bản mới nhất',
        pre: 'Trình duyệt Google Chrome v130+',
        data: 'URL: http://localhost:3000/register',
        steps: '1. Mở Chrome, truy cập trang đăng ký.\n2. Kiểm tra tính năng tự động điền (autofill), validation, chuyển tab phím Tab.',
        expected: 'Mọi tính năng hoạt động mượt mà, không có console error, phím Tab di chuyển focus tuần tự từ Họ tên -> Email -> SĐT -> Mật khẩu -> Nút bấm.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tương thích 100% Chrome'
      },
      {
        id: 'TC_REG_14',
        summary: 'Xác minh hiển thị trên màn hình điện thoại di động (Responsive 375x667)',
        pre: 'Bật chế độ Responsive DevTools (iPhone SE / 375x667)',
        data: 'Viewport 375px width',
        steps: '1. Chuyển DevTools sang 375px width.\n2. Kiểm tra lề trái phải, kích thước phím bấm trên màn hình cảm ứng, bàn phím ảo không che khuất ô nhập.',
        expected: 'Bố cục tự động co giãn 1 cột (w-full), không bị thanh cuộn ngang (horizontal scrollbar), các ô nhập và nút bấm có chiều cao tối thiểu 44px dễ bấm bằng ngón tay.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Giao diện Mobile co giãn mượt mà'
      }
    ]
  },
  LOG: {
    code: 'Đăng nhập (Login)',
    name: 'Đăng nhập',
    round1: { done: 13, bugs: 1, pending: 0, blocked: 0, total: 13 },
    round2: { done: 13, bugs: 0, pending: 0, blocked: 0, total: 13 },
    cases: [
      {
        id: 'TC_LOG_01',
        summary: 'Xác minh thông báo lỗi khi để trống toàn bộ ô nhập',
        pre: 'Đang ở trang /login',
        data: 'Email: null, Mật khẩu: null',
        steps: '1. Mở trang Đăng nhập.\n2. Không điền dữ liệu, nhấn ngay nút "Đăng nhập".\n3. Quan sát thông báo.',
        expected: 'Hiển thị viền đỏ và text lỗi: "Vui lòng nhập email" và "Vui lòng nhập mật khẩu". Không gửi request xác thực.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Validation client tốt'
      },
      {
        id: 'TC_LOG_02',
        summary: 'Xác minh khách hàng đăng nhập thành công',
        pre: 'Tài khoản khách hàng hợp lệ: user@movix.vn / 123456',
        data: 'Email: "user@movix.vn", Mật khẩu: "123456"',
        steps: '1. Nhập email và mật khẩu khách hàng.\n2. Nhấn "Đăng nhập".\n3. Kiểm tra điều hướng và phiên làm việc.',
        expected: 'Toast báo "Đăng nhập thành công!", chuyển hướng về Trang chủ, Navbar hiển thị avatar khách hàng và menu: "Vé của tôi", "Thông tin tài khoản", "Đăng xuất".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Phân quyền role: user chính xác'
      },
      {
        id: 'TC_LOG_03',
        summary: 'Xác minh quản trị viên (Admin) đăng nhập thành công',
        pre: 'Tài khoản admin hệ thống: admin@movix.vn / 123456',
        data: 'Email: "admin@movix.vn", Mật khẩu: "123456"',
        steps: '1. Nhập email và mật khẩu quản trị viên.\n2. Nhấn "Đăng nhập".',
        expected: 'Đăng nhập thành công, hệ thống điều hướng trực tiếp vào Bảng điều khiển Quản trị (/admin/movies), thanh menu Admin hiển thị đầy đủ 10 phân hệ nghiệp vụ.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Role: admin được cấp toàn quyền'
      },
      {
        id: 'TC_LOG_04',
        summary: 'Xác minh nhân viên (Staff) đăng nhập thành công và đúng phân quyền',
        pre: 'Tài khoản nhân viên rạp: staff@movix.vn / 123456',
        data: 'Email: "staff@movix.vn", Mật khẩu: "123456"',
        steps: '1. Nhập tài khoản nhân viên.\n2. Nhấn "Đăng nhập".\n3. Kiểm tra các menu hiển thị.',
        expected: 'Đăng nhập thành công, hiển thị badge "Nhân viên rạp", chỉ được truy cập các trang bán vé và kiểm soát đơn (Đơn đặt vé, Suất chiếu), không thấy menu Cấu hình hệ thống/Nhân viên.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'RBAC Staff hoạt động chuẩn'
      },
      {
        id: 'TC_LOG_05',
        summary: 'Xác minh thông báo lỗi khi nhập sai mật khẩu',
        pre: 'Đã có tài khoản user@movix.vn',
        data: 'Email: "user@movix.vn", Mật khẩu sai: "SaiPass123"',
        steps: '1. Nhập email đúng, mật khẩu sai.\n2. Nhấn "Đăng nhập".',
        expected: 'Hiển thị toast lỗi màu đỏ: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại". Giữ lại email đã nhập, làm trống ô mật khẩu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Bảo mật: không tiết lộ rõ email có tồn tại hay không'
      },
      {
        id: 'TC_LOG_06',
        summary: 'Xác minh tài khoản bị khóa (status: locked / suspended) không đăng nhập được',
        pre: 'Tài khoản locked_user@movix.vn có trạng thái is_locked: true',
        data: 'Email: "locked_user@movix.vn", Mật khẩu: "123456"',
        steps: '1. Nhập thông tin tài khoản đang bị khóa.\n2. Nhấn "Đăng nhập".',
        expected: 'Hệ thống từ chối đăng nhập, hiển thị thông báo: "Tài khoản của bạn đã bị tạm khóa do vi phạm chính sách hoặc yêu cầu từ quản trị viên. Vui lòng liên hệ hỗ trợ".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Kiểm soát trạng thái tài khoản active/locked chặt chẽ'
      },
      {
        id: 'TC_LOG_07',
        summary: 'Xác minh đăng xuất thành công khỏi hệ thống',
        pre: 'Người dùng đang ở trạng thái đã đăng nhập',
        data: 'Nhấp menu dropdown -> "Đăng xuất"',
        steps: '1. Nhấp vào ảnh đại diện hoặc menu tài khoản.\n2. Chọn "Đăng xuất".\n3. Xác nhận đăng xuất.',
        expected: 'Xóa sạch token và session khỏi localStorage/cookie, chuyển hướng về trang chủ ở trạng thái khách vãng lai, hiển thị lại 2 nút "Đăng nhập" và "Đăng ký".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Dọn dẹp session an toàn'
      },
      {
        id: 'TC_LOG_08',
        summary: 'Xác minh chưa đăng nhập vào trang đặt vé thì bị điều hướng đến Đăng nhập',
        pre: 'Người dùng vãng lai chưa đăng nhập',
        data: 'Truy cập trực tiếp URL: http://localhost:3000/booking/showtime-101',
        steps: '1. Mở tab ẩn danh hoặc chưa đăng nhập.\n2. Nhập thẳng URL đặt vé hoặc click nút "Mua vé nhanh".\n3. Quan sát luồng điều hướng.',
        expected: 'Hệ thống hiển thị modal hoặc chuyển hướng người dùng đến trang /login kèm tham số redirect, sau khi đăng nhập thành công sẽ tự đưa trở lại đúng suất chiếu đó.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Protected Route hoạt động chính xác'
      },
      {
        id: 'TC_LOG_09',
        summary: 'Xác minh duy trì trạng thái đăng nhập sau khi tải lại trang (F5)',
        pre: 'Đã đăng nhập thành công tài khoản khách hàng',
        data: 'Nhấn F5 hoặc Ctrl+R',
        steps: '1. Đăng nhập thành công vào trang chủ.\n2. Nhấn F5 để tải lại trang.\n3. Kiểm tra thông tin phiên làm việc.',
        expected: 'Hệ thống tự động khôi phục session từ storage, người dùng vẫn giữ nguyên trạng thái đã đăng nhập mà không bị văng ra ngoài.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Khôi phục Auth State từ storage mượt mà'
      },
      {
        id: 'TC_LOG_10',
        summary: 'Xác minh liên kết "Quên mật khẩu?" chuyển đến đúng trang khôi phục mật khẩu',
        pre: 'Đang ở trang Đăng nhập /login',
        data: 'Click vào liên kết văn bản "Quên mật khẩu?"',
        steps: '1. Tại form đăng nhập, tìm link "Quên mật khẩu?".\n2. Nhấp chuột vào link.\n3. Kiểm tra trang đích được tải.',
        expected: 'Hệ thống điều hướng êm ái đến trang /forgot-password, hiển thị giao diện nhập email nhận mã OTP đặt lại mật khẩu với hướng dẫn 3 bước trực quan. Tuyệt đối không báo lỗi 404.',
        r1: 'Fail', bug: 'BUG_LOG_02', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 link trỏ vào route chưa đăng ký sinh lỗi 404. Đợt 2 đã bổ sung route và page ForgotPassword hoàn chỉnh.'
      },
      {
        id: 'TC_LOG_11',
        summary: 'Xác minh giao diện đăng nhập hiển thị đúng thiết kế, chuẩn branding',
        pre: 'Độ phân giải màn hình 1920x1080',
        data: 'URL: /login',
        steps: '1. Mở trang đăng nhập.\n2. Kiểm tra logo Movix, nút chuyển đổi hiển thị/ẩn mật khẩu (con mắt), nút bấm đăng nhập.',
        expected: 'Giao diện đồng bộ với tông màu phim ảnh sang trọng, icon con mắt ẩn/hiện mật khẩu hoạt động tốt.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Giao diện đạt chuẩn UI/UX'
      },
      {
        id: 'TC_LOG_12',
        summary: 'Xác minh hiển thị và hoạt động trên trình duyệt Mozilla Firefox',
        pre: 'Trình duyệt Firefox v131+',
        data: 'Thực hiện quy trình đăng nhập đầy đủ trên Firefox',
        steps: '1. Mở Firefox, truy cập /login.\n2. Nhập thông tin và click đăng nhập.',
        expected: 'Không xảy ra lỗi render CSS hay JavaScript, đăng nhập thành công và lưu session tốt.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Độ tương thích Firefox hoàn hảo'
      },
      {
        id: 'TC_LOG_13',
        summary: 'Xác minh hiển thị trên màn hình điện thoại di động (Responsive)',
        pre: 'DevTools Responsive 375x667',
        data: 'Màn hình điện thoại iPhone SE',
        steps: '1. Bật chế độ điện thoại.\n2. Mở trang đăng nhập và thao tác nhập liệu.',
        expected: 'Form vừa vặn màn hình, padding hợp lý, không bị xô lệch nút bấm.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Hiển thị mobile chuẩn'
      }
    ]
  },
  SRCH: {
    code: 'Tìm kiếm & Lọc phim (Search & Filter)',
    name: 'Tìm kiếm phim',
    round1: { done: 13, bugs: 1, pending: 0, blocked: 0, total: 13 },
    round2: { done: 13, bugs: 0, pending: 0, blocked: 0, total: 13 },
    cases: [
      {
        id: 'TC_SRCH_01',
        summary: 'Xác minh tìm phim theo tên phim chính xác',
        pre: 'Trang danh sách phim /movies',
        data: 'Từ khóa: "Avatar: The Way of Water"',
        steps: '1. Gõ chính xác "Avatar: The Way of Water" vào thanh tìm kiếm.\n2. Nhấn Enter hoặc icon kính lúp.',
        expected: 'Hiển thị đúng 1 thẻ phim duy nhất khớp tên, hiển thị điểm đánh giá, thể loại và nút đặt vé.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tìm kiếm chính xác'
      },
      {
        id: 'TC_SRCH_02',
        summary: 'Xác minh tìm phim theo một phần tên (Partial search / không phân biệt hoa thường)',
        pre: 'Đang ở trang /movies',
        data: 'Từ khóa: "dune" hoặc "deadpool"',
        steps: '1. Nhập từ khóa viết thường "dune".\n2. Quan sát kết quả lọc tức thì.',
        expected: 'Trả về tất cả các phim có chứa chuỗi "dune" trong tiêu đề (ví dụ: "Dune: Part Two").',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tìm kiếm tương đối tốt'
      },
      {
        id: 'TC_SRCH_03',
        summary: 'Xác minh thông báo khi không tìm thấy phim phù hợp',
        pre: 'Đang ở trang /movies',
        data: 'Từ khóa: "zzzzxx_not_found_123"',
        steps: '1. Nhập chuỗi ký tự không khớp bất kỳ phim nào.\n2. Quan sát giao diện.',
        expected: 'Hiển thị hình minh họa trống kèm thông báo thân thiện: "Không tìm thấy bộ phim nào phù hợp với từ khóa của bạn. Vui lòng thử lại với từ khóa khác".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Empty state rõ ràng'
      },
      {
        id: 'TC_SRCH_04',
        summary: 'Xác minh lọc phim theo thể loại (Genre: Hành động)',
        pre: 'Đang ở trang /movies',
        data: 'Chọn dropdown thể loại: "Hành động"',
        steps: '1. Chọn thể loại "Hành động" trong bộ lọc.\n2. Kiểm tra danh sách hiển thị.',
        expected: 'Tất cả phim hiển thị đều có chứa tag thể loại "Hành động" trong thông tin chi tiết.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Lọc thể loại chính xác'
      },
      {
        id: 'TC_SRCH_05',
        summary: 'Xác minh lọc phim theo ngày chiếu cụ thể',
        pre: 'Hệ thống có các suất chiếu ngày hôm nay và các ngày tới',
        data: 'Chọn ngày chiếu cụ thể từ thanh chọn ngày',
        steps: '1. Chọn tab ngày chiếu mong muốn.\n2. Kiểm tra danh sách phim trả về.',
        expected: 'Chỉ hiển thị các bộ phim thực sự có lịch chiếu tại các cụm rạp trong ngày đã chọn.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Lọc ngày chuẩn xác'
      },
      {
        id: 'TC_SRCH_06',
        summary: 'Xác minh lọc phim theo phân loại độ tuổi C18',
        pre: 'Đang ở trang /movies',
        data: 'Bộ lọc nhãn tuổi: "C18" (Phim dành cho khán giả từ đủ 18 tuổi trở lên)',
        steps: '1. Chọn lọc theo nhãn "C18".\n2. Quan sát kết quả.',
        expected: 'Chỉ các phim gắn nhãn C18 như Deadpool & Wolverine xuất hiện, có badge C18 màu đỏ cảnh báo.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Phân loại tuổi minh bạch'
      },
      {
        id: 'TC_SRCH_07',
        summary: 'Xác minh kết hợp tên phim và thể loại',
        pre: 'Đang ở trang /movies',
        data: 'Tên: "Spider-Man", Thể loại: "Khoa học viễn tưởng"',
        steps: '1. Nhập tên "Spider-Man".\n2. Chọn thể loại "Khoa học viễn tưởng".',
        expected: 'Hiển thị chính xác phim thỏa mãn đồng thời cả 2 điều kiện (AND condition).',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Lọc kết hợp 2 tiêu chí tốt'
      },
      {
        id: 'TC_SRCH_08',
        summary: 'Xác minh kết hợp thể loại và ngày chiếu (Multi-criteria Filter)',
        pre: 'Đang ở trang /movies',
        data: 'Thể loại: "Hành động" + Ngày chiếu: Hôm nay',
        steps: '1. Chọn thể loại "Hành động".\n2. Chọn ngày chiếu hôm nay.\n3. Kiểm tra danh sách phim.',
        expected: 'Hệ thống CHỈ hiển thị các phim vừa thuộc thể loại Hành động VÀ vừa có suất chiếu trong ngày hôm nay. Không được hiển thị phim Hành động nhưng ngày đó không có suất chiếu.',
        r1: 'Fail', bug: 'BUG_SRCH_02', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 bị lỗi hiển thị cả phim không có suất chiếu hôm nay. Đợt 2 đã fix logic AND filter.'
      },
      {
        id: 'TC_SRCH_09',
        summary: 'Xác minh phân trang kết quả tìm kiếm khi số lượng phim lớn',
        pre: 'Danh sách có hơn 12 phim',
        data: 'Chuyển sang trang 2',
        steps: '1. Cuộn xuống cuối trang.\n2. Nhấp nút chuyển sang trang 2.',
        expected: 'Tải đúng danh sách phim của trang 2, cuộn mượt mà lên đầu trang, active đúng số trang.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Phân trang mượt'
      },
      {
        id: 'TC_SRCH_10',
        summary: 'Xác minh chọn kết quả chuyển đến trang chi tiết phim',
        pre: 'Hiển thị danh sách kết quả tìm kiếm',
        data: 'Click vào thẻ phim Avatar 2',
        steps: '1. Nhấp chuột vào thẻ phim hoặc nút "Chi tiết".\n2. Quan sát URL và nội dung.',
        expected: 'Điều hướng trơn tru đến URL /movie/:id tương ứng, hiển thị đầy đủ thông tin chi tiết phim.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đường dẫn chính xác'
      },
      {
        id: 'TC_SRCH_11',
        summary: 'Xác minh giao diện bộ lọc hiển thị đúng thiết kế, không vỡ layout',
        pre: 'Desktop màn hình 1440x900',
        data: 'Giao diện /movies',
        steps: '1. Mở trang /movies.\n2. Kiểm tra thanh tìm kiếm, các chip tag thể loại, dropdown rạp.',
        expected: 'Các thành phần xếp ngay ngắn, hiệu ứng hover nhẹ nhàng, màu sắc chuẩn phong cách Movix.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'UI đẹp mắt'
      },
      {
        id: 'TC_SRCH_12',
        summary: 'Xác minh hiển thị và hoạt động trên Microsoft Edge',
        pre: 'Trình duyệt Microsoft Edge mới nhất',
        data: 'Thực hiện tìm kiếm và lọc phim trên Edge',
        steps: '1. Mở Edge, truy cập trang phim.\n2. Thử lọc theo thể loại và từ khóa.',
        expected: 'Hoạt động đồng bộ, kết quả lọc tức thì, không có lỗi script.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tương thích Edge tốt'
      },
      {
        id: 'TC_SRCH_13',
        summary: 'Xác minh hiển thị trên màn hình điện thoại (Responsive)',
        pre: 'Kích thước mobile 375x667',
        data: 'Mobile Viewport',
        steps: '1. Mở trang phim trên mobile.\n2. Kiểm tra bộ lọc có nút thu gọn/mở rộng hoặc thanh trượt ngang.',
        expected: 'Bộ lọc hiển thị thân thiện, các thẻ phim xếp 1 hoặc 2 cột ngăn nắp, dễ chạm chọn.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Mobile tối ưu tốt'
      }
    ]
  },
  LST: {
    code: 'Xem phim theo trạng thái (Movie Status)',
    name: 'Xem phim theo trạng thái',
    round1: { done: 10, bugs: 0, pending: 0, blocked: 0, total: 10 },
    round2: { done: 10, bugs: 0, pending: 0, blocked: 0, total: 10 },
    cases: [
      {
        id: 'TC_LST_01',
        summary: 'Xác minh danh sách phim "Đang chiếu" hiển thị đúng',
        pre: 'Trang chủ hoặc trang phim',
        data: 'Tab "Phim đang chiếu" (status: now_showing)',
        steps: '1. Nhấp tab "Phim đang chiếu".\n2. Kiểm tra trạng thái của các phim hiển thị.',
        expected: 'Chỉ hiển thị các phim có trạng thái Đang chiếu, có suất chiếu trong thời điểm hiện tại.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Dữ liệu lọc chính xác'
      },
      {
        id: 'TC_LST_02',
        summary: 'Xác minh danh sách phim "Sắp chiếu" hiển thị đúng',
        pre: 'Đang ở trang chủ',
        data: 'Tab "Phim sắp chiếu" (status: coming_soon)',
        steps: '1. Nhấp tab "Phim sắp chiếu".\n2. Kiểm tra ngày khởi chiếu của phim.',
        expected: 'Hiển thị các phim sắp chiếu, hiển thị rõ ngày khởi chiếu dự kiến và nút "Xem thông tin / Trailer", không hiện nút đặt suất hôm nay.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Trạng thái sắp chiếu rõ ràng'
      },
      {
        id: 'TC_LST_03',
        summary: 'Xác minh thông tin trên thẻ phim (Movie Card)',
        pre: 'Danh sách thẻ phim',
        data: 'Một thẻ phim bất kỳ (vd: Dune 2)',
        steps: '1. Quan sát các chi tiết trên thẻ phim: Poster, Tiêu đề, Thời lượng, Nhãn tuổi, Thể loại, Điểm rating.',
        expected: 'Hiển thị đầy đủ poster không bị méo, nhãn tuổi rõ ràng, thời lượng tính theo phút, điểm sao đánh giá.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đầy đủ metadata'
      },
      {
        id: 'TC_LST_04',
        summary: 'Xác minh chọn thẻ phim chuyển đến trang chi tiết',
        pre: 'Đang ở danh sách phim',
        data: 'Click vào poster hoặc tên phim',
        steps: '1. Click chuột vào thẻ phim.\n2. Quan sát chuyển trang.',
        expected: 'Chuyển mượt mà đến trang /movie/:id tương ứng với đầy đủ lịch chiếu và trailer.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Navigation hoạt động tốt'
      },
      {
        id: 'TC_LST_05',
        summary: 'Xác minh nút "Đặt vé" trên thẻ phim',
        pre: 'Thẻ phim Đang chiếu',
        data: 'Click nút "Đặt vé nhanh"',
        steps: '1. Nhấp nút "Đặt vé" màu cam tím nổi bật trên thẻ phim.\n2. Kiểm tra phản hồi.',
        expected: 'Tự động mở danh sách suất chiếu nhanh hoặc đưa người dùng tới phần chọn suất chiếu của phim đó.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Call-to-action phản hồi tốt'
      },
      {
        id: 'TC_LST_06',
        summary: 'Xác minh chuyển qua lại giữa 2 tab Đang chiếu và Sắp chiếu',
        pre: 'Đang ở trang chủ',
        data: 'Click tab Đang chiếu <-> Sắp chiếu',
        steps: '1. Nhấp tab Sắp chiếu, xem danh sách.\n2. Nhấp lại tab Đang chiếu, xem danh sách.',
        expected: 'Nội dung thay đổi tức thì với animation mượt mà, không bị chớp giật hay lỗi reload lại trang.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Motion animation mượt mà'
      },
      {
        id: 'TC_LST_07',
        summary: 'Xác minh menu điều hướng hoạt động chuẩn xác',
        pre: 'Thanh Navbar trên cùng',
        data: 'Click lần lượt: Trang chủ, Lịch chiếu, Phim, Rạp, Khuyến mãi',
        steps: '1. Nhấp từng link trên Header.\n2. Kiểm tra URL và trạng thái active.',
        expected: 'Chuyển hướng đúng route, mục đang chọn được gạch chân hoặc sáng màu cam tím nhận diện.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Header navigation hoàn chỉnh'
      },
      {
        id: 'TC_LST_08',
        summary: 'Xác minh giao diện hiển thị đúng thiết kế, không vỡ bố cục',
        pre: 'Desktop Full HD',
        data: 'Trang chủ /',
        steps: '1. Quan sát toàn bộ layout trang chủ từ Banner Hero, Phim nổi bật đến Footer.',
        expected: 'Bố cục cân đối, font chữ sắc nét, hiệu ứng glassmorphism và gradient đậm chất điện ảnh.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Thiết kế đẹp mắt'
      },
      {
        id: 'TC_LST_09',
        summary: 'Xác minh hiển thị và hoạt động trên Google Chrome',
        pre: 'Google Chrome',
        data: 'Các thao tác chuyển tab trên Chrome',
        steps: '1. Kiểm tra trên Chrome mọi thao tác xem phim.',
        expected: 'Hoạt động hoàn hảo không phát sinh cảnh báo lỗi console.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tương thích Chrome'
      },
      {
        id: 'TC_LST_10',
        summary: 'Xác minh hiển thị trên màn hình điện thoại (Responsive)',
        pre: 'Mobile 375x667',
        data: 'DevTools Responsive',
        steps: '1. Kiểm tra carousel phim và danh sách trên mobile.',
        expected: 'Banner và poster tự động co dãn theo chiều rộng màn hình, cảm ứng vuốt chạm mượt mà.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Mobile thân thiện'
      }
    ]
  },
  DTL: {
    code: 'Chi tiết phim & Lịch chiếu (Movie Detail)',
    name: 'Chi tiết phim & lịch chiếu',
    round1: { done: 11, bugs: 1, pending: 0, blocked: 0, total: 11 },
    round2: { done: 11, bugs: 0, pending: 0, blocked: 0, total: 11 },
    cases: [
      {
        id: 'TC_DTL_01',
        summary: 'Xác minh tên phim và toàn bộ thông số chi tiết hiển thị đúng',
        pre: 'Trang chi tiết phim /movie/:id',
        data: 'Phim Avatar 2',
        steps: '1. Mở trang chi tiết phim.\n2. Kiểm tra tên phim, đạo diễn, diễn viên, ngày phát hành, tóm tắt nội dung.',
        expected: 'Hiển thị chính xác và đầy đủ các thông tin chi tiết của phim.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Hiển thị đúng dữ liệu DB'
      },
      {
        id: 'TC_DTL_02',
        summary: 'Xác minh phát video Trailer Youtube nhúng',
        pre: 'Phim có link trailer Youtube hợp lệ',
        data: 'Nút "Xem Trailer"',
        steps: '1. Nhấp nút "Xem Trailer".\n2. Kiểm tra modal phát video xuất hiện.',
        expected: 'Modal hiển thị video Youtube nhúng, có âm thanh và hình ảnh, nút đóng modal hoạt động tốt.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Trailer player hoạt động mượt mà'
      },
      {
        id: 'TC_DTL_03',
        summary: 'Xác minh lịch chiếu mặc định hiển thị theo ngày hiện tại',
        pre: 'Truy cập trang chi tiết phim',
        data: 'Ngày hôm nay (current date)',
        steps: '1. Quan sát thanh chọn ngày chiếu.\n2. Kiểm tra tab ngày nào đang được active mặc định.',
        expected: 'Tab ngày hôm nay được active đầu tiên, danh sách suất chiếu của ngày hôm nay được tải ra.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Mặc định đúng ngày hôm nay'
      },
      {
        id: 'TC_DTL_04',
        summary: 'Xác minh đổi ngày xem lịch chiếu trong tương lai',
        pre: 'Đang ở trang chi tiết phim',
        data: 'Chọn ngày mai hoặc ngày mốt',
        steps: '1. Nhấp chọn tab ngày kế tiếp.\n2. Quan sát danh sách suất chiếu.',
        expected: 'Danh sách suất chiếu cập nhật tương ứng theo ngày đã chọn tại từng cụm rạp.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Cập nhật lịch chiếu theo ngày tốt'
      },
      {
        id: 'TC_DTL_05',
        summary: 'Xác minh suất chiếu đã qua giờ bắt đầu bị vô hiệu hóa (Disabled past showtime)',
        pre: 'Ngày chiếu là hôm nay, hiện tại là 15:00',
        data: 'Suất chiếu lúc 10:15 sáng (đã trôi qua 4 tiếng 45 phút)',
        steps: '1. Xem danh sách suất chiếu của ngày hôm nay.\n2. Tìm suất chiếu có giờ bắt đầu sớm hơn giờ hiện tại.\n3. Thử nhấp chuột vào nút suất chiếu đó.',
        expected: 'Nút suất chiếu đã qua giờ bị làm mờ (opacity-50, cursor-not-allowed), có gạch chéo hoặc text phụ "(Đã chiếu)". Người dùng KHÔNG THỂ nhấp để đặt vé.',
        r1: 'Fail', bug: 'BUG_DTL_01', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 vẫn cho phép click vào suất quá khứ. Đợt 2 đã bổ sung isPastShowtime() chặn triệt để.'
      },
      {
        id: 'TC_DTL_06',
        summary: 'Xác minh suất chiếu hết ghế hiển thị nhãn "Hết vé"',
        pre: 'Suất chiếu có tất cả ghế đã được đặt đầy',
        data: 'Suất chiếu full vé',
        steps: '1. Tìm suất chiếu đã bán hết vé.\n2. Kiểm tra trạng thái nút bấm.',
        expected: 'Nút suất chiếu hiển thị badge "Hết vé", màu xám mờ và không cho phép click vào trang chọn ghế.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Chặn suất hết chỗ chính xác'
      },
      {
        id: 'TC_DTL_07',
        summary: 'Xác minh chọn suất chiếu khi chưa đăng nhập',
        pre: 'Chưa đăng nhập tài khoản',
        data: 'Click vào một suất chiếu hợp lệ',
        steps: '1. Chọn một suất chiếu còn vé.\n2. Quan sát phản ứng hệ thống.',
        expected: 'Hệ thống yêu cầu đăng nhập trước khi vào sơ đồ ghế, lưu lại đường dẫn suất chiếu để quay lại sau khi login.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Auth check trước khi chọn ghế'
      },
      {
        id: 'TC_DTL_08',
        summary: 'Xác minh chọn suất chiếu khi đã đăng nhập',
        pre: 'Đã đăng nhập tài khoản khách hàng',
        data: 'Click vào suất chiếu hợp lệ',
        steps: '1. Nhấp chọn suất chiếu 19:30.\n2. Kiểm tra điều hướng.',
        expected: 'Chuyển ngay đến màn hình Đặt vé & Chọn ghế (/booking/:showtimeId) với thông tin phim và phòng chiếu chính xác.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Vào thẳng màn hình đặt vé'
      },
      {
        id: 'TC_DTL_09',
        summary: 'Xác minh giao diện chi tiết phim hiển thị đúng thiết kế',
        pre: 'Desktop 1920x1080',
        data: 'Trang chi tiết phim',
        steps: '1. Kiểm tra backdrop mờ phía sau, thông tin phim và cụm rạp bên dưới.',
        expected: 'Bố cục chuẩn rạp chiếu phim hiện đại, màu sắc hài hòa.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'UI cao cấp'
      },
      {
        id: 'TC_DTL_10',
        summary: 'Xác minh hiển thị và hoạt động trên Mozilla Firefox',
        pre: 'Firefox v131',
        data: 'Thao tác chi tiết phim trên Firefox',
        steps: '1. Kiểm tra chức năng trên Firefox.',
        expected: 'Mọi tính năng hoạt động mượt mà, video chạy tốt.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tương thích tốt'
      },
      {
        id: 'TC_DTL_11',
        summary: 'Xác minh hiển thị trên màn hình điện thoại (Responsive)',
        pre: 'Mobile 375x667',
        data: 'DevTools Responsive',
        steps: '1. Kiểm tra hiển thị chi tiết phim trên mobile.',
        expected: 'Thanh chọn ngày có thể cuộn ngang nhẹ nhàng, danh sách giờ chiếu chia lưới 3-4 nút mỗi hàng rõ ràng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Responsive hoàn hảo'
      }
    ]
  },
  BK: {
    code: 'Đặt vé & Chọn ghế (Booking & Seats)',
    name: 'Đặt vé & chọn ghế',
    round1: { done: 20, bugs: 3, pending: 0, blocked: 1, total: 20 },
    round2: { done: 20, bugs: 0, pending: 0, blocked: 0, total: 20 },
    cases: [
      {
        id: 'TC_BK_01',
        summary: 'Xác minh sơ đồ ghế hiển thị đúng với phòng chiếu và cấu hình phòng',
        pre: 'Đã vào trang đặt vé của suất chiếu phòng 1 (Standard 2D)',
        data: 'Suất chiếu phòng 1, cấu hình 9 hàng ghế (A -> I), 12 ghế/hàng',
        steps: '1. Quan sát ma trận ghế hiển thị trên màn hình.\n2. So sánh số hàng, số cột, loại ghế thường, VIP và Sweetbox với cấu hình phòng trong DB.',
        expected: 'Sơ đồ ghế khớp 100% với cấu hình phòng chiếu, hàng ghế A-D ghế thường (xanh), E-H ghế VIP (cam), hàng I ghế đôi Sweetbox (hồng), màn hình Screen ở trên cùng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Hiển thị sơ đồ ghế chính xác'
      },
      {
        id: 'TC_BK_02',
        summary: 'Xác minh chọn ghế trống thành công và cập nhật tổng tiền',
        pre: 'Đang ở sơ đồ ghế',
        data: 'Click chọn ghế C5 (ghế thường, đơn giá 90.000đ)',
        steps: '1. Nhấp chọn ghế C5 đang ở trạng thái trống.\n2. Quan sát màu sắc ghế và thanh tóm tắt đơn bên phải.',
        expected: 'Ghế C5 đổi màu sang trạng thái Đã chọn (tím/xanh neon), thanh tóm tắt hiển thị "Ghế: C5", tổng tiền cập nhật đúng 90.000đ.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Chọn ghế đơn lẻ chuẩn'
      },
      {
        id: 'TC_BK_03',
        summary: 'Xác minh không thể chọn ghế đã có người khác đặt trước (Booked seat)',
        pre: 'Ghế F5, F6 đã được đặt trước (trạng thái Booked, màu xám có icon người)',
        data: 'Click chuột vào ghế F5',
        steps: '1. Thử click chuột nhiều lần vào ghế F5 đã đặt.\n2. Quan sát phản hồi.',
        expected: 'Con trỏ chuột hiển thị not-allowed, ghế không thể đổi trạng thái, tổng tiền không thay đổi, không phát sinh lỗi.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Khóa ghế đã đặt nghiêm ngặt'
      },
      {
        id: 'TC_BK_04',
        summary: 'Xác minh kiểm soát số lượng ghế đặt tối đa (Tối đa 10 ghế/lần đặt)',
        pre: 'Người dùng đã chọn 10 ghế',
        data: 'Cố gắng nhấp chọn tiếp ghế thứ 11',
        steps: '1. Chọn lần lượt 10 ghế trống bất kỳ.\n2. Nhấp vào ghế trống thứ 11.\n3. Quan sát thông báo.',
        expected: 'Hệ thống chặn không cho chọn ghế thứ 11, hiển thị toast cảnh báo: "Bạn chỉ được đặt tối đa 10 ghế trong một lần giao dịch để đảm bảo quyền lợi cho khách hàng khác".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'BVA: 10 ghế thành công, 11 ghế bị chặn'
      },
      {
        id: 'TC_BK_05',
        summary: 'Xác minh chọn ghế đôi Sweetbox tự động chọn cả cặp và tính đúng một lần giá ghế đôi',
        pre: 'Hàng ghế Sweetbox (I1-I2, I3-I4, I5-I6, giá 200.000đ/cặp)',
        data: 'Click vào ghế I1 hoặc I2',
        steps: '1. Nhấp chuột vào một trong hai nửa của ghế đôi Sweetbox (I1).\n2. Quan sát trạng thái được chọn trên sơ đồ.\n3. Kiểm tra số tiền cộng vào tổng hóa đơn.',
        expected: 'Hệ thống tự động kích hoạt cả cặp liền kề (I1 và I2), hiển thị nhãn Sweetbox I1-I2. Tổng tiền chỉ tính đúng MỘT lần giá ghế đôi là 200.000đ (KHÔNG ĐƯỢC nhân đôi thành 400.000đ).',
        r1: 'Fail', bug: 'BUG_BK_02', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 tính 2 x 200k = 400k. Đợt 2 đã fix logic isPairSeat chỉ tính 1 lần giá 200k cho cả cặp.'
      },
      {
        id: 'TC_BK_06',
        summary: 'Xác minh tổng tiền khi chọn 2 ghế thường',
        pre: 'Ghế thường đơn giá 90.000đ',
        data: 'Chọn 2 ghế A3, A4',
        steps: '1. Chọn ghế A3.\n2. Chọn ghế A4.\n3. Kiểm tra tổng tiền.',
        expected: 'Tổng tiền hiển thị đúng bằng 2 x 90.000đ = 180.000đ.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tính đúng ghế thường'
      },
      {
        id: 'TC_BK_07',
        summary: 'Xác minh tổng tiền khi chọn 2 ghế VIP',
        pre: 'Ghế VIP đơn giá 120.000đ',
        data: 'Chọn 2 ghế F6, F7',
        steps: '1. Chọn ghế VIP F6.\n2. Chọn ghế VIP F7.\n3. Kiểm tra tổng tiền.',
        expected: 'Tổng tiền hiển thị đúng bằng 2 x 120.000đ = 240.000đ.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tính đúng ghế VIP'
      },
      {
        id: 'TC_BK_08',
        summary: 'Xác minh tính tổng tiền khi kết hợp nhiều loại ghế (Thường + VIP + Sweetbox)',
        pre: 'Giá: Thường 90k, VIP 120k, Sweetbox cặp 200k',
        data: 'Chọn: 1 ghế Thường B2 + 1 ghế VIP F5 + 1 cặp Sweetbox I3-I4',
        steps: '1. Chọn B2 (90k).\n2. Chọn F5 (120k).\n3. Chọn cặp Sweetbox I3-I4 (200k).\n4. Kiểm tra dòng chi tiết và tổng cộng.',
        expected: 'Bảng chi tiết liệt kê rõ ràng từng loại ghế, Tổng tiền = 90.000 + 120.000 + 200.000 = 410.000đ hoàn toàn chính xác.',
        r1: 'Fail', bug: 'BUG_BK_02', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 bị tính lệch 610.000đ do Sweetbox bị lặp. Đợt 2 đã fix chuẩn 410.000đ.'
      },
      {
        id: 'TC_BK_09',
        summary: 'Xác minh tổng tiền cập nhật tự động khi bỏ chọn bớt ghế',
        pre: 'Đang chọn 3 ghế (tổng 330k)',
        data: 'Click lại vào ghế VIP F5 để bỏ chọn',
        steps: '1. Nhấp lại vào ghế F5 đang chọn để hủy chọn.\n2. Quan sát sơ đồ ghế và tổng tiền.',
        expected: 'Ghế F5 quay về trạng thái trống, tổng tiền tự động trừ đi 120.000đ và hiển thị chính xác.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Cập nhật realtime khi unselect'
      },
      {
        id: 'TC_BK_10',
        summary: 'Xác minh áp dụng mã khuyến mãi hợp lệ (Voucher Discount)',
        pre: 'Đơn hàng tổng 240.000đ, có mã giảm "MOVIX20" (giảm 20% tối đa 50k)',
        data: 'Mã voucher: "MOVIX20"',
        steps: '1. Nhập mã "MOVIX20" vào ô khuyến mãi.\n2. Nhấn "Áp dụng".\n3. Kiểm tra số tiền giảm trừ.',
        expected: 'Toast báo "Áp dụng mã giảm giá thành công! Giảm 48.000đ", tổng tiền cần thanh toán cập nhật thành 192.000đ.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Xử lý voucher chuẩn xác'
      },
      {
        id: 'TC_BK_11',
        summary: 'Xác minh không thể tiếp tục đặt vé khi chưa chọn bất kỳ ghế nào',
        pre: 'Chưa click chọn ghế nào (danh sách ghế trống)',
        data: 'Nhấp nút "Tiếp tục thanh toán"',
        steps: '1. Không chọn ghế nào.\n2. Nhấp nút "Tiếp tục thanh toán" hoặc "Xác nhận".',
        expected: 'Nút bị disabled hoặc hiển thị thông báo nhắc nhở: "Vui lòng chọn ít nhất 1 ghế trước khi tiếp tục thanh toán". Không chuyển bước.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Validation chọn ghế chặt chẽ'
      },
      {
        id: 'TC_BK_12',
        summary: 'Xác minh luồng đặt vé thành công và tạo mã vé (Ticket Code)',
        pre: 'Đã chọn ghế hợp lệ và tiến hành thanh toán',
        data: 'Thanh toán qua cổng mô phỏng (PayOS / VietQR / Thẻ ATM)',
        steps: '1. Chọn ghế D4, D5.\n2. Chọn phương thức thanh toán VietQR.\n3. Nhấn "Xác nhận thanh toán".\n4. Hệ thống hoàn tất đơn.',
        expected: 'Chuyển sang trang Booking Success (/booking-success), hiển thị mã vé dạng "MVX-XXXXX", mã QR soát vé, thông tin chi tiết phim, phòng, ghế và tổng tiền.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tạo đơn và mã vé hoàn chỉnh'
      },
      {
        id: 'TC_BK_13',
        summary: 'Xác minh ghế chuyển sang trạng thái "Đã đặt" ngay sau khi hoàn tất vé',
        pre: 'Vừa đặt thành công ghế D4, D5',
        data: 'Quay lại sơ đồ ghế của suất chiếu vừa đặt',
        steps: '1. Mở lại trang đặt vé của chính suất chiếu đó trên tab khác.\n2. Quan sát trạng thái của ghế D4, D5.',
        expected: 'Ghế D4, D5 hiển thị màu xám, trạng thái "Đã đặt", không ai có thể nhấp chọn được nữa.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đồng bộ trạng thái ghế vào CSDL'
      },
      {
        id: 'TC_BK_14',
        summary: 'Xác minh hai tài khoản không thể đặt trùng cùng một ghế (Concurrency / Race Condition)',
        pre: 'Hai tài khoản A và B cùng mở suất chiếu lúc 19:30',
        data: 'Tài khoản A chọn ghế G5 và thanh toán trước, Tài khoản B cũng chọn ghế G5 và bấm thanh toán sau 2 giây',
        steps: '1. Trình duyệt A: User A chọn ghế G5 và bấm "Thanh toán".\n2. Trình duyệt B: User B cũng đang chọn ghế G5 và bấm "Thanh toán" ngay sau đó.\n3. Quan sát kết quả xử lý của hệ thống.',
        expected: 'User A thanh toán thành công nhận vé. Hệ thống phát hiện xung đột đồng thời của User B, lập tức hủy thao tác của B, hiển thị cảnh báo: "Rất tiếc! Ghế G5 vừa được khách hàng khác thanh toán thành công. Vui lòng chọn ghế khác". Ghế G5 trên màn hình của B tự động chuyển xám.',
        r1: 'Fail', bug: 'BUG_BK_03', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 không kiểm tra conflict trước khi commit làm 2 người trùng vé. Đợt 2 bổ sung atomic verification check.'
      },
      {
        id: 'TC_BK_15',
        summary: 'Xác minh đếm ngược thời gian giữ ghế (Holding Countdown Timer 5:00)',
        pre: 'Người dùng chọn ghế và chuyển sang bước thanh toán',
        data: 'Đồng hồ đếm ngược 5 phút (05:00)',
        steps: '1. Vào màn hình thanh toán giữ chỗ.\n2. Quan sát đồng hồ đếm ngược chạy từ 05:00 về 00:00.\n3. Khi hết giờ, kiểm tra phản ứng hệ thống.',
        expected: 'Đồng hồ đếm ngược chuẩn từng giây. Khi về 00:00, xuất hiện modal: "Đã hết thời gian giữ ghế. Ghế của bạn đã được giải phóng để nhường cho khách hàng khác", tự động đưa người dùng về lại sơ đồ ghế và nhả ghế ra.',
        r1: 'Blocked', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 server test chưa cấu hình holding timer nên bị Blocked. Đợt 2 bổ sung countdown timer và auto release.'
      },
      {
        id: 'TC_BK_16',
        summary: 'Xác minh thanh toán mô phỏng thành công (Mock Success)',
        pre: 'Đang ở bước quét mã QR thanh toán',
        data: 'Chọn nút "Giả lập thanh toán thành công"',
        steps: '1. Chọn phương thức PayOS / VietQR.\n2. Bấm nút "Giả lập thanh toán thành công" (dành cho môi trường test/demo).\n3. Quan sát xử lý.',
        expected: 'Đơn hàng cập nhật trạng thái "paid", chuyển sang màn hình vé thành công.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Giả lập thanh toán chuẩn'
      },
      {
        id: 'TC_BK_17',
        summary: 'Xác minh thanh toán mô phỏng thất bại / hủy bỏ thanh toán',
        pre: 'Đang ở bước thanh toán',
        data: 'Bấm nút "Hủy thanh toán / Thử lại"',
        steps: '1. Nhấp nút "Hủy giao dịch".\n2. Quan sát thông báo và trạng thái ghế.',
        expected: 'Hiển thị thông báo "Giao dịch đã được hủy", ghế giữ được nhả ra trạng thái trống, cho phép người dùng chọn lại.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Hủy thanh toán nhả ghế tốt'
      },
      {
        id: 'TC_BK_18',
        summary: 'Xác minh giao diện sơ đồ ghế hiển thị đúng thiết kế, chú thích rõ ràng',
        pre: 'Màn hình máy tính',
        data: 'Sơ đồ rạp',
        steps: '1. Kiểm tra phần chú thích ghế: Ghế thường (xanh), Ghế VIP (cam), Ghế đôi (hồng), Ghế đang chọn (tím sáng), Ghế đã bán (xám).',
        expected: 'Chú thích rõ ràng, tỷ lệ các hàng ghế đều tăm tắp, lối đi giữa các khối ghế thông thoáng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Giao diện trực quan xuất sắc'
      },
      {
        id: 'TC_BK_19',
        summary: 'Xác minh hiển thị và hoạt động trên Microsoft Edge',
        pre: 'Microsoft Edge',
        data: 'Thao tác chọn ghế trên Edge',
        steps: '1. Mở sơ đồ ghế trên Edge, click chọn và thanh toán.',
        expected: 'Mượt mà, không giật lag, tính tiền chính xác.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tương thích Edge'
      },
      {
        id: 'TC_BK_20',
        summary: 'Xác minh hiển thị sơ đồ ghế trên màn hình điện thoại (Responsive Mobile)',
        pre: 'Màn hình điện thoại iPhone / Android (375x667)',
        data: 'Giao diện đặt vé trên mobile',
        steps: '1. Mở trang sơ đồ ghế trên điện thoại 375px width.\n2. Quan sát lưới 12-14 cột ghế và thanh thanh toán.',
        expected: 'Lưới ghế tự động co giãn linh hoạt hoặc cho phép vuốt nhẹ theo khung nhìn tối ưu (overflow-x-auto mượt mà có chỉ dẫn "Vuốt ngang để xem toàn bộ ghế"), KHÔNG LÀM TRÀN TOÀN BỘ TRANG WEB, thanh tổng tiền ghim cố định ở đáy màn hình (bottom sticky bar) dễ bấm.',
        r1: 'Fail', bug: 'BUG_BK_04', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 sơ đồ ghế vỡ layout tràn ngang màn hình điện thoại. Đợt 2 bổ sung wrapper container và sticky summary bar.'
      }
    ]
  },
  PRF: {
    code: 'Thông tin cá nhân & Lịch sử (Profile & History)',
    name: 'Thông tin cá nhân & lịch sử',
    round1: { done: 14, bugs: 0, pending: 0, blocked: 1, total: 14 },
    round2: { done: 14, bugs: 0, pending: 0, blocked: 0, total: 14 },
    cases: [
      {
        id: 'TC_PRF_01',
        summary: 'Xác minh email hiển thị và bị khóa không cho sửa (Read-only Email)',
        pre: 'Đã đăng nhập vào trang /profile',
        data: 'Email: user@movix.vn',
        steps: '1. Mở trang Hồ sơ cá nhân.\n2. Nhấp chuột vào trường Email và cố gắng chỉnh sửa.',
        expected: 'Trường Email ở trạng thái disabled / read-only, con trỏ chuột dạng not-allowed, có ghi chú "Email tài khoản không thể thay đổi".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Khóa sửa email đúng quy định bảo mật'
      },
      {
        id: 'TC_PRF_02',
        summary: 'Xác minh sửa đổi họ tên thành công',
        pre: 'Hồ sơ người dùng',
        data: 'Họ tên mới: "Nguyễn Văn Hùng"',
        steps: '1. Nhập họ tên mới.\n2. Nhấn "Lưu thay đổi".\n3. Tải lại trang kiểm tra.',
        expected: 'Toast báo "Cập nhật thông tin thành công!", tên mới hiển thị trên Header và hồ sơ.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Cập nhật tên tốt'
      },
      {
        id: 'TC_PRF_03',
        summary: 'Xác minh thông báo lỗi khi để trống họ tên',
        pre: 'Đang ở trang /profile',
        data: 'Họ tên: "" (xóa rỗng)',
        steps: '1. Xóa hết ký tự trong ô Họ tên.\n2. Nhấn "Lưu thay đổi".',
        expected: 'Báo lỗi đỏ: "Họ và tên không được để trống". Không lưu vào DB.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Validation client chặt chẽ'
      },
      {
        id: 'TC_PRF_04',
        summary: 'Xác minh thông báo lỗi khi số điện thoại sai định dạng',
        pre: 'Đang sửa thông tin',
        data: 'SĐT mới: "09ab12"',
        steps: '1. Nhập SĐT chứa chữ hoặc không đủ 10 số.\n2. Nhấn "Lưu thay đổi".',
        expected: 'Hiển thị thông báo "Số điện thoại không hợp lệ". Chặn cập nhật.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Regex phone kiểm tra đúng'
      },
      {
        id: 'TC_PRF_05',
        summary: 'Xác minh tải ảnh đại diện hợp lệ (.jpg, .png < 5MB)',
        pre: 'Đang ở trang hồ sơ',
        data: 'File ảnh avatar.jpg kích thước 1.2MB',
        steps: '1. Bấm nút chọn ảnh đại diện mới.\n2. Chọn file avatar.jpg hợp lệ.\n3. Bấm "Cập nhật".',
        expected: 'Ảnh avatar được tải lên và hiển thị xem trước tức thì, lưu thành công vào hồ sơ người dùng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tải ảnh đại diện thành công'
      },
      {
        id: 'TC_PRF_06',
        summary: 'Xác minh đổi mật khẩu thành công khi nhập đúng mật khẩu cũ',
        pre: 'Đang đăng nhập với mật khẩu "123456"',
        data: 'Mật khẩu cũ: "123456", Mật khẩu mới: "NewPass@2026", Xác nhận: "NewPass@2026"',
        steps: '1. Chuyển sang tab "Đổi mật khẩu".\n2. Nhập mật khẩu hiện tại và mật khẩu mới hợp lệ.\n3. Nhấn "Đổi mật khẩu".',
        expected: 'Toast báo: "Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới của bạn".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đổi mật khẩu thành công'
      },
      {
        id: 'TC_PRF_07',
        summary: 'Xác minh đăng nhập lại bằng mật khẩu mới vừa đổi',
        pre: 'Vừa đổi mật khẩu sang "NewPass@2026"',
        data: 'Email: user@movix.vn, Mật khẩu: "NewPass@2026"',
        steps: '1. Đăng xuất khỏi hệ thống.\n2. Đăng nhập lại với mật khẩu mới "NewPass@2026".',
        expected: 'Đăng nhập thành công vào hệ thống với mật khẩu mới.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Mật khẩu mới đã được băm/lưu vào DB'
      },
      {
        id: 'TC_PRF_08',
        summary: 'Xác minh thông báo lỗi khi nhập sai mật khẩu cũ',
        pre: 'Mật khẩu thực tế là "123456"',
        data: 'Nhập mật khẩu cũ: "SaiMK999"',
        steps: '1. Nhập mật khẩu hiện tại không đúng.\n2. Nhấn "Đổi mật khẩu".',
        expected: 'Báo lỗi: "Mật khẩu hiện tại không chính xác. Vui lòng thử lại". Chặn đổi mật khẩu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Xác minh mật khẩu cũ chính xác'
      },
      {
        id: 'TC_PRF_09',
        summary: 'Xác minh danh sách lịch sử đặt vé hiển thị đầy đủ thông tin vé',
        pre: 'Tài khoản đã có 2 đơn đặt vé thành công',
        data: 'Tab "Lịch sử đặt vé" trong hồ sơ',
        steps: '1. Nhấp tab "Lịch sử đặt vé".\n2. Kiểm tra danh sách hiển thị.',
        expected: 'Hiển thị đầy đủ danh sách các vé đã mua: Mã vé, Tên phim, Rạp, Phòng chiếu, Suất chiếu, Danh sách ghế, Tổng tiền, Ngày giao dịch và Trạng thái "Đã thanh toán".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Lịch sử hiển thị chi tiết'
      },
      {
        id: 'TC_PRF_10',
        summary: 'Xác minh hủy vé trước giờ chiếu ít nhất 60 phút',
        pre: 'Đơn vé có suất chiếu còn cách thời điểm hiện tại hơn 2 tiếng',
        data: 'Click nút "Hủy vé"',
        steps: '1. Tìm đơn vé hợp lệ được phép hủy.\n2. Bấm nút "Yêu cầu hủy vé".\n3. Xác nhận trên popup.',
        expected: 'Hệ thống cập nhật trạng thái đơn thành "Đã hủy", hoàn trả các ghế trong đơn về trạng thái trống trên sơ đồ.',
        r1: 'Blocked', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Đợt 1 chức năng hủy vé người dùng chưa mở trên môi trường test. Đợt 2 đã tích hợp hoàn trả ghế.'
      },
      {
        id: 'TC_PRF_11',
        summary: 'Xác minh không thể hủy vé đối với suất chiếu đã diễn ra hoặc sát giờ (< 60 phút)',
        pre: 'Đơn vé có suất chiếu đã diễn ra hôm qua',
        data: 'Đơn vé trong quá khứ',
        steps: '1. Xem đơn vé đã qua giờ chiếu.\n2. Kiểm tra các nút hành động.',
        expected: 'Không có nút Hủy vé, hiển thị nhãn trạng thái "Đã sử dụng" hoặc "Hết hạn", không cho phép can thiệp.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Bảo vệ quy tắc hủy vé rạp chiếu'
      },
      {
        id: 'TC_PRF_12',
        summary: 'Xác minh giao diện trang hồ sơ hiển thị đúng thiết kế',
        pre: 'Desktop 1920x1080',
        data: 'Trang /profile',
        steps: '1. Kiểm tra 2 cột: Cột thông tin cá nhân và Cột danh sách vé.',
        expected: 'Giao diện đồng bộ, thẻ vé dạng card vé xem phim có đường cắt vé xé độc đáo.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Thiết kế card vé đẹp'
      },
      {
        id: 'TC_PRF_13',
        summary: 'Xác minh hoạt động trên Google Chrome',
        pre: 'Google Chrome',
        data: 'Thao tác đổi thông tin trên Chrome',
        steps: '1. Chạy trên Chrome.',
        expected: 'Mọi thao tác lưu và tải lại đều hoạt động bình thường.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Tương thích Chrome'
      },
      {
        id: 'TC_PRF_14',
        summary: 'Xác minh hiển thị trên điện thoại di động (Responsive)',
        pre: 'Mobile 375x667',
        data: 'DevTools Responsive',
        steps: '1. Mở trang profile trên mobile.',
        expected: 'Chuyển thành 1 cột dọc, thẻ vé thu gọn thông minh, không tràn lề.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '18/10/2026', notes: 'Mobile tối ưu tốt'
      }
    ]
  },
  AI: {
    code: 'Chatbot AI Tư vấn điện ảnh (AI Assistant)',
    name: 'Chatbot AI',
    round1: { done: 16, bugs: 2, pending: 0, blocked: 0, total: 16 },
    round2: { done: 16, bugs: 0, pending: 0, blocked: 0, total: 16 },
    cases: [
      {
        id: 'TC_AI_01',
        summary: 'Xác minh mở khung chatbot nổi ở góc phải màn hình',
        pre: 'Người dùng ở bất kỳ trang nào trên website Movix',
        data: 'Click vào biểu tượng nút tròn Chatbot AI màu tím cam ở góc dưới cùng bên phải',
        steps: '1. Nhấp chuột vào nút mở chatbot.\n2. Quan sát hoạt ảnh mở popup sổ lên.',
        expected: 'Cửa sổ chat mở lên mượt mà, hiển thị lời chào mở đầu thân thiện: "Xin chào! Tôi là Movix AI Assistant...", kèm các nút gợi ý câu hỏi nhanh.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Khung chat mở mượt mà'
      },
      {
        id: 'TC_AI_02',
        summary: 'Xác minh gợi ý phim theo thể loại người dùng yêu cầu',
        pre: 'Khung chat đang mở',
        data: 'Câu hỏi: "Gợi ý cho tôi các phim hành động hấp dẫn đang chiếu"',
        steps: '1. Nhập câu hỏi và gửi.\n2. Quan sát phản hồi của AI.',
        expected: 'AI phản hồi liệt kê đúng các phim hành động đang có trong rạp (ví dụ: Avatar 2, Dune 2), kèm tóm tắt ngắn và nút bấm chuyển đến trang phim.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Gợi ý thể loại chính xác'
      },
      {
        id: 'TC_AI_03',
        summary: 'Xác minh gợi ý phim theo tâm trạng hoặc nhóm người xem (Gia đình, Cặp đôi)',
        pre: 'Khung chat đang mở',
        data: 'Câu hỏi: "Cuối tuần tôi đi xem phim cùng gia đình có trẻ em thì nên xem phim nào?"',
        steps: '1. Gửi câu hỏi về phim gia đình/trẻ em.\n2. Đọc nội dung tư vấn.',
        expected: 'AI nhận diện đối tượng có trẻ nhỏ, ưu tiên gợi ý các phim hoạt hình/gia đình nhãn P (như Doremon, Spider-Man), tuyệt đối không gợi ý phim kinh dị/bạo lực.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Phân tích ngữ cảnh tâm lý tốt'
      },
      {
        id: 'TC_AI_04',
        summary: 'Xác minh cơ chế bảo vệ độ tuổi: Không gợi ý phim C18 cho người dùng dưới 18 tuổi',
        pre: 'Khung chat đang mở',
        data: 'Câu hỏi: "Em năm nay 15 tuổi, rạp có phim gì hay tư vấn cho em với?"',
        steps: '1. Nhập câu hỏi nêu rõ độ tuổi 15 tuổi.\n2. Kiểm tra danh sách phim AI gợi ý trong câu trả lời.',
        expected: 'AI nhận biết khách hàng 15 tuổi, CHỈ gợi ý phim nhãn P hoặc T13. TUYỆT ĐỐI KHÔNG gợi ý phim C18 (Deadpool & Wolverine), đồng thời có câu nhắc nhở thân thiện về quy định độ tuổi tại rạp.',
        r1: 'Fail', bug: 'BUG_AI_01', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Đợt 1 AI vẫn gợi ý phim C18 cho người 15 tuổi do prompt thiếu guardrail. Đợt 2 đã bổ sung system instruction & age filter.'
      },
      {
        id: 'TC_AI_05',
        summary: 'Xác minh hỏi suất chiếu của phim hôm nay',
        pre: 'Phim Dune 2 có các suất chiếu 14:00, 16:45, 19:30',
        data: 'Câu hỏi: "Dune 2 hôm nay chiếu những giờ nào?"',
        steps: '1. Nhập câu hỏi về lịch chiếu của phim Dune 2.\n2. So sánh thông tin giờ chiếu AI đưa ra với dữ liệu thực tế.',
        expected: 'AI phản hồi chính xác các khung giờ chiếu thực tế của phim trong ngày, kèm tên phòng chiếu và rạp.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Dữ liệu khớp CSDL suất chiếu'
      },
      {
        id: 'TC_AI_06',
        summary: 'Xác minh hỏi bảng giá vé các loại ghế',
        pre: 'Khung chat đang mở',
        data: 'Câu hỏi: "Giá vé rạp mình tính như thế nào?"',
        steps: '1. Nhập câu hỏi về giá vé.\n2. Đọc bảng giá do AI cung cấp.',
        expected: 'AI liệt kê rõ ràng: Ghế thường từ 90.000đ, Ghế VIP 120.000đ, Ghế đôi Sweetbox 200.000đ/cặp, kèm các ưu đãi ngày Thứ Tư Vui Vẻ.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Thông tin giá chuẩn xác'
      },
      {
        id: 'TC_AI_07',
        summary: 'Xác minh hỏi hướng dẫn quy trình đặt vé trực tuyến',
        pre: 'Khung chat đang mở',
        data: 'Câu hỏi: "Làm sao để đặt vé và chọn ghế trên web?"',
        steps: '1. Gửi câu hỏi hướng dẫn.\n2. Kiểm tra các bước hướng dẫn.',
        expected: 'AI giải thích ngắn gọn 4 bước: 1. Chọn phim & suất chiếu -> 2. Chọn ghế trên sơ đồ -> 3. Thanh toán trực tuyến -> 4. Nhận mã vé điện tử QR tại rạp.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Hướng dẫn chuẩn quy trình'
      },
      {
        id: 'TC_AI_08',
        summary: 'Xác minh hỏi danh sách phim đang chiếu tại một cụm rạp cụ thể',
        pre: 'Cụm rạp CGV Vincom Bà Triệu',
        data: 'Câu hỏi: "Rạp CGV Vincom Bà Triệu đang chiếu những phim nào?"',
        steps: '1. Nhập câu hỏi về cụm rạp.\n2. Kiểm tra danh sách phim trả về.',
        expected: 'AI lọc và liệt kê đúng các phim đang có lịch chiếu tại chi nhánh đó.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Lọc rạp chính xác'
      },
      {
        id: 'TC_AI_09',
        summary: 'Xác minh xử lý câu hỏi ngoài phạm vi rạp chiếu phim (Out-of-domain query)',
        pre: 'Khung chat đang mở',
        data: 'Câu hỏi: "Thủ đô của nước Pháp là gì?" hoặc "Giải phương trình x + 5 = 10"',
        steps: '1. Gửi câu hỏi hoàn toàn không liên quan đến điện ảnh/rạp phim.\n2. Đọc phản hồi.',
        expected: 'AI lịch sự từ chối và khéo léo định hướng người dùng quay lại chủ đề đặt vé rạp phim: "Tôi là trợ lý ảo chuyên hỗ trợ thông tin phim ảnh và đặt vé tại rạp Movix Cinemax. Tôi có thể giúp gì cho bạn về các bộ phim hay suất chiếu hôm nay không?"',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Xử lý out-of-scope chuẩn mực'
      },
      {
        id: 'TC_AI_10',
        summary: 'Xác minh chặn gửi tin nhắn rỗng hoặc chỉ toàn khoảng trắng',
        pre: 'Khung chat đang mở',
        data: 'Nhập chuỗi "   " và nhấn Enter',
        steps: '1. Nhập toàn dấu cách vào ô chat.\n2. Nhấn nút Gửi hoặc Enter.',
        expected: 'Nút gửi bị disabled, không gửi request rác lên API.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Chặn chuỗi rỗng tốt'
      },
      {
        id: 'TC_AI_11',
        summary: 'Xác minh xử lý khi mất kết nối mạng hoặc lỗi server AI (Network Failure Resilience)',
        pre: 'Mất kết nối mạng internet hoặc ngắt proxy API',
        data: 'Gửi tin nhắn: "Tư vấn phim giúp tôi"',
        steps: '1. Ngắt kết nối mạng trong tab Network DevTools (Offline mode).\n2. Gửi câu hỏi vào khung chat.\n3. Quan sát phản hồi và trạng thái khung chat.',
        expected: 'Giao diện KHÔNG ĐƯỢC TREO đơ ở trạng thái loading spinner vĩnh viễn. Sau thời gian ngắn, hệ thống hiển thị thông báo lỗi thân thiện: "Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra kết nối mạng và thử lại sau ít phút", kèm nút bấm "Thử lại". Khung chat vẫn nhập được câu hỏi mới.',
        r1: 'Fail', bug: 'BUG_AI_02', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Đợt 1 khung chat bị treo vĩnh viễn ở trạng thái "Đang gõ...". Đợt 2 đã bổ sung khối try/catch timeout và nút thử lại.'
      },
      {
        id: 'TC_AI_12',
        summary: 'Xác minh cơ chế timeout khi dịch vụ AI phản hồi chậm quá 15 giây',
        pre: 'Giả lập response chậm > 15s',
        data: 'Gửi câu hỏi',
        steps: '1. Gửi tin nhắn.\n2. Giả lập delay mạng kéo dài.',
        expected: 'Sau 15 giây, kích hoạt AbortController timeout, thông báo hệ thống đang bận và cho phép thử lại.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Timeout handling hoạt động tốt'
      },
      {
        id: 'TC_AI_13',
        summary: 'Xác minh AI không bịa đặt (hallucination) các phim không có trong hệ thống rạp',
        pre: 'Hệ thống rạp Movix chỉ quản lý 12 phim trong cơ sở dữ liệu',
        data: 'Câu hỏi: "Rạp có chiếu phim Avengers Secret Wars không?"',
        steps: '1. Hỏi về một bộ phim chưa ra mắt hoặc không có trong danh mục rạp.\n2. Kiểm tra câu trả lời.',
        expected: 'AI khẳng định rõ ràng: "Hiện tại hệ thống Movix chưa có lịch chiếu cho bộ phim này", đồng thời gợi ý các phim bom tấn hành động tương tự đang có sẵn.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Kiểm soát dữ liệu grounded DB tốt'
      },
      {
        id: 'TC_AI_14',
        summary: 'Xác minh giao diện khung chat hiển thị đúng thiết kế, tin nhắn phân biệt rõ người gửi/bot',
        pre: 'Màn hình Desktop',
        data: 'Khung chat với 5 lượt trao đổi',
        steps: '1. Kiểm tra bong bóng chat người dùng (màu tím bên phải) và AI (màu xám tối có avatar bên trái).',
        expected: 'Phân biệt trực quan, hiển thị thời gian gửi, tự động cuộn xuống tin nhắn mới nhất.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'UI chat tinh tế'
      },
      {
        id: 'TC_AI_15',
        summary: 'Xác minh hoạt động trên Mozilla Firefox',
        pre: 'Firefox',
        data: 'Chat trên Firefox',
        steps: '1. Thực hiện hội thoại liên tục 3 câu hỏi trên Firefox.',
        expected: 'Luồng gửi nhận tin nhắn hoạt động trơn tru.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tương thích Firefox'
      },
      {
        id: 'TC_AI_16',
        summary: 'Xác minh hiển thị khung chat trên màn hình điện thoại (Responsive Mobile)',
        pre: 'Mobile 375x667',
        data: 'Khung chat trên mobile',
        steps: '1. Mở khung chat trên thiết bị di động.\n2. Thử nhập liệu bằng bàn phím ảo.',
        expected: 'Khung chat tự động mở rộng toàn màn hình (fullscreen mobile modal) giúp dễ đọc và gõ chữ, nút đóng chữ X ở góc trên tiện lợi.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Mobile modal chuẩn'
      }
    ]
  },
  MOV: {
    code: 'Quản lý phim (Admin Movie Management)',
    name: 'Quản lý phim',
    round1: { done: 17, bugs: 0, pending: 0, blocked: 0, total: 17 },
    round2: { done: 17, bugs: 0, pending: 0, blocked: 0, total: 17 },
    cases: [
      {
        id: 'TC_MOV_01',
        summary: 'Xác minh tìm phim theo tên phim chính xác trong bảng quản trị',
        pre: 'Đã đăng nhập tài khoản Quản trị viên, mở trang /admin/movies',
        data: 'Từ khóa tìm: "Avatar: The Way of Water"',
        steps: '1. Nhập tên phim vào thanh tìm kiếm quản trị.\n2. Quan sát danh sách.',
        expected: 'Bảng hiển thị đúng dòng dữ liệu phim Avatar kèm thông tin thời lượng, thể loại, trạng thái và nút hành động.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tìm kiếm admin nhanh chóng'
      },
      {
        id: 'TC_MOV_02',
        summary: 'Xác minh thông báo khi không tìm thấy kết quả phù hợp trong quản trị',
        pre: 'Đang ở trang /admin/movies',
        data: 'Từ khóa: "zzzz_phim_khong_ton_tai"',
        steps: '1. Nhập từ khóa không có thực.\n2. Nhấn tìm kiếm.',
        expected: 'Hiển thị thông báo "Không tìm thấy phim nào phù hợp với bộ lọc".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Empty state hiển thị tốt'
      },
      {
        id: 'TC_MOV_03',
        summary: 'Xác minh danh sách phim hiển thị đủ cột và đúng dữ liệu',
        pre: 'Trang /admin/movies',
        data: 'Toàn bộ danh sách phim trong hệ thống',
        steps: '1. Kiểm tra các tiêu đề cột: Poster, Tên phim, Thể loại, Thời lượng, Độ tuổi, Trạng thái, Ngày khởi chiếu, Hành động (Sửa/Xóa).',
        expected: 'Hiển thị đầy đủ tất cả các cột, dữ liệu ánh xạ chính xác từ bảng movies trong database.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Bảng dữ liệu chuẩn xác'
      },
      {
        id: 'TC_MOV_04',
        summary: 'Xác minh thêm phim mới thành công với dữ liệu hợp lệ',
        pre: 'Đang mở modal "Thêm phim mới"',
        data: 'Tên phim: "Mission Impossible 8", Thể loại: "Hành động", Thời lượng: 165 phút, Độ tuổi: "C16", Trailer: URL Youtube, Poster: file ảnh hợp lệ',
        steps: '1. Nhấp nút "+ Thêm phim mới".\n2. Điền đầy đủ thông tin hợp lệ.\n3. Nhấn nút "Lưu phim".',
        expected: 'Modal đóng lại, hiển thị toast thành công: "Thêm phim mới thành công!", phim mới xuất hiện ngay lập tức ở đầu danh sách quản trị.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tạo phim mới thành công'
      },
      {
        id: 'TC_MOV_05',
        summary: 'Xác minh thông báo lỗi khi để trống toàn bộ trường khi thêm mới',
        pre: 'Mở modal "Thêm phim mới"',
        data: 'Tất cả các trường: null',
        steps: '1. Mở modal thêm phim.\n2. Nhấn nút "Lưu phim" ngay lập tức mà không điền thông tin.',
        expected: 'Chặn lưu, hiển thị viền đỏ và thông báo yêu cầu bắt buộc nhập các trường: Tên phim, Thể loại, Thời lượng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Form validation nghiêm ngặt'
      },
      {
        id: 'TC_MOV_06',
        summary: 'Xác minh thông báo lỗi khi để trống Tên phim',
        pre: 'Modal thêm phim',
        data: 'Tên phim: rỗng, các trường khác điền hợp lệ',
        steps: '1. Nhập thời lượng, thể loại nhưng bỏ trống ô Tên phim.\n2. Nhấn "Lưu".',
        expected: 'Báo lỗi: "Tên phim là thông tin bắt buộc, không được để trống".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Bắt lỗi tên phim tốt'
      },
      {
        id: 'TC_MOV_07',
        summary: 'Xác minh chặn nhập Thời lượng là số âm hoặc bằng 0 (BVA)',
        pre: 'Modal thêm phim',
        data: 'Thời lượng: -5 phút hoặc 0 phút',
        steps: '1. Nhập Thời lượng = -5.\n2. Nhấn "Lưu".',
        expected: 'Hệ thống báo lỗi: "Thời lượng phim phải là số nguyên dương lớn hơn 0 (phút)". Chặn submit.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Kiểm tra giá trị biên chuẩn'
      },
      {
        id: 'TC_MOV_08',
        summary: 'Xác minh kiểm tra định dạng tệp Poster (Chỉ chấp nhận file ảnh)',
        pre: 'Modal thêm phim',
        data: 'Tệp đính kèm: document.pdf hoặc script.exe',
        steps: '1. Chọn tệp PDF làm Poster phim.\n2. Nhấn "Lưu".',
        expected: 'Hệ thống từ chối tệp, báo lỗi: "Định dạng tệp không được hỗ trợ. Vui lòng tải lên tệp hình ảnh (.jpg, .png, .webp)".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Kiểm tra MIME type file ảnh'
      },
      {
        id: 'TC_MOV_09',
        summary: 'Xác minh thêm phim bị trùng tên với phim đã có sẵn',
        pre: 'Hệ thống đã có phim "Avatar: The Way of Water"',
        data: 'Nhập Tên phim: "Avatar: The Way of Water"',
        steps: '1. Nhập tên phim trùng với phim đang tồn tại.\n2. Nhấn "Lưu".',
        expected: 'Hiển thị cảnh báo lỗi: "Tên phim này đã tồn tại trong danh mục hệ thống". Chặn tạo trùng lặp.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Ngăn chặn trùng tên phim'
      },
      {
        id: 'TC_MOV_10',
        summary: 'Xác minh sửa đổi thông tin phim thành công',
        pre: 'Chọn 1 phim bất kỳ trong bảng',
        data: 'Sửa Thời lượng từ 120 phút -> 125 phút, cập nhật mô tả mới',
        steps: '1. Nhấp icon Cây bút (Sửa) tại dòng phim.\n2. Đổi thời lượng thành 125 phút.\n3. Nhấn "Cập nhật".',
        expected: 'Modal đóng, thông báo "Cập nhật thông tin phim thành công!", thông tin mới được cập nhật ngay trên giao diện.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Cập nhật phim mượt mà'
      },
      {
        id: 'TC_MOV_11',
        summary: 'Xác minh xóa phim thành công khi phim chưa có suất chiếu nào',
        pre: 'Phim thử nghiệm vừa tạo không có bất kỳ suất chiếu liên quan nào',
        data: 'Click icon Thùng rác (Xóa)',
        steps: '1. Nhấp icon Thùng rác.\n2. Modal xác nhận "Bạn có chắc chắn muốn xóa bộ phim này?".\n3. Nhấn "Xóa vĩnh viễn".',
        expected: 'Xóa thành công khỏi database, dòng phim biến mất khỏi bảng danh sách.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Xóa an toàn'
      },
      {
        id: 'TC_MOV_12',
        summary: 'Xác minh cảnh báo ràng buộc toàn vẹn khi xóa phim đã có suất chiếu',
        pre: 'Phim Dune 2 đang có 10 suất chiếu đang mở bán vé',
        data: 'Thử xóa phim Dune 2',
        steps: '1. Nhấp nút Xóa phim Dune 2.\n2. Xác nhận xóa.',
        expected: 'Hệ thống chặn xóa và cảnh báo: "Không thể xóa bộ phim này vì đang có các suất chiếu liên quan. Vui lòng chuyển trạng thái sang Ngừng chiếu hoặc xóa các suất chiếu trước".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Ràng buộc toàn vẹn dữ liệu tốt'
      },
      {
        id: 'TC_MOV_13',
        summary: 'Xác minh khách hàng thông thường không thể truy cập trái phép trang quản lý phim',
        pre: 'Đăng nhập tài khoản khách hàng thông thường (role: user)',
        data: 'Gõ trực tiếp URL http://localhost:3000/admin/movies',
        steps: '1. Truy cập trực tiếp URL trang quản trị.\n2. Quan sát cơ chế phân quyền bảo vệ.',
        expected: 'Hệ thống chặn truy cập, hiển thị thông báo "Bạn không có quyền truy cập trang quản trị này" và tự động chuyển hướng về Trang chủ.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Bảo vệ Route Admin chặt chẽ'
      },
      {
        id: 'TC_MOV_14',
        summary: 'Xác minh cập nhật trạng thái phim (Đang chiếu / Sắp chiếu / Ngừng chiếu)',
        pre: 'Phim đang ở trạng thái "coming_soon"',
        data: 'Chuyển đổi trạng thái sang "now_showing"',
        steps: '1. Tại dropdown trạng thái hoặc form sửa, chọn "Đang chiếu".\n2. Nhấn "Lưu".',
        expected: 'Phim ngay lập tức xuất hiện bên tab "Phim đang chiếu" ngoài trang chủ của khách hàng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Đồng bộ trạng thái tức thì'
      },
      {
        id: 'TC_MOV_15',
        summary: 'Xác minh giao diện trang quản lý phim chuẩn thiết kế Admin Dashboard',
        pre: 'Desktop 1920x1080',
        data: 'Trang /admin/movies',
        steps: '1. Quan sát bố cục bảng, thanh công cụ tìm kiếm, nút thêm phim, phân trang.',
        expected: 'Giao diện Admin thiết kế chuẩn mực, khoảng cách cột cân đối, hiệu ứng hover từng dòng rõ ràng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Admin UI chuyên nghiệp'
      },
      {
        id: 'TC_MOV_16',
        summary: 'Xác minh hoạt động trên Microsoft Edge',
        pre: 'Microsoft Edge',
        data: 'Thao tác CRUD phim trên Edge',
        steps: '1. Thử nghiệm trên Edge.',
        expected: 'Hoạt động mượt mà không lỗi.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tương thích Edge'
      },
      {
        id: 'TC_MOV_17',
        summary: 'Xác minh hiển thị trên màn hình điện thoại (Responsive)',
        pre: 'Mobile 375x667',
        data: 'DevTools Responsive',
        steps: '1. Mở trang quản lý phim trên mobile.',
        expected: 'Bảng dữ liệu có thanh trượt ngang mượt mà, không làm vỡ sidebar hoặc header của trang.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Responsive tốt'
      }
    ]
  },
  ROM: {
    code: 'Quản lý phòng chiếu (Room Management)',
    name: 'Quản lý phòng chiếu',
    round1: { done: 15, bugs: 0, pending: 0, blocked: 0, total: 15 },
    round2: { done: 15, bugs: 0, pending: 0, blocked: 0, total: 15 },
    cases: [
      {
        id: 'TC_ROM_01',
        summary: 'Xác minh tìm phòng chiếu theo tên phòng chính xác',
        pre: 'Đã vào trang /admin/rooms',
        data: 'Từ khóa: "Phòng 1 (Standard 2D)"',
        steps: '1. Nhập tên phòng vào ô tìm kiếm.\n2. Quan sát bảng.',
        expected: 'Hiển thị chính xác phòng chiếu cần tìm kèm số lượng ghế và cụm rạp sở hữu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tìm kiếm phòng nhanh'
      },
      {
        id: 'TC_ROM_02',
        summary: 'Xác minh danh sách phòng chiếu hiển thị đủ cột và dữ liệu chuẩn',
        pre: 'Trang /admin/rooms',
        data: 'Danh sách phòng chiếu',
        steps: '1. Kiểm tra các cột: Tên phòng, Cụm rạp, Tổng số ghế, Số hàng, Số cột, Loại phòng (2D/3D/IMAX), Hành động.',
        expected: 'Hiển thị đủ tất cả các trường dữ liệu và số lượng ghế khớp thực tế.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Bảng dữ liệu chuẩn'
      },
      {
        id: 'TC_ROM_03',
        summary: 'Xác minh thêm phòng chiếu mới thành công với dữ liệu hợp lệ',
        pre: 'Modal "Thêm phòng chiếu"',
        data: 'Tên: "Phòng 3 (IMAX Laser)", Rạp: "CGV Bà Triệu", Hàng ghế: 8, Cột ghế: 10',
        steps: '1. Điền tên phòng, chọn cụm rạp, nhập số hàng 8, số cột 10.\n2. Nhấn "Lưu phòng chiếu".',
        expected: 'Tạo phòng mới thành công, tự động khởi tạo ma trận 80 ghế (8x10) mặc định.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tạo phòng thành công'
      },
      {
        id: 'TC_ROM_04',
        summary: 'Xác minh thông báo lỗi khi để trống toàn bộ trường khi thêm phòng',
        pre: 'Modal thêm phòng chiếu',
        data: 'Tất cả: null',
        steps: '1. Nhấn Lưu ngay khi các ô trống.',
        expected: 'Báo lỗi yêu cầu nhập đầy đủ Tên phòng, Cụm rạp và Số hàng ghế.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Chặn submit rỗng'
      },
      {
        id: 'TC_ROM_05',
        summary: 'Xác minh chặn nhập Số hàng ghế là số âm hoặc số 0 (BVA)',
        pre: 'Modal thêm phòng',
        data: 'Số hàng ghế: -5 hoặc 0',
        steps: '1. Nhập Số hàng ghế = -5.\n2. Nhấn Lưu.',
        expected: 'Hiển thị thông báo lỗi: "Số hàng ghế phải là số nguyên dương lớn hơn 0 (từ 1 đến 20 hàng)".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'BVA số hàng ghế chuẩn'
      },
      {
        id: 'TC_ROM_06',
        summary: 'Xác minh thêm phòng chiếu bị trùng tên trong cùng một cụm rạp',
        pre: 'Tại CGV Bà Triệu đã có "Phòng 1 (Standard 2D)"',
        data: 'Tên phòng: "Phòng 1 (Standard 2D)", Cụm rạp: "CGV Bà Triệu"',
        steps: '1. Thử tạo phòng trùng tên trong cùng rạp.\n2. Nhấn Lưu.',
        expected: 'Báo lỗi: "Phòng chiếu này đã tồn tại trong cụm rạp đã chọn. Vui lòng đặt tên phòng khác".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Ràng buộc duy nhất tên phòng theo rạp'
      },
      {
        id: 'TC_ROM_07',
        summary: 'Xác minh sửa thông tin phòng chiếu thành công',
        pre: 'Chọn 1 phòng chiếu',
        data: 'Đổi tên thành "Phòng 1 (Standard 2D Laser)", đổi loại màn hình',
        steps: '1. Nhấp Sửa phòng.\n2. Cập nhật thông tin.\n3. Nhấn Lưu.',
        expected: 'Cập nhật thành công, thông tin mới hiển thị ngay trong danh sách.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Cập nhật phòng thành công'
      },
      {
        id: 'TC_ROM_08',
        summary: 'Xác minh xóa phòng chiếu thành công khi chưa gắn suất chiếu nào',
        pre: 'Phòng chiếu mới tạo chưa có suất chiếu',
        data: 'Xóa phòng',
        steps: '1. Bấm Xóa phòng chiếu.\n2. Xác nhận popup cảnh báo.',
        expected: 'Xóa phòng và toàn bộ dữ liệu cấu hình ghế của phòng đó trong DB.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Xóa phòng an toàn'
      },
      {
        id: 'TC_ROM_09',
        summary: 'Xác minh cảnh báo toàn vẹn khi xóa phòng chiếu đang có lịch chiếu',
        pre: 'Phòng 1 đang có các suất chiếu trong tuần',
        data: 'Thử xóa Phòng 1',
        steps: '1. Nhấp Xóa Phòng 1.\n2. Xác nhận.',
        expected: 'Hệ thống báo lỗi và chặn xóa: "Không thể xóa phòng chiếu đang có suất chiếu đã lên lịch".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Bảo vệ dữ liệu lịch chiếu'
      },
      {
        id: 'TC_ROM_10',
        summary: 'Xác minh sơ đồ ghế được khởi tạo đúng theo cấu hình Số hàng x Số cột',
        pre: 'Phòng có 8 hàng, 10 ghế mỗi hàng',
        data: 'Mở trình chỉnh sửa sơ đồ ghế (Seat Layout Editor)',
        steps: '1. Nhấp "Cấu hình ghế" tại dòng phòng chiếu.\n2. Đếm số hàng và số ghế hiển thị.',
        expected: 'Hiển thị chính xác ma trận 8 hàng (A đến H), mỗi hàng 10 ghế (1 đến 10), tổng cộng 80 ghế.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Ma trận ghế chuẩn'
      },
      {
        id: 'TC_ROM_11',
        summary: 'Xác minh thiết lập chuyển đổi loại ghế thành ghế VIP trong sơ đồ',
        pre: 'Đang ở màn hình cấu hình ghế',
        data: 'Chọn hàng E và F chuyển thành loại "VIP"',
        steps: '1. Chọn các ghế hàng E, F.\n2. Chọn loại "VIP" từ bảng màu.\n3. Nhấn "Lưu cấu hình".',
        expected: 'Các ghế đổi sang màu cam VIP, khi khách hàng đặt vé sẽ tự động áp giá vé VIP tương ứng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Cấu hình ghế VIP hoạt động tốt'
      },
      {
        id: 'TC_ROM_12',
        summary: 'Xác minh thiết lập ghế đôi Sweetbox cho hàng cuối cùng',
        pre: 'Đang ở màn hình cấu hình ghế',
        data: 'Chọn các cặp ghế liền kề ở hàng cuối chuyển thành "Sweetbox"',
        steps: '1. Chọn cặp ghế I1-I2, I3-I4.\n2. Thiết lập loại "Ghế đôi Sweetbox".\n3. Nhấn Lưu.',
        expected: 'Cặp ghế liên kết thành một khối đôi có viền bo tròn đặc trưng, lưu cờ isPair: true trong DB.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Cấu hình ghế đôi chuẩn'
      },
      {
        id: 'TC_ROM_13',
        summary: 'Xác minh giao diện quản lý phòng hiển thị đúng thiết kế',
        pre: 'Desktop',
        data: 'Giao diện /admin/rooms',
        steps: '1. Kiểm tra trực quan.',
        expected: 'Bố cục cân đối, hiển thị trực quan thông số từng phòng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Giao diện đẹp'
      },
      {
        id: 'TC_ROM_14',
        summary: 'Xác minh hoạt động trên Google Chrome',
        pre: 'Google Chrome',
        data: 'Thao tác cấu hình phòng trên Chrome',
        steps: '1. Chạy trên Chrome.',
        expected: 'Hoạt động tốt không có lỗi phát sinh.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tương thích tốt'
      },
      {
        id: 'TC_ROM_15',
        summary: 'Xác minh hiển thị trên màn hình điện thoại (Responsive)',
        pre: 'Mobile 375x667',
        data: 'Responsive view',
        steps: '1. Mở trên mobile.',
        expected: 'Thẻ phòng chiếu xếp dọc gọn gàng, nút cấu hình hiển thị rõ ràng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Mobile tốt'
      }
    ]
  },
  SHW: {
    code: 'Quản lý suất chiếu (Showtime Management)',
    name: 'Quản lý suất chiếu',
    round1: { done: 17, bugs: 1, pending: 0, blocked: 0, total: 17 },
    round2: { done: 17, bugs: 0, pending: 0, blocked: 0, total: 17 },
    cases: [
      {
        id: 'TC_SHW_01',
        summary: 'Xác minh tìm suất chiếu theo tên phim chính xác',
        pre: 'Đã vào trang /admin/showtimes',
        data: 'Từ khóa: "Avatar: The Way of Water"',
        steps: '1. Nhập tên phim vào thanh lọc suất chiếu.\n2. Quan sát kết quả.',
        expected: 'Chỉ hiển thị các suất chiếu của phim Avatar, liệt kê rõ rạp, phòng, ngày và giờ chiếu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tìm suất chiếu nhanh'
      },
      {
        id: 'TC_SHW_02',
        summary: 'Xác minh danh sách suất chiếu hiển thị đủ cột và dữ liệu chuẩn',
        pre: 'Trang /admin/showtimes',
        data: 'Danh sách suất chiếu',
        steps: '1. Kiểm tra các cột: Phim, Cụm rạp & Phòng, Ngày chiếu, Giờ bắt đầu, Giờ kết thúc, Giá vé gốc, Ghế đã đặt, Trạng thái, Thao tác.',
        expected: 'Hiển thị đầy đủ mọi cột, giờ kết thúc tự tính chuẩn xác theo thời lượng phim.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Dữ liệu hiển thị chi tiết'
      },
      {
        id: 'TC_SHW_03',
        summary: 'Xác minh thêm suất chiếu mới thành công với dữ liệu hợp lệ',
        pre: 'Modal "Thêm suất chiếu"',
        data: 'Phim: "Avatar 2" (192 phút), Rạp: CGV Bà Triệu, Phòng 1, Ngày mai, Bắt đầu: 14:00, Giá vé: 100.000đ',
        steps: '1. Chọn phim, rạp, phòng, ngày chiếu và giờ bắt đầu.\n2. Kiểm tra giờ kết thúc tự tính (14:00 + 192p = 17:12).\n3. Nhấn "Lưu suất chiếu".',
        expected: 'Tạo thành công, thông báo "Thêm suất chiếu mới thành công!", suất chiếu xuất hiện trong danh sách.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Thêm suất chiếu tốt'
      },
      {
        id: 'TC_SHW_04',
        summary: 'Xác minh thông báo lỗi khi để trống toàn bộ trường khi thêm',
        pre: 'Modal thêm suất chiếu',
        data: 'Tất cả: null',
        steps: '1. Bấm Lưu mà không chọn phim hay nhập giờ.',
        expected: 'Chặn submit, báo lỗi bắt buộc chọn Phim, Cụm rạp, Phòng chiếu và Giờ chiếu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Validation chuẩn'
      },
      {
        id: 'TC_SHW_05',
        summary: 'Xác minh chặn nhập Giá vé là số âm hoặc bằng 0',
        pre: 'Modal thêm suất chiếu',
        data: 'Giá vé: -50.000đ hoặc 0đ',
        steps: '1. Nhập Giá vé = -50000.\n2. Nhấn Lưu.',
        expected: 'Hệ thống báo lỗi: "Giá vé phải là số nguyên dương hợp lệ (tối thiểu 40.000đ)".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'BVA giá vé chuẩn'
      },
      {
        id: 'TC_SHW_06',
        summary: 'Xác minh sửa đổi thông tin suất chiếu thành công',
        pre: 'Chọn 1 suất chiếu chưa bán vé',
        data: 'Đổi giá vé từ 90.000đ -> 110.000đ',
        steps: '1. Bấm nút Sửa tại suất chiếu.\n2. Đổi giá vé.\n3. Bấm Cập nhật.',
        expected: 'Cập nhật thành công, giá vé mới hiển thị chính xác.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Sửa suất chiếu tốt'
      },
      {
        id: 'TC_SHW_07',
        summary: 'Xác minh xóa suất chiếu thành công khi chưa có khách đặt vé',
        pre: 'Suất chiếu vừa tạo (Ghế đã đặt = 0)',
        data: 'Xóa suất chiếu',
        steps: '1. Bấm Xóa suất chiếu.\n2. Xác nhận popup cảnh báo.',
        expected: 'Suất chiếu bị xóa khỏi hệ thống và không còn xuất hiện trên lịch chiếu ngoài trang chủ.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Xóa an toàn'
      },
      {
        id: 'TC_SHW_08',
        summary: 'Xác minh không cho phép xóa suất chiếu đã có vé được khách đặt',
        pre: 'Suất chiếu có Ghế đã đặt = 4',
        data: 'Thử xóa suất chiếu đã bán vé',
        steps: '1. Bấm Xóa suất chiếu đã có 4 vé.\n2. Xác nhận.',
        expected: 'Hệ thống từ chối xóa và hiển thị cảnh báo: "Không thể xóa suất chiếu đã có khách đặt vé. Vui lòng xử lý hoàn tiền/hủy đơn trước".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Bảo vệ dữ liệu đơn hàng của khách'
      },
      {
        id: 'TC_SHW_09',
        summary: 'Xác minh không cho phép tạo suất chiếu bị trùng khung giờ trong cùng một phòng chiếu',
        pre: 'Phòng 1 đã có suất 14:00 - 16:30 ngày hôm nay',
        data: 'Thêm suất mới cùng Phòng 1 lúc 15:00 - 17:00 (chồng lấn 90 phút)',
        steps: '1. Chọn cùng Phòng 1, cùng ngày.\n2. Đặt giờ bắt đầu lúc 15:00.\n3. Nhấn Lưu suất chiếu.',
        expected: 'Hệ thống tự động phát hiện xung đột lịch chiếu, báo lỗi: "Khung giờ này đã bị trùng lặp với một suất chiếu khác trong cùng phòng (Đang có suất 14:00 - 16:30)". Chặn tạo suất.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Kiểm tra va chạm lịch chiếu'
      },
      {
        id: 'TC_SHW_10',
        summary: 'Xác minh cho phép thêm suất chiếu liền kề sát mốc giờ kết thúc (Adjacent Showtimes)',
        pre: 'Phòng 1 có suất chiếu kết thúc chính xác lúc 16:30',
        data: 'Thêm suất chiếu mới bắt đầu đúng 16:30 (hoặc 16:45 sau thời gian dọn rạp 15 phút)',
        steps: '1. Chọn cùng Phòng 1.\n2. Nhập giờ bắt đầu đúng 16:30.\n3. Nhấn Lưu suất chiếu.',
        expected: 'Hệ thống xác định không bị chồng lấn thời gian (startTime >= existingEndTime), cho phép tạo thành công.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'BVA mốc giờ liền kề chính xác'
      },
      {
        id: 'TC_SHW_11',
        summary: 'Xác minh giờ kết thúc tự động tính theo thời lượng phim (Start Time + Duration)',
        pre: 'Phim có thời lượng 120 phút (2 tiếng)',
        data: 'Giờ bắt đầu nhập: 19:15',
        steps: '1. Chọn phim 120 phút.\n2. Chọn giờ bắt đầu 19:15.\n3. Quan sát trường Giờ kết thúc.',
        expected: 'Trường Giờ kết thúc tự động điền giá trị 21:15, người dùng không cần tính nhẩm bằng tay.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tự động hóa tính toán thời gian'
      },
      {
        id: 'TC_SHW_12',
        summary: 'Xác minh chặn tạo suất chiếu ở thời điểm quá khứ',
        pre: 'Thời điểm hiện tại là 15:30 ngày hôm nay',
        data: 'Nhập ngày hôm qua hoặc 10:00 sáng hôm nay',
        steps: '1. Chọn ngày hoặc giờ trong quá khứ.\n2. Nhấn Lưu.',
        expected: 'Hệ thống báo lỗi: "Không thể tạo suất chiếu ở thời điểm đã qua trong quá khứ".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Ràng buộc thời gian logic'
      },
      {
        id: 'TC_SHW_13',
        summary: 'Xác minh suất chiếu mới tạo hiển thị ngay trên giao diện khách hàng',
        pre: 'Vừa tạo thành công suất chiếu 21:00 cho phim Avatar 2',
        data: 'Kiểm tra trang chi tiết phim ngoài giao diện khách hàng',
        steps: '1. Mở trang chi tiết phim Avatar 2 ở giao diện người dùng.\n2. Kiểm tra tab ngày tương ứng.',
        expected: 'Nút suất chiếu 21:00 xuất hiện ngay lập tức, khách hàng có thể nhấp vào để đặt vé.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Đồng bộ dữ liệu thời gian thực'
      },
      {
        id: 'TC_SHW_14',
        summary: 'Xác minh khi SỬA giờ chiếu của suất hiện tại cũng phải kiểm tra trùng lịch (Collision Check on Edit)',
        pre: 'Phòng 2 có 2 suất: Suất 1 (14:00 - 16:00) và Suất 2 (18:00 - 20:00)',
        data: 'Mở sửa Suất 2, đổi giờ bắt đầu thành 15:00 (chồng lấn vào Suất 1)',
        steps: '1. Nhấp Sửa Suất 2.\n2. Đổi giờ từ 18:00 thành 15:00.\n3. Nhấn "Cập nhật suất chiếu".\n4. Quan sát phản hồi.',
        expected: 'Hệ thống kiểm tra va chạm lịch (bỏ qua chính ID của suất đang sửa) và phát hiện xung đột với Suất 1, hiển thị cảnh báo lỗi trùng lịch, KHÔNG CHO PHÉP LƯU.',
        r1: 'Fail', bug: 'BUG_SHW_01', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Đợt 1 khi sửa giờ không gọi hàm kiểm tra trùng lịch nên cho lưu đè. Đợt 2 đã fix checkOverlap() cả khi edit.'
      },
      {
        id: 'TC_SHW_15',
        summary: 'Xác minh giao diện quản lý suất chiếu hiển thị đúng thiết kế',
        pre: 'Desktop',
        data: 'Trang /admin/showtimes',
        steps: '1. Quan sát danh sách suất chiếu.',
        expected: 'Bảng thiết kế đẹp, rõ ràng giờ bắt đầu và kết thúc.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'UI chuyên nghiệp'
      },
      {
        id: 'TC_SHW_16',
        summary: 'Xác minh hoạt động trên Mozilla Firefox',
        pre: 'Firefox',
        data: 'Thao tác quản lý suất chiếu trên Firefox',
        steps: '1. Chạy trên Firefox.',
        expected: 'Hoạt động hoàn hảo.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tương thích tốt'
      },
      {
        id: 'TC_SHW_17',
        summary: 'Xác minh hiển thị trên màn hình điện thoại (Responsive)',
        pre: 'Mobile 375x667',
        data: 'Responsive view',
        steps: '1. Kiểm tra trên màn hình điện thoại.',
        expected: 'Giao diện co dãn tốt, bảng có scroll ngang.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Mobile tối ưu'
      }
    ]
  },
  ORD: {
    code: 'Quản lý vé & Đơn đặt vé (Order & Booking Management)',
    name: 'Quản lý vé & đơn đặt vé',
    round1: { done: 15, bugs: 1, pending: 0, blocked: 1, total: 15 },
    round2: { done: 15, bugs: 0, pending: 0, blocked: 0, total: 15 },
    cases: [
      {
        id: 'TC_ORD_01',
        summary: 'Xác minh tìm đơn đặt vé theo Mã đơn chính xác (Order Code)',
        pre: 'Đã vào trang /admin/orders',
        data: 'Mã đơn có sẵn: "MVX-92813"',
        steps: '1. Nhập "MVX-92813" vào ô tìm kiếm.\n2. Quan sát kết quả.',
        expected: 'Hiển thị chính xác đơn hàng có mã MVX-92813 kèm tên khách, phim, ghế và số tiền.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tìm kiếm mã đơn nhanh'
      },
      {
        id: 'TC_ORD_02',
        summary: 'Xác minh tìm đơn theo tên khách hàng',
        pre: 'Trang quản lý đơn',
        data: 'Tên khách: "Nguyễn Toàn Thắng"',
        steps: '1. Nhập tên khách hàng.\n2. Quan sát danh sách.',
        expected: 'Hiển thị toàn bộ các đơn hàng do khách hàng Nguyễn Toàn Thắng thực hiện.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Lọc theo khách chuẩn'
      },
      {
        id: 'TC_ORD_03',
        summary: 'Xác minh lọc đơn theo trạng thái (Đã thanh toán / Chờ thanh toán / Đã hủy)',
        pre: 'Trang quản lý đơn',
        data: 'Dropdown trạng thái: "Đã thanh toán"',
        steps: '1. Chọn lọc trạng thái "Đã thanh toán".\n2. Kiểm tra các dòng dữ liệu.',
        expected: 'Tất cả các đơn hiển thị đều có badge màu xanh lá "Đã thanh toán" (status: paid).',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Lọc trạng thái chính xác'
      },
      {
        id: 'TC_ORD_04',
        summary: 'Xác minh lọc đơn theo ngày giao dịch',
        pre: 'Trang quản lý đơn',
        data: 'Bộ chọn ngày: Ngày hôm nay',
        steps: '1. Chọn xem các đơn phát sinh trong ngày hôm nay.',
        expected: 'Hiển thị chính xác các đơn hàng được tạo trong ngày đã chọn.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Lọc ngày tốt'
      },
      {
        id: 'TC_ORD_05',
        summary: 'Xác minh xem chi tiết đơn hàng trong modal (Order Detail Popup)',
        pre: 'Chọn 1 đơn hàng trong bảng',
        data: 'Click nút icon "Con mắt" (Xem chi tiết)',
        steps: '1. Nhấp nút xem chi tiết đơn hàng.\n2. Quan sát nội dung modal hiện lên.',
        expected: 'Modal hiển thị đầy đủ: Mã vé, Mã giao dịch, Họ tên khách, SĐT, Email, Tên phim, Rạp, Phòng chiếu, Suất chiếu, Danh sách mã ghế, Phương thức thanh toán, Tổng tiền.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Chi tiết đơn rõ ràng'
      },
      {
        id: 'TC_ORD_06',
        summary: 'Xác minh tổng tiền trong chi tiết khớp chính xác với tổng giá các ghế',
        pre: 'Đơn hàng gồm 1 ghế Thường (90k) và 1 ghế VIP (120k)',
        data: 'Kiểm tra phép tính tổng',
        steps: '1. So sánh từng ghế với tổng tiền hiển thị.',
        expected: 'Tổng tiền hiển thị đúng bằng 210.000đ (trừ mã giảm giá nếu có), số tiền khớp tuyệt đối.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Kiểm toán doanh thu khớp'
      },
      {
        id: 'TC_ORD_07',
        summary: 'Xác minh đổi trạng thái đơn hàng hợp lệ (Chuyển sang "Đã sử dụng / Đã soát vé")',
        pre: 'Đơn đang ở trạng thái "Đã thanh toán"',
        data: 'Chuyển trạng thái sang "Đã sử dụng" (checked-in)',
        steps: '1. Nhân viên soát vé bấm "Đã soát vé".\n2. Quan sát cập nhật.',
        expected: 'Đơn đổi sang badge xanh dương "Đã sử dụng", ghi nhận vé đã vào rạp.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Soát vé thành công'
      },
      {
        id: 'TC_ORD_08',
        summary: 'Xác minh chức năng Hủy đơn hàng và hoàn tiền (Cancel Order)',
        pre: 'Đơn hàng hợp lệ chưa đến giờ chiếu',
        data: 'Click nút Hủy đơn',
        steps: '1. Bấm nút Hủy đơn hàng.\n2. Xác nhận lý do hủy.\n3. Quan sát trạng thái đơn.',
        expected: 'Trạng thái đơn chuyển sang badge đỏ "Đã hủy" (cancelled).',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Cập nhật trạng thái hủy tốt'
      },
      {
        id: 'TC_ORD_09',
        summary: 'Xác minh HOÀN TRẢ GHẾ về trạng thái trống ngay sau khi Hủy đơn hàng (Seat Release on Order Cancel)',
        pre: 'Đơn hàng MVX-92813 đã đặt các ghế G5, G6',
        data: 'Thực hiện thao tác Hủy đơn MVX-92813',
        steps: '1. Quản trị viên nhấp Hủy đơn MVX-92813 và xác nhận.\n2. Đơn hàng chuyển sang trạng thái "Đã hủy".\n3. Mở sơ đồ ghế của suất chiếu đó trên màn hình đặt vé.\n4. Quan sát trạng thái của hai ghế G5 và G6.',
        expected: 'Sau khi đơn bị hủy, hệ thống TỰ ĐỘNG giải phóng hai ghế G5 và G6, đưa trạng thái từ Booked trở lại trạng thái AVAILABLE (ghế trống). Khách hàng khác có thể tiếp tục nhấp chọn và mua hai ghế này bình thường.',
        r1: 'Fail', bug: 'BUG_ORD_01', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Đợt 1 đơn hủy nhưng ghế vẫn bị kẹt trạng thái Booked. Đợt 2 đã fix releaseSeatsOnCancel() giải phóng ghế ngay lập tức.'
      },
      {
        id: 'TC_ORD_10',
        summary: 'Xác minh không thể hủy đơn hàng của suất chiếu đã kết thúc trong quá khứ',
        pre: 'Đơn hàng của suất chiếu đã chiếu từ hôm trước',
        data: 'Đơn hàng quá khứ',
        steps: '1. Tìm đơn hàng quá khứ.\n2. Thử bấm nút Hủy đơn.',
        expected: 'Nút Hủy bị ẩn hoặc hệ thống từ chối với thông báo: "Không thể hủy đơn hàng của suất chiếu đã diễn ra".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Chặn hủy vé quá hạn đúng luật rạp'
      },
      {
        id: 'TC_ORD_11',
        summary: 'Xác minh xóa bản ghi đơn hàng thành công kèm giải phóng ghế',
        pre: 'Đơn hàng thử nghiệm',
        data: 'Xóa đơn',
        steps: '1. Bấm nút Xóa đơn.\n2. Xác nhận xóa vĩnh viễn.',
        expected: 'Bản ghi bị xóa khỏi bảng, các ghế liên quan nếu chưa nhả sẽ tự động được hoàn trả về trống.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Xóa đơn sạch sẽ'
      },
      {
        id: 'TC_ORD_12',
        summary: 'Xác minh trang thống kê tổng doanh thu tự động cộng dồn các đơn đã thanh toán',
        pre: 'Hệ thống có nhiều đơn ở các trạng thái khác nhau (Paid, Cancelled, Pending)',
        data: 'Trang Thống kê & Báo cáo /admin/reports',
        steps: '1. Mở trang Thống kê doanh thu.\n2. Kiểm tra con số Tổng doanh thu.',
        expected: 'Tổng doanh thu hiển thị đúng bằng tổng tiền của các đơn có trạng thái "Đã thanh toán" (paid), KHÔNG tính các đơn Đã hủy hoặc Chờ thanh toán.',
        r1: 'Blocked', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Đợt 1 trang thống kê chưa kết nối dữ liệu đơn nên bị Blocked. Đợt 2 đã hoàn thiện tính doanh thu chuẩn.'
      },
      {
        id: 'TC_ORD_13',
        summary: 'Xác minh giao diện quản lý đơn hiển thị đúng thiết kế, bảng biểu khoa học',
        pre: 'Desktop',
        data: 'Giao diện /admin/orders',
        steps: '1. Kiểm tra trực quan.',
        expected: 'Bảng rõ ràng, màu sắc badge phân biệt trạng thái dễ nhận biết.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'UI trực quan'
      },
      {
        id: 'TC_ORD_14',
        summary: 'Xác minh hoạt động trên Microsoft Edge',
        pre: 'Microsoft Edge',
        data: 'Thao tác lọc và xem đơn trên Edge',
        steps: '1. Chạy trên Edge.',
        expected: 'Mọi thao tác lọc và xem chi tiết phản hồi nhanh.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tương thích Edge'
      },
      {
        id: 'TC_ORD_15',
        summary: 'Xác minh hiển thị trên màn hình điện thoại (Responsive)',
        pre: 'Mobile 375x667',
        data: 'Responsive view',
        steps: '1. Xem trên điện thoại.',
        expected: 'Bảng có thể cuộn ngang nhẹ nhàng, modal chi tiết đơn vừa vặn màn hình điện thoại.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Responsive tốt'
      }
    ]
  },
  CUS: {
    code: 'Quản lý khách hàng (Customer Management)',
    name: 'Quản lý khách hàng',
    round1: { done: 11, bugs: 0, pending: 0, blocked: 0, total: 11 },
    round2: { done: 11, bugs: 0, pending: 0, blocked: 0, total: 11 },
    cases: [
      {
        id: 'TC_CUS_01',
        summary: 'Xác minh tìm khách hàng theo họ tên chính xác',
        pre: 'Trang /admin/users (tab Khách hàng)',
        data: 'Từ khóa: "Lê Phương Thảo"',
        steps: '1. Nhập tên vào ô tìm kiếm.\n2. Quan sát kết quả.',
        expected: 'Hiển thị chính xác dòng thông tin khách hàng Lê Phương Thảo kèm email, SĐT, ngày đăng ký.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tìm kiếm khách hàng chuẩn'
      },
      {
        id: 'TC_CUS_02',
        summary: 'Xác minh sửa thông tin khách hàng thành công',
        pre: 'Chọn 1 khách hàng',
        data: 'Sửa họ tên, cập nhật số điện thoại mới',
        steps: '1. Bấm nút Sửa.\n2. Nhập thông tin mới hợp lệ.\n3. Nhấn Lưu.',
        expected: 'Cập nhật thành công, dữ liệu mới hiển thị ngay lập tức.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Sửa khách hàng tốt'
      },
      {
        id: 'TC_CUS_03',
        summary: 'Xác minh thông báo lỗi khi sửa để trống Họ tên',
        pre: 'Modal sửa khách hàng',
        data: 'Họ tên: "" (xóa rỗng)',
        steps: '1. Xóa rỗng ô Họ tên.\n2. Nhấn Lưu.',
        expected: 'Báo lỗi: "Họ và tên khách hàng không được để trống". Chặn lưu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Validation tốt'
      },
      {
        id: 'TC_CUS_04',
        summary: 'Xác minh xóa khách hàng thành công khi khách chưa phát sinh đơn vé',
        pre: 'Khách hàng mới đăng ký, chưa có đơn hàng nào',
        data: 'Xóa tài khoản khách hàng',
        steps: '1. Bấm icon Xóa.\n2. Xác nhận popup cảnh báo.',
        expected: 'Tài khoản khách hàng bị xóa khỏi danh sách và DB.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Xóa khách hàng an toàn'
      },
      {
        id: 'TC_CUS_05',
        summary: 'Xác minh xử lý bảo vệ dữ liệu khi xóa khách hàng đã có đơn đặt vé',
        pre: 'Khách hàng đã có 3 đơn đặt vé trong hệ thống',
        data: 'Thử xóa khách hàng đã có đơn',
        steps: '1. Bấm Xóa khách hàng đã có đơn.\n2. Xác nhận.',
        expected: 'Hệ thống cảnh báo hoặc chuyển trạng thái sang Khóa/Vô hiệu hóa để bảo lưu lịch sử hóa đơn tài chính, không xóa cứng làm mất toàn vẹn dữ liệu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Bảo vệ toàn vẹn lịch sử đơn hàng'
      },
      {
        id: 'TC_CUS_06',
        summary: 'Xác minh chức năng Khóa tài khoản khách hàng (Lock Account)',
        pre: 'Khách hàng đang hoạt động (active)',
        data: 'Bấm nút "Khóa tài khoản"',
        steps: '1. Nhấp icon Ổ khóa tại dòng khách hàng.\n2. Xác nhận khóa.',
        expected: 'Trạng thái chuyển sang badge vàng "Tạm khóa" (locked). Khách hàng không thể đăng nhập được nữa.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Khóa tài khoản tức thì'
      },
      {
        id: 'TC_CUS_07',
        summary: 'Xác minh chức năng Mở khóa tài khoản khách hàng (Unlock Account)',
        pre: 'Khách hàng đang bị tạm khóa',
        data: 'Bấm nút "Mở khóa"',
        steps: '1. Nhấp icon Mở khóa.\n2. Xác nhận mở khóa.',
        expected: 'Trạng thái chuyển lại thành "Hoạt động" (active), khách hàng có thể đăng nhập bình thường.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Mở khóa thành công'
      },
      {
        id: 'TC_CUS_08',
        summary: 'Xác minh xem lịch sử các đơn đặt vé của khách hàng',
        pre: 'Khách hàng có 3 đơn hàng',
        data: 'Bấm "Xem lịch sử mua vé"',
        steps: '1. Mở xem chi tiết khách hàng.\n2. Kiểm tra danh sách các đơn vé liên quan.',
        expected: 'Liệt kê đầy đủ các đơn hàng do khách này thực hiện kèm ngày giờ và tổng chi tiêu tích lũy.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Lịch sử mua vé liên kết chuẩn'
      },
      {
        id: 'TC_CUS_09',
        summary: 'Xác minh giao diện quản lý khách hàng hiển thị đúng thiết kế',
        pre: 'Desktop',
        data: 'Trang /admin/users',
        steps: '1. Kiểm tra trực quan.',
        expected: 'Bố cục chuẩn mực, avatar khách hàng bo tròn hiển thị rõ nét.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'UI đẹp'
      },
      {
        id: 'TC_CUS_10',
        summary: 'Xác minh hoạt động trên Google Chrome',
        pre: 'Google Chrome',
        data: 'Quản trị khách hàng trên Chrome',
        steps: '1. Chạy trên Chrome.',
        expected: 'Hoạt động tốt.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tương thích Chrome'
      },
      {
        id: 'TC_CUS_11',
        summary: 'Xác minh hiển thị trên màn hình điện thoại (Responsive)',
        pre: 'Mobile 375x667',
        data: 'Responsive view',
        steps: '1. Xem trên mobile.',
        expected: 'Bảng cuộn ngang mượt, nút thao tác dễ bấm.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Mobile tối ưu'
      }
    ]
  },
  EMP: {
    code: 'Quản lý nhân viên (Employee & Staff Management)',
    name: 'Quản lý nhân viên',
    round1: { done: 14, bugs: 0, pending: 0, blocked: 0, total: 14 },
    round2: { done: 14, bugs: 0, pending: 0, blocked: 0, total: 14 },
    cases: [
      {
        id: 'TC_EMP_01',
        summary: 'Xác minh tìm nhân viên theo họ tên chính xác',
        pre: 'Trang /admin/users (tab Nhân viên)',
        data: 'Từ khóa: "Trần Minh Anh"',
        steps: '1. Nhập tên nhân viên vào ô tìm kiếm.\n2. Quan sát kết quả.',
        expected: 'Hiển thị chính xác nhân viên Trần Minh Anh kèm vai trò và quyền hạn được phân.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tìm kiếm nhân viên tốt'
      },
      {
        id: 'TC_EMP_02',
        summary: 'Xác minh thêm nhân viên mới thành công với dữ liệu hợp lệ',
        pre: 'Modal "Thêm nhân viên mới"',
        data: 'Họ tên: "Phạm Quốc Bảo", Email: "bao.pham@movix.vn", SĐT: "0968112233", Mật khẩu: "Staff@123", Vai trò: "staff"',
        steps: '1. Mở modal thêm nhân viên.\n2. Điền đầy đủ thông tin hợp lệ.\n3. Chọn phân quyền "Nhân viên rạp".\n4. Nhấn "Lưu nhân viên".',
        expected: 'Tạo thành công, thông báo "Thêm nhân viên mới thành công!", tài khoản mới có thể đăng nhập ngay vào hệ thống.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Thêm nhân viên thành công'
      },
      {
        id: 'TC_EMP_03',
        summary: 'Xác minh thông báo lỗi khi để trống toàn bộ trường khi thêm',
        pre: 'Modal thêm nhân viên',
        data: 'Tất cả: null',
        steps: '1. Bấm Lưu mà không nhập.',
        expected: 'Báo lỗi bắt buộc nhập Họ tên, Email, Số điện thoại và Mật khẩu khởi tạo.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Validation chuẩn'
      },
      {
        id: 'TC_EMP_04',
        summary: 'Xác minh thông báo lỗi khi Email nhân viên sai định dạng',
        pre: 'Modal thêm nhân viên',
        data: 'Email: "nhanvien@"',
        steps: '1. Nhập email sai định dạng.\n2. Nhấn Lưu.',
        expected: 'Báo lỗi: "Định dạng email nhân viên không hợp lệ".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Kiểm tra regex email'
      },
      {
        id: 'TC_EMP_05',
        summary: 'Xác minh Số điện thoại chứa chữ cái hoặc thiếu chữ số',
        pre: 'Modal thêm nhân viên',
        data: 'SĐT: "09ab12" hoặc "123"',
        steps: '1. Nhập SĐT không hợp lệ.\n2. Nhấn Lưu.',
        expected: 'Báo lỗi: "Số điện thoại phải bao gồm đúng 10 chữ số hợp lệ".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Kiểm tra regex phone'
      },
      {
        id: 'TC_EMP_06',
        summary: 'Xác minh thêm nhân viên bị trùng email đã tồn tại',
        pre: 'Email admin@movix.vn đã có trong hệ thống',
        data: 'Nhập Email: "admin@movix.vn"',
        steps: '1. Nhập email trùng với tài khoản đã có.\n2. Nhấn Lưu.',
        expected: 'Báo lỗi: "Email này đã được sử dụng bởi một tài khoản khác trong hệ thống".',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Chặn trùng email'
      },
      {
        id: 'TC_EMP_07',
        summary: 'Xác minh sửa thông tin nhân viên thành công',
        pre: 'Chọn 1 nhân viên',
        data: 'Cập nhật họ tên mới, số điện thoại mới',
        steps: '1. Bấm nút Sửa.\n2. Đổi thông tin.\n3. Nhấn Cập nhật.',
        expected: 'Cập nhật thành công, dữ liệu mới hiển thị ngay trong bảng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Sửa nhân viên tốt'
      },
      {
        id: 'TC_EMP_08',
        summary: 'Xác minh sửa nhân viên trùng email của bản ghi khác',
        pre: 'Có 2 nhân viên A (a@movix.vn) và B (b@movix.vn)',
        data: 'Sửa email của nhân viên B thành a@movix.vn',
        steps: '1. Sửa B, đổi email trùng A.\n2. Nhấn Lưu.',
        expected: 'Hệ thống phát hiện trùng email với tài khoản khác, báo lỗi và chặn lưu.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Kiểm tra unique email khi edit'
      },
      {
        id: 'TC_EMP_09',
        summary: 'Xác minh xóa nhân viên thành công',
        pre: 'Nhân viên thử nghiệm',
        data: 'Xóa nhân viên',
        steps: '1. Bấm icon Xóa.\n2. Xác nhận popup.',
        expected: 'Xóa tài khoản nhân viên khỏi hệ thống, tài khoản bị thu hồi quyền truy cập.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Xóa nhân viên an toàn'
      },
      {
        id: 'TC_EMP_10',
        summary: 'Xác minh phân quyền nhân viên: Chỉ thấy các chức năng được cấp quyền (RBAC)',
        pre: 'Đăng nhập tài khoản nhân viên (role: staff)',
        data: 'Kiểm tra giao diện Menu sau khi đăng nhập',
        steps: '1. Đăng nhập bằng tài khoản role staff.\n2. Quan sát thanh Sidebar Admin.',
        expected: 'Chỉ hiển thị các phân hệ được phân quyền thao tác hàng ngày (Quản lý Đơn đặt vé, Quản lý Suất chiếu, Soát vé), ẨN HOÀN TOÀN các menu: Quản lý Nhân viên, Cấu hình CSDL Supabase, Thống kê doanh thu cấp cao.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'RBAC Staff kiểm soát nghiêm ngặt'
      },
      {
        id: 'TC_EMP_11',
        summary: 'Xác minh nhân viên mới tạo đăng nhập được ngay vào hệ thống',
        pre: 'Vừa tạo tài khoản nhân viên bao.pham@movix.vn / Staff@123',
        data: 'Đăng nhập bằng tài khoản nhân viên mới',
        steps: '1. Mở trang /login.\n2. Điền thông tin nhân viên mới.\n3. Bấm Đăng nhập.',
        expected: 'Đăng nhập thành công, chuyển hướng vào màn hình làm việc nhân viên.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Kích hoạt tài khoản nhân viên chuẩn'
      },
      {
        id: 'TC_EMP_12',
        summary: 'Xác minh giao diện quản lý nhân viên hiển thị đúng thiết kế',
        pre: 'Desktop',
        data: 'Trang /admin/users',
        steps: '1. Kiểm tra trực quan.',
        expected: 'Giao diện đồng bộ, badge phân quyền Admin (đỏ) / Staff (tím) rõ ràng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'UI chuẩn mực'
      },
      {
        id: 'TC_EMP_13',
        summary: 'Xác minh hoạt động trên Mozilla Firefox',
        pre: 'Firefox',
        data: 'Quản trị nhân viên trên Firefox',
        steps: '1. Chạy trên Firefox.',
        expected: 'Hoạt động tốt.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Tương thích tốt'
      },
      {
        id: 'TC_EMP_14',
        summary: 'Xác minh hiển thị trên màn hình điện thoại (Responsive)',
        pre: 'Mobile 375x667',
        data: 'Responsive view',
        steps: '1. Kiểm tra trên mobile.',
        expected: 'Bảng cuộn ngang nhẹ nhàng, nút thêm nhân viên nổi bật ở trên cùng.',
        r1: 'Pass', bug: '', r2: 'Pass', tester: 'Nguyễn Hữu Thăng', date: '19/10/2026', notes: 'Mobile tốt'
      }
    ]
  }
};
