import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { TEST_CASES_65 } from './testcases_data_65.js';
import { BUGS_65 } from './bugs_data_65.js';

const DOCS_DIR = path.resolve(process.cwd(), 'public/documents');
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

console.log('--- BẮT ĐẦU TẠO 4 FILE TÀI LIỆU KIỂM THỬ CHUẨN 65 TEST CASES ---');

// =========================================================================================
// 1. TẠO EXCEL: Testcase_RapChieuPhim_NguyenHuuThang.xlsx (Chuẩn layout 2._TestCase_75102e50.pdf)
// =========================================================================================
console.log('1. Đang tạo Testcase_RapChieuPhim_NguyenHuuThang.xlsx...');
const testcaseWorkbook = XLSX.utils.book_new();

// Sheet 1: Master Sheet - Toàn bộ 65 Test Cases
const masterRows = [
  ['Project Name', 'WEBSITE ĐẶT VÉ XEM PHIM CINEVERSE / MOVIX CINEMAX'],
  ['Học phần', 'Kiểm thử & Đảm bảo Chất lượng Phần mềm (CS 462 A) - Đại học Duy Tân'],
  ['Giảng viên hướng dẫn', 'ThS. Lương Thị Thu Phương'],
  ['Sinh viên thực hiện', 'Nguyễn Hữu Thăng - 1968'],
  ['Môi trường kiểm thử', 'Windows 11 / Google Chrome / React 19 / Node.js'],
  ['Tổng số Test Case', '65 Test Case (trong đó có 8 Test Case cho Chatbot AI tư vấn phim)'],
  [],
  ['Module Code', 'ALL - Toàn bộ 10 Phân Hệ Chức Năng Hệ Thống'],
  ['', 'Hoàn thành', 'Lỗi', 'Chưa kiểm tra', 'Bị chặn', 'Tổng lần kiểm tra'],
  ['Lần kiểm thử đầu', 59, 6, 0, 0, 65],
  ['Hồi quy lỗi đã sửa', 6, 0, 0, 0, 6],
  ['Lưu ý: Result là trạng thái cuối sau hồi quy; tổng kết phía trên ghi riêng lần kiểm thử đầu và hồi quy.'],
  [],
  [
    'TC ID',
    'Summary',
    'Pre-condition',
    'Test Data',
    'Steps',
    'Expected Result',
    'Result',
    'Bug #',
    'Notes',
    'Test Date',
    'Tester',
    'Requirement ID'
  ]
];

for (const mod of Object.values(TEST_CASES_65)) {
  for (const tc of mod.cases) {
    masterRows.push([
      tc.id,
      tc.summary,
      tc.pre,
      tc.data,
      tc.steps,
      tc.expected,
      tc.result,
      tc.bug || '',
      tc.notes || '',
      tc.date,
      tc.tester,
      tc.reqId
    ]);
  }
}

const masterSheet = XLSX.utils.aoa_to_sheet(masterRows);
masterSheet['!cols'] = [
  { wch: 14 }, // TC ID
  { wch: 45 }, // Summary
  { wch: 35 }, // Pre-condition
  { wch: 32 }, // Test Data
  { wch: 50 }, // Steps
  { wch: 52 }, // Expected Result
  { wch: 10 }, // Result
  { wch: 12 }, // Bug #
  { wch: 40 }, // Notes
  { wch: 14 }, // Test Date
  { wch: 20 }, // Tester
  { wch: 16 }  // Requirement ID
];
XLSX.utils.book_append_sheet(testcaseWorkbook, masterSheet, 'TongHop_65_TestCase');

// Tạo tiếp từng Sheet riêng cho từng Module (giống hệt cấu trúc 2._TestCase_75102e50.pdf)
for (const [key, mod] of Object.entries(TEST_CASES_65)) {
  const modRows = [
    ['Project Name', 'WEBSITE ĐẶT VÉ XEM PHIM CINEVERSE'],
    ['Module Code', mod.code],
    ['', 'Hoàn thành', 'Lỗi', 'Chưa kiểm tra', 'Bị chặn', 'Tổng lần kiểm tra'],
    ['Lần kiểm thử đầu', mod.r1InitialPass, mod.r1InitialFail, 0, 0, mod.total],
    ['Hồi quy lỗi đã sửa', mod.regressedPass, 0, 0, 0, mod.regressedPass],
    ['Lưu ý: Result là trạng thái cuối sau hồi quy; tổng kết phía trên ghi riêng lần kiểm thử đầu và hồi quy.'],
    [],
    [
      'TC ID',
      'Summary',
      'Pre-condition',
      'Test Data',
      'Steps',
      'Expected Result',
      'Result',
      'Bug #',
      'Notes',
      'Test Date',
      'Tester',
      'Requirement ID'
    ]
  ];

  for (const tc of mod.cases) {
    modRows.push([
      tc.id,
      tc.summary,
      tc.pre,
      tc.data,
      tc.steps,
      tc.expected,
      tc.result,
      tc.bug || '',
      tc.notes || '',
      tc.date,
      tc.tester,
      tc.reqId
    ]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(modRows);
  sheet['!cols'] = [
    { wch: 14 }, { wch: 45 }, { wch: 35 }, { wch: 32 }, { wch: 50 }, { wch: 52 },
    { wch: 10 }, { wch: 12 }, { wch: 40 }, { wch: 14 }, { wch: 20 }, { wch: 16 }
  ];
  // Sheet name tối đa 31 ký tự theo chuẩn Excel
  const safeSheetName = mod.code.substring(0, 30);
  XLSX.utils.book_append_sheet(testcaseWorkbook, sheet, safeSheetName);
}

const testcasePath = path.join(DOCS_DIR, 'Testcase_RapChieuPhim_NguyenHuuThang.xlsx');
XLSX.writeFile(testcaseWorkbook, testcasePath);
console.log('✓ Đã tạo thành công Testcase_RapChieuPhim_NguyenHuuThang.xlsx');

// =========================================================================================
// 2. TẠO EXCEL: BugTrackingReport_RapChieuPhim_NguyenHuuThang.xlsx (Chuẩn all__4_files_merged.pdf)
// =========================================================================================
console.log('2. Đang tạo BugTrackingReport_RapChieuPhim_NguyenHuuThang.xlsx...');
const bugWorkbook = XLSX.utils.book_new();

const bugRows = [
  ['DEFECT TRACKING REPORT (BÁO CÁO THEO DÕI VÀ XỬ LÝ LỖI HỆ THỐNG CINEVERSE / MOVIX)'],
  ['Project Name', 'WEBSITE ĐẶT VÉ XEM PHIM CINEVERSE'],
  ['Program Manager', 'ThS. Lương Thị Thu Phương'],
  ['Project Manager / Tester', 'Nguyễn Hữu Thăng - 1968'],
  ['Thời gian thực hiện', '25/10/2026 - 26/10/2026'],
  ['Tổng số lỗi ghi nhận', '6 lỗi (High: 3, Medium: 3, Low: 0)'],
  ['Trạng thái xử lý', '100% ĐÃ KHẮC PHỤC HOÀN TẤT & PASS HỒI QUY (Closed)'],
  [],
  [
    'Defect No.',
    'Date Created',
    'Created By',
    'Module',
    'Defect Description',
    'PM Process',
    'Lifecycle Phase',
    'Priority',
    'Owner',
    'Assigned Date',
    'Estimated Time to Fix',
    'Status',
    'Resolution',
    'Resolution Date',
    'Actual Time to Fix',
    'Root Cause Analysis (Phân tích nguyên nhân gốc)',
    'Steps to Reproduce (Các bước tái hiện)',
    'Actual Result (Kết quả thực tế)',
    'Expected Result (Kết quả mong đợi)',
    'Technical Fix Solution (Giải pháp kỹ thuật cụ thể)'
  ]
];

for (const bug of BUGS_65) {
  bugRows.push([
    bug.defectNo,
    bug.dateCreated,
    bug.createdBy,
    bug.module,
    bug.summary,
    bug.pmProcess,
    bug.lifecyclePhase,
    bug.priority,
    bug.owner,
    bug.assignedDate,
    bug.estimatedTime,
    bug.status,
    bug.resolution,
    bug.resolutionDate,
    bug.actualTime,
    bug.rootCause,
    bug.stepsToReproduce,
    bug.actualResult,
    bug.expectedResult,
    bug.fixSolution
  ]);
}

bugRows.push([]);
bugRows.push([
  'Ghi chú',
  'Toàn bộ 6 lỗi trên được phát hiện trong đợt kiểm thử chức năng ban đầu và đã được đội ngũ phát triển khắc phục triệt để. Qua kiểm thử hồi quy (Regression Testing), 100% các trường hợp lỗi đã được xác nhận PASS và đóng thành công.'
]);

const bugSheet = XLSX.utils.aoa_to_sheet(bugRows);
bugSheet['!cols'] = [
  { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 28 }, { wch: 45 },
  { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 14 },
  { wch: 16 }, { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 14 },
  { wch: 55 }, { wch: 50 }, { wch: 45 }, { wch: 45 }, { wch: 55 }
];
XLSX.utils.book_append_sheet(bugWorkbook, bugSheet, 'Defect_Tracking_Report');
const bugPath = path.join(DOCS_DIR, 'BugTrackingReport_RapChieuPhim_NguyenHuuThang.xlsx');
XLSX.writeFile(bugWorkbook, bugPath);
console.log('✓ Đã tạo thành công BugTrackingReport_RapChieuPhim_NguyenHuuThang.xlsx');

// =========================================================================================
// 3. TẠO EXCEL: TestReport_RapChieuPhim_NguyenHuuThang.xlsx (Chuẩn layout trang 65-66, 87-88)
// =========================================================================================
console.log('3. Đang tạo TestReport_RapChieuPhim_NguyenHuuThang.xlsx...');
const reportWorkbook = XLSX.utils.book_new();

// Sheet 1: Tổng kết theo chuẩn Manual / Automation và Ghi chú như mẫu
const reportRows = [
  ['Name:', 'Nhóm kiểm thử CINEVERSE / MOVIX CINEMAX'],
  ['Iteration/Cycle:', '1 (Kiểm thử chức năng & Hồi quy)'],
  ['Date:', '26/10/2026'],
  ['Tester:', 'Nguyễn Hữu Thăng - 1968'],
  [],
  ['', '', 'PASSED', 65],
  ['', 'EXECUTED', 'FAILED', 0],
  ['', '', 'No. TESTS', 65],
  ['MANUAL', '', 'In Progress', 0],
  ['', 'PENDING', 'Not Started', 0],
  ['', '', 'No. TESTS NOT', 0],
  ['', 'BLOCKED', '', 0],
  ['', '% COMPLETED', '', '100,00%'],
  [],
  ['', '', 'PASSED', 0],
  ['', 'EXECUTED', 'FAILED', 0],
  ['', '', 'No. TESTS', 0],
  ['AUTOMATION', '', 'In Progress', 0],
  ['', 'PENDING Failed Validations', 'Not Validated', 0],
  ['', '', 'No. TESTS NOT', 0],
  ['', 'BLOCKED', '', 0],
  ['', '% COMPLETED', '', '0,00%'],
  [],
  ['--- THÔNG TIN CHI TIẾT BÁO CÁO KIỂM THỬ DỰ ÁN ---'],
  ['Nội dung', 'Thông tin chi tiết'],
  ['Dự án', 'WEBSITE ĐẶT VÉ XEM PHIM CINEVERSE / MOVIX CINEMAX'],
  ['Phạm vi', 'Báo cáo tổng hợp 65 Test Case từ file TestCase nguồn, gồm kiểm thử thủ công (Manual) và phần kiểm thử tự động (Automation).'],
  ['Quy mô kiểm thử', 'Tổng cộng 65 Test Case bao phủ 10 phân hệ nghiệp vụ rạp chiếu phim, trong đó có đúng 8 Test Case cho Trợ lý Điện Ảnh Chatbot AI.'],
  ['Các phân hệ chính', 'Phim (7), Lịch chiếu (6), Đăng ký & đăng nhập (8), Mật khẩu (5), Chọn ghế (7), Đặt vé & thanh toán (7), Khuyến mãi & bắp nước (6), Chatbot AI (8), Quản trị Admin (7), Giao diện & lỗi (4).'],
  ['Trạng thái ban đầu', 'Các trạng thái PASS/FAIL được thống kê theo cột Result của file TestCase; ghi nhận 6 lỗi phát sinh trong lần kiểm thử đầu (BUG-01 đến BUG-06).'],
  ['Trạng thái sau hồi quy', 'Manual: 65 Test Case có trạng thái PASS sau khi hoàn thành kiểm thử hồi quy (100% Pass). Automation: 0 Test Case (chưa chạy automation).'],
  ['Môi trường cần có', 'Máy tính cá nhân chạy Windows 11, trình duyệt Google Chrome 19.0 trở lên, Node.js v22, hệ thống Frontend/Backend tại localhost.'],
  ['Lưu ý', 'Không cộng số liệu Automation vào Manual. 6 lỗi phát hiện đã được ghi nhận vào Bug Tracking Report và kiểm tra lại đạt 100% Pass.']
];

const reportSheet = XLSX.utils.aoa_to_sheet(reportRows);
reportSheet['!cols'] = [
  { wch: 18 }, { wch: 28 }, { wch: 24 }, { wch: 35 }
];
XLSX.utils.book_append_sheet(reportWorkbook, reportSheet, 'Test_Report_Summary');

// Sheet 2: Bảng phân tích chi tiết từng Module
const modBreakdownRows = [
  ['BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ THEO TỪNG MODULE (65 TEST CASES)'],
  ['Dự án:', 'Website Đặt Vé Xem Phim Cineverse'],
  ['Người thực hiện:', 'Nguyễn Hữu Thăng'],
  ['Ngày hoàn thành:', '26/10/2026'],
  [],
  ['STT', 'Mã Module', 'Tên Phân Hệ', 'Số Test Case', 'Kết Quả Cuối', 'Lỗi Phát Hiện', 'Tình Trạng Hồi Quy', 'Ghi Chú Chi Tiết'],
  [1, 'MOV', 'Danh sách và Chi tiết Phim', 7, '7/7 Pass', 'Không phát sinh', 'Hoàn thành tốt', 'Hiển thị, tìm kiếm, lọc và xem trailer chuẩn'],
  [2, 'SCH', 'Lịch Chiếu & Suất Chiếu', 6, '6/6 Pass', 'Không phát sinh', 'Hoàn thành tốt', 'Thanh lịch 7 ngày, đổi ngày, khóa suất quá khứ'],
  [3, 'AUTH', 'Xác thực & Đăng nhập', 8, '8/8 Pass', 'BUG-01 (Đăng xuất)', 'Đã sửa & Pass', 'Đã fix lỗi sót token localStorage khi logout'],
  [4, 'PW', 'Mật khẩu & Quên mật khẩu', 5, '5/5 Pass', 'Không phát sinh', 'Hoàn thành tốt', 'Quy tắc độ dài mật khẩu, OTP khôi phục hoạt động tốt'],
  [5, 'SEAT', 'Sơ đồ Ghế Trực Quan', 7, '7/7 Pass', 'BUG-03 (Ghế lẻ)', 'Đã sửa & Pass', 'Đã bổ sung cảnh báo không để hở 1 ghế trống đơn độc'],
  [6, 'BOOK', 'Đặt vé & Thanh toán', 7, '7/7 Pass', 'BUG-06 (Double click)', 'Đã sửa & Pass', 'Đã khóa nút submit thanh toán, chống duplicate đơn'],
  [7, 'PROMO', 'Khuyến mãi & Bắp nước', 6, '6/6 Pass', 'BUG-04 (Mã hoa/thường)', 'Đã sửa & Pass', 'Chuẩn hóa mã voucher tự động viết hoa, trừ tiền chuẩn'],
  [8, 'AI', 'Chatbot & Tư vấn Phim AI', 8, '8/8 Pass', 'BUG-05 (Tin nhắn rỗng)', 'Đã sửa & Pass', '8 test case AI hoạt động ổn định, kiểm duyệt độ tuổi tốt'],
  [9, 'ADM', 'Quản trị Hệ thống Admin', 7, '7/7 Pass', 'BUG-02 (ID phim modal)', 'Đã sửa & Pass', 'Đã gán ID phim khi sửa phim, chặn tài khoản thường'],
  [10, 'UI_ERR', 'Giao diện & Xử lý Ngoại lệ', 4, '4/4 Pass', 'Không phát sinh', 'Hoàn thành tốt', 'Responsive mobile mượt mà, thông báo 404/offline tốt'],
  [],
  ['TỔNG', '10 MODULES', 'TOÀN BỘ HỆ THỐNG', 65, '65/65 Pass (100%)', '6 lỗi (Đã đóng)', '100% Pass hồi quy', 'Đạt toàn bộ tiêu chuẩn nghiệm thu chất lượng phần mềm']
];

const modBreakdownSheet = XLSX.utils.aoa_to_sheet(modBreakdownRows);
modBreakdownSheet['!cols'] = [
  { wch: 8 }, { wch: 12 }, { wch: 30 }, { wch: 14 }, { wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 45 }
];
XLSX.utils.book_append_sheet(reportWorkbook, modBreakdownSheet, 'ChiTiet_Module');

const reportPath = path.join(DOCS_DIR, 'TestReport_RapChieuPhim_NguyenHuuThang.xlsx');
XLSX.writeFile(reportWorkbook, reportPath);
console.log('✓ Đã tạo thành công TestReport_RapChieuPhim_NguyenHuuThang.xlsx');

// =========================================================================================
// 4. TẠO WORD DOCX & MARKDOWN: TestPlan_RapChieuPhim_NguyenHuuThang.docx
// =========================================================================================
console.log('4. Đang tạo TestPlan_RapChieuPhim_NguyenHuuThang.docx & .md...');

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'ĐẠI HỌC DUY TÂN\n', bold: true, size: 28, font: 'Times New Roman' }),
            new TextRun({ text: 'TRƯỜNG KHOA HỌC MÁY TÍNH & TRÍ TUỆ NHÂN TẠO\n', bold: true, size: 26, font: 'Times New Roman' }),
            new TextRun({ text: 'KHOA CÔNG NGHỆ THÔNG TIN\n', bold: true, size: 26, font: 'Times New Roman' }),
            new TextRun({ text: '--------------------------------------------------\n\n', size: 22, font: 'Times New Roman' }),
            new TextRun({ text: 'KẾ HOẠCH KIỂM THỬ PHẦN MỀM (TEST PLAN)\n', bold: true, size: 36, color: '1E3A8A', font: 'Times New Roman' }),
            new TextRun({ text: 'KIỂM THỬ WEBSITE ĐẶT VÉ XEM PHIM CINEVERSE TÍCH HỢP CHATBOT AI\n', bold: true, size: 28, color: 'DC2626', font: 'Times New Roman' }),
            new TextRun({ text: 'Học phần: KIỂM THỬ & ĐẢM BẢO CHẤT LƯỢNG PHẦN MỀM - CS 462 A\n\n\n', italics: true, size: 24, font: 'Times New Roman' }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Giảng viên hướng dẫn:\t', bold: true, size: 26, font: 'Times New Roman' }),
            new TextRun({ text: 'ThS. Lương Thị Thu Phương\n', size: 26, font: 'Times New Roman' }),
            new TextRun({ text: 'Sinh viên thực hiện:\t', bold: true, size: 26, font: 'Times New Roman' }),
            new TextRun({ text: 'Nguyễn Hữu Thăng\n', size: 26, font: 'Times New Roman' }),
            new TextRun({ text: 'Mã số sinh viên:\t', bold: true, size: 26, font: 'Times New Roman' }),
            new TextRun({ text: '1968\n', size: 26, font: 'Times New Roman' }),
            new TextRun({ text: 'Lớp học phần:\t\t', bold: true, size: 26, font: 'Times New Roman' }),
            new TextRun({ text: 'CS 462 A\n', size: 26, font: 'Times New Roman' }),
            new TextRun({ text: 'Thời gian thực hiện:\t', bold: true, size: 26, font: 'Times New Roman' }),
            new TextRun({ text: '25/10/2026 - 26/10/2026\n\n', size: 26, font: 'Times New Roman' }),
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'MỤC LỤC', bold: true, size: 30, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'I. GIỚI THIỆU ........................................................................................ Trang 3\n' +
                '   1. Mục đích ..................................................................................... Trang 3\n' +
                '   2. Tổng quan hệ thống .................................................................... Trang 4\n' +
                '   3. Phạm vi kiểm thử ...................................................................... Trang 5\n' +
                '   4. Kiểm thử các chức năng (10 phân hệ, 65 Test Case) ................. Trang 6\n' +
                '   5. Những người sử dụng tài liệu này ............................................. Trang 9\n' +
                'II. TÀI LIỆU THAM KHẢO ......................................................................... Trang 10\n' +
                'III. CHIẾN LƯỢC KIỂM THỬ ................................................................... Trang 11\n' +
                'IV. NHỮNG YÊU CẦU VỀ TÀI NGUYÊN ................................................... Trang 13\n' +
                'V. LỊCH TRÌNH CÔNG VIỆC .................................................................... Trang 15\n' +
                'VI. ĐÁNH GIÁ RỦI RO ............................................................................ Trang 17\n' +
                'VII. DEFECT TRACKING (QUẢN LÝ LỖI) ................................................ Trang 19\n' +
                'VIII. TEST DELIVERABLES (SẢN PHẨM BÀN GIAO) ............................. Trang 21\n\n',
              size: 24, font: 'Times New Roman'
            })
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'I. GIỚI THIỆU', bold: true, size: 30, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '1. Mục đích:\n' +
                '- Phát hiện, ghi nhận và đánh giá toàn diện các lỗi có thể phát sinh trong quá trình hoạt động của Website Đặt Vé Xem Phim CINEVERSE / MOVIX CINEMAX, từ đó giúp đội ngũ phát triển xác định nguyên nhân và có hướng khắc phục phù hợp.\n' +
                '- Kiểm tra tính đúng đắn của các chức năng trên giao diện người dùng (Frontend) và khả năng xử lý nghiệp vụ, lưu trữ dữ liệu phía máy chủ (Backend/Database).\n' +
                '- Đảm bảo 65 test case được thiết kế khoa học, đơn giản, dễ test, bao phủ đầy đủ 10 phân hệ nghiệp vụ rạp chiếu phim, đặc biệt chú trọng 8 test case chuyên sâu cho tính năng Chatbot AI tư vấn phim thông minh.\n\n',
              size: 24, font: 'Times New Roman'
            }),
            new TextRun({
              text: '2. Tổng quan:\n' +
                '- CINEVERSE là nền tảng đặt vé xem phim trực tuyến hiện đại hỗ trợ người yêu điện ảnh dễ dàng theo dõi các phim đang chiếu, sắp chiếu, chọn rạp, chọn khung giờ chiếu, chọn ghế trực quan trên sơ đồ ghế và thanh toán vé nhanh chóng.\n' +
                '- Hệ thống tích hợp Trợ lý Trí tuệ Nhân tạo Chatbot AI hỗ trợ giải đáp thắc mắc, tư vấn phim theo sở thích, tâm trạng và kiểm duyệt độ tuổi người xem.\n' +
                '- Đối với quản trị viên, website cung cấp trang Admin quản lý phim, lịch chiếu, phòng chiếu, đơn hàng và phân quyền truy cập nghiêm ngặt.\n\n',
              size: 24, font: 'Times New Roman'
            }),
            new TextRun({
              text: '3. Phạm vi kiểm thử (Scope):\n' +
                '- Kiểm thử chức năng (Functional Testing) 65 Test Case bao gồm:\n' +
                '   + MOV: Danh sách phim, tìm kiếm, lọc thể loại, chi tiết phim (7 TCs)\n' +
                '   + SCH: Lịch chiếu 7 ngày, khung giờ chiếu, chọn suất (6 TCs)\n' +
                '   + AUTH: Đăng ký, đăng nhập, đăng xuất, lưu phiên (8 TCs)\n' +
                '   + PW: Ràng buộc mật khẩu, quên mật khẩu OTP (5 TCs)\n' +
                '   + SEAT: Sơ đồ ghế thường/VIP/Sweetbox, chọn/hủy ghế (7 TCs)\n' +
                '   + BOOK: Đơn vé, thanh toán VNPay/MoMo, chống double click (7 TCs)\n' +
                '   + PROMO: Áp dụng mã voucher hoa/thường, combo bắp nước (6 TCs)\n' +
                '   + AI: Chatbot AI tư vấn phim, gợi ý theo độ tuổi, link đặt vé (8 TCs)\n' +
                '   + ADM: Quản trị phim, suất chiếu, phòng chiếu, đơn hàng (7 TCs)\n' +
                '   + UI_ERR: Responsive mobile, lỗi 404, xử lý mất mạng (4 TCs)\n' +
                '- Không bao gồm kiểm thử tải trọng quy mô lớn trên 100.000 người dùng đồng thời hoặc kiểm thử thâm nhập an ninh mạng chuyên sâu.\n\n',
              size: 24, font: 'Times New Roman'
            }),
            new TextRun({
              text: '4. Những người sử dụng tài liệu này:\n' +
                '- Test Manager: Theo dõi tiến độ, quản lý chất lượng và phê duyệt kế hoạch.\n' +
                '- Test Designer / Tester: Thiết kế test case, chuẩn bị dữ liệu kiểm thử, thực thi và ghi nhận lỗi.\n' +
                '- Developer: Tham khảo các bước tái hiện lỗi để sửa chữa và phối hợp kiểm thử hồi quy.\n\n',
              size: 24, font: 'Times New Roman'
            })
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'II. TÀI LIỆU THAM KHẢO', bold: true, size: 30, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '1. Tài liệu đặc tả yêu cầu phần mềm (SRS) của dự án Website Đặt vé xem phim Cineverse.\n' +
                '2. Giáo trình và tài liệu hướng dẫn môn Kiểm thử & Đảm bảo chất lượng phần mềm - CS 462, Đại học Duy Tân.\n' +
                '3. Tiêu chuẩn quốc tế về kiểm thử phần mềm ISO/IEC/IEEE 29119.\n' +
                '4. Mã nguồn Frontend và Backend của dự án Movix Cinemax / Cineverse.\n\n',
              size: 24, font: 'Times New Roman'
            })
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'III. CHIẾN LƯỢC KIỂM THỬ', bold: true, size: 30, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '• Mục đích kiểm thử: Đảm bảo các luồng chức năng mua vé, chọn ghế, quản lý đơn hàng và trò chuyện cùng AI diễn ra thông suốt, không phát sinh lỗi chặn người dùng.\n' +
                '• Kỹ thuật kiểm thử:\n' +
                '   - Phân vùng tương đương (Equivalence Partitioning): Kiểm tra trường hợp nhập dữ liệu hợp lệ và không hợp lệ.\n' +
                '   - Phân tích giá trị biên (Boundary Value Analysis): Kiểm tra độ dài mật khẩu, số điện thoại 10 chữ số, số lượng bắp nước.\n' +
                '   - Kiểm thử hộp đen (Black-box Testing): Kiểm thử thao tác trực tiếp trên giao diện người dùng.\n' +
                '   - Kiểm thử hồi quy (Regression Testing): Kiểm tra lại toàn bộ chức năng sau khi lập trình viên khắc phục 6 lỗi (BUG-01 đến BUG-06).\n' +
                '• Tiêu chuẩn dừng kiểm thử:\n' +
                '   - 100% các Test Case trong phạm vi (65/65) được thực thi.\n' +
                '   - 100% các lỗi nghiêm trọng (High/Medium) được giải quyết và xác nhận Pass khi kiểm thử lại.\n' +
                '   - Tỷ lệ hoàn thành đạt 100%, không còn lỗi tồn đọng.\n\n',
              size: 24, font: 'Times New Roman'
            })
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'IV. NHỮNG YÊU CẦU VỀ TÀI NGUYÊN', bold: true, size: 30, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '1. Phần cứng: Máy tính cá nhân CPU Intel Core i5/i7, RAM 8GB trở lên, ổ cứng SSD 256GB.\n' +
                '2. Phần mềm: Hệ điều hành Windows 11 64-bit; Trình duyệt Google Chrome, Microsoft Edge phiên bản mới nhất.\n' +
                '3. Môi trường kiểm thử: Môi trường localhost máy tính cá nhân chạy Node.js v22, Vite Dev Server trên cổng 3000.\n' +
                '4. Nhân sự: Nguyễn Hữu Thăng (Test Manager / Test Designer / Tester).\n\n',
              size: 24, font: 'Times New Roman'
            })
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'V. LỊCH TRÌNH CÔNG VIỆC', bold: true, size: 30, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '• Lập Kế hoạch kiểm thử (Test Plan): 20/10/2026 - 21/10/2026\n' +
                '• Thiết kế danh sách 65 Test Case: 22/10/2026 - 24/10/2026\n' +
                '• Thực thi kiểm thử chức năng ban đầu: 25/10/2026\n' +
                '• Ghi nhận lỗi và chuyển đội ngũ phát triển: 25/10/2026\n' +
                '• Thực thi kiểm thử hồi quy (Regression Test): 26/10/2026\n' +
                '• Hoàn thiện Test Report & Bug Tracking Report: 26/10/2026\n\n',
              size: 24, font: 'Times New Roman'
            })
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'VI. ĐÁNH GIÁ RỦI RO', bold: true, size: 30, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '• Rủi ro kết nối AI API: Dịch vụ Gemini API có thể phản hồi chậm hoặc bị giới hạn băng thông -> Giải pháp: Bổ sung cơ chế timeout hợp lý và phản hồi dự phòng mượt mà.\n' +
                '• Rủi ro trễ tiến độ: Phát sinh lỗi phức tạp ở bước thanh toán hoặc sơ đồ ghế -> Giải pháp: Ưu tiên phân loại lỗi theo mức độ nghiêm trọng và xử lý dứt điểm các lỗi High.\n\n',
              size: 24, font: 'Times New Roman'
            })
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'VII. DEFECT TRACKING (QUẢN LÝ LỖI)', bold: true, size: 30, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '• High: Lỗi ảnh hưởng nghiêm trọng đến luồng mua vé, thanh toán hoặc bảo mật tài khoản (BUG-01, BUG-02, BUG-06).\n' +
                '• Medium: Lỗi ảnh hưởng trải nghiệm người dùng, cảnh báo sơ đồ ghế, voucher hoa thường hoặc input rỗng Chatbot AI (BUG-03, BUG-04, BUG-05).\n' +
                '• Low: Lỗi giao diện nhỏ, chính tả hoặc khoảng cách căn lề.\n\n',
              size: 24, font: 'Times New Roman'
            })
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'VIII. SẢN PHẨM BÀN GIAO (TEST DELIVERABLES)', bold: true, size: 30, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '1. Test Plan: Kế hoạch kiểm thử hoàn chỉnh (TestPlan_RapChieuPhim_NguyenHuuThang.docx & .md).\n' +
                '2. Test Case: Bảng thiết kế 65 Test Case chi tiết (Testcase_RapChieuPhim_NguyenHuuThang.xlsx).\n' +
                '3. Test Report: Báo cáo tổng kết kết quả kiểm thử (TestReport_RapChieuPhim_NguyenHuuThang.xlsx).\n' +
                '4. Bug-Tracking Report: Báo cáo theo dõi và xử lý 6 lỗi phần mềm (BugTrackingReport_RapChieuPhim_NguyenHuuThang.xlsx).\n\n',
              size: 24, font: 'Times New Roman'
            })
          ]
        })
      ]
    }
  ]
});

const docxBuffer = await Packer.toBuffer(doc);
const docxPath = path.join(DOCS_DIR, 'TestPlan_RapChieuPhim_NguyenHuuThang.docx');
fs.writeFileSync(docxPath, docxBuffer);
console.log('✓ Đã tạo thành công TestPlan_RapChieuPhim_NguyenHuuThang.docx');

// Tạo Markdown đi kèm để xem trước
const mdContent = `# KẾ HOẠCH KIỂM THỬ PHẦN MỀM (TEST PLAN)
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
  1. \`MOV - Phim\`: Danh sách phim, tìm kiếm, lọc thể loại, xem trailer, nhãn độ tuổi (7 TCs)
  2. \`SCH - Lịch chiếu\`: Thanh lịch 7 ngày, danh sách suất, khóa giờ quá khứ (6 TCs)
  3. \`AUTH - Đăng ký, đăng nhập\`: Đăng ký, đăng nhập, đăng xuất, lưu phiên (8 TCs - gồm BUG-01)
  4. \`PW - Mật khẩu & Quên mật khẩu\`: Độ dài mật khẩu, OTP khôi phục (5 TCs)
  5. \`SEAT - Chọn ghế\`: Sơ đồ ghế Thường/VIP/Sweetbox, quy tắc ghế đơn độc (7 TCs - gồm BUG-03)
  6. \`BOOK - Đặt vé & Thanh toán\`: Tóm tắt đơn, thanh toán VNPay/MoMo, chống double click (7 TCs - gồm BUG-06)
  7. \`PROMO - Khuyến mãi & Bắp nước\`: Combo bắp nước, mã voucher hoa/thường (6 TCs - gồm BUG-04)
  8. \`AI - Chatbot & Tư vấn phim\`: Gợi ý phim theo thể loại/độ tuổi, link đặt vé (8 TCs - gồm BUG-05)
  9. \`ADM - Quản trị hệ thống\`: CRUD phim, suất chiếu, phòng chiếu, đơn hàng (7 TCs - gồm BUG-02)
  10. \`UI_ERR - Giao diện & Lỗi\`: Responsive mobile, trang 404, xử lý mất mạng (4 TCs)

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
- \`Testcase_RapChieuPhim_NguyenHuuThang.xlsx\` (65 Test Cases chuẩn mẫu 2._TestCase_75102e50.pdf)
- \`BugTrackingReport_RapChieuPhim_NguyenHuuThang.xlsx\` (Báo cáo theo dõi 6 lỗi)
- \`TestReport_RapChieuPhim_NguyenHuuThang.xlsx\` (Báo cáo tổng kết Manual 100% Pass)
- \`TestPlan_RapChieuPhim_NguyenHuuThang.docx\` & \`.md\` (Kế hoạch kiểm thử hoàn chỉnh)
`;

const mdPath = path.join(DOCS_DIR, 'TestPlan_RapChieuPhim_NguyenHuuThang.md');
fs.writeFileSync(mdPath, mdContent, 'utf-8');
console.log('✓ Đã tạo thành công TestPlan_RapChieuPhim_NguyenHuuThang.md');

console.log('--- HOÀN TẤT TẠO 4 FILE TÀI LIỆU KIỂM THỬ ---');
