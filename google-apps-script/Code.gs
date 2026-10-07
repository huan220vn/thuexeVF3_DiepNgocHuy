/**
 * ============================================================================
 *  VF3 Rental — Nhận đơn đặt xe từ website và ghi vào Google Sheet
 * ============================================================================
 *
 *  CÁCH DÙNG (5 phút):
 *  1. Tạo Google Sheet mới:  https://sheet.new
 *  2. Đổi tên tab (sheet) thành:  Bookings
 *     → Hoặc để tên khác rồi sửa hằng số SHEET_NAME bên dưới.
 *  3. Menu  Tiện ích mở rộng (Extensions) →  Apps Script
 *  4. Xoá hết code mẫu, dán toàn bộ file này vào, bấm Lưu (Ctrl+S)
 *  5. Bấm  Triển khai (Deploy) →  Tuỳ chọn triển khai mới (New deployment)
 *        - Chọn loại:      Ứng dụng web (Web app)
 *        - Thực thi dưới dạng (Execute as):  Tôi (Me)
 *        - Ai có quyền truy cập (Who has access):  Bất kỳ ai (Anyone)
 *     → Bấm Triển khai, cấp quyền khi Google hỏi.
 *  6. Copy "URL ứng dụng web" (dạng https://script.google.com/macros/s/AKfy.../exec)
 *  7. Dán URL đó vào  assets/js/config.js  →  API_URL: '...'
 *
 *  XONG. Mỗi đơn đặt xe sẽ tự động thành 1 dòng mới trong Sheet.
 * ============================================================================
 */

/* ------------------------- CẤU HÌNH ------------------------- */
var SHEET_NAME = 'Bookings';       // tên tab chứa đơn
var TIMEZONE   = 'Asia/Ho_Chi_Minh';
var NOTIFY_EMAIL = '';             // ví dụ 'huan220vn@gmail.com' — để trống nếu không muốn nhận mail

/* Thứ tự cột ghi vào Sheet (khớp với header bên dưới) */
var HEADERS = [
  'Thời gian gửi',   // 0
  'Họ tên',          // 1
  'Số điện thoại',   // 2
  'Email',           // 3
  'Loại xe',         // 4
  'Hình thức',       // 5
  'Ngày nhận',       // 6
  'Giờ nhận',        // 7
  'Ngày trả',        // 8
  'Giờ trả',         // 9
  'Thời lượng',      // 10
  'Địa điểm nhận',   // 11
  'Tạm tính',        // 12
  'Ghi chú',         // 13
  'Trạng thái',      // 14  ← bạn tự cập nhật: Mới / Đã gọi / Đã xác nhận / Huỷ
  'Nguồn'            // 15
];


/* ------------------------- ENTRY POINTS ------------------------- */

/**
 * Nhận POST từ website.
 * LƯU Ý: website KHÔNG set Content-Type để tránh CORS preflight.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Khoá để nhiều khách bấm cùng lúc không ghi đè nhau
    lock.waitLock(20000);

    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var d = JSON.parse(raw);

    // --- Chống spam cơ bản ---
    if (d.website) return jsonOut({ ok: true, note: 'ignored' });        // bẫy honeypot
    var sdtClean = String(d.sdt || '').replace(/[\s.\-()]/g, '');
    if (!/^(0|\+84)\d{9}$/.test(sdtClean)) {
      return jsonOut({ ok: false, error: 'Số điện thoại không hợp lệ' });
    }
    if (!d.hoTen || String(d.hoTen).trim().length < 2) {
      return jsonOut({ ok: false, error: 'Thiếu họ tên' });
    }
    // Chặn gửi trùng: cùng SĐT + cùng ngày nhận trong 2 phút
    if (isDuplicate(sdtClean, d.ngayNhan)) {
      return jsonOut({ ok: true, note: 'duplicate' });
    }

    // --- Ghi vào Sheet ---
    var sh = getSheet();
    sh.appendRow([
      Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy HH:mm:ss'),
      clean(d.hoTen),
      clean(sdtClean),
      clean(d.email),
      clean(d.loaiXe || 'VinFast VF3'),
      clean(d.hinhThuc),
      clean(d.ngayNhan),
      clean(d.gioNhan),
      clean(d.ngayTra),
      clean(d.gioTra),
      clean(d.thoiLuong),
      clean(d.diaDiem),
      Number(d.tamTinh) || 0,
      clean(d.ghiChu),
      'Mới',
      'Website'
    ]);

    // --- Email thông báo (tuỳ chọn) ---
    if (NOTIFY_EMAIL) {
      try {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          subject: '[VF3 Rental] Đơn mới — ' + clean(d.hoTen) + ' — ' + clean(sdtClean),
          body: 'Khách: ' + clean(d.hoTen) +
                '\nSĐT: ' + clean(sdtClean) +
                '\nEmail: ' + clean(d.email) +
                '\nXe: ' + clean(d.loaiXe) +
                '\nHình thức: ' + clean(d.hinhThuc) +
                '\nNhận: ' + clean(d.gioNhan) + ' ' + clean(d.ngayNhan) +
                '\nTrả: ' + clean(d.gioTra) + ' ' + clean(d.ngayTra) +
                '\nThời lượng: ' + clean(d.thoiLuong) +
                '\nĐịa điểm: ' + clean(d.diaDiem) +
                '\nTạm tính: ' + (Number(d.tamTinh) || 0).toLocaleString('vi-VN') + 'đ' +
                '\nGhi chú: ' + clean(d.ghiChu)
        });
      } catch (mailErr) {
        // Không để lỗi mail làm hỏng việc lưu đơn
        console.error('Mail error: ' + mailErr);
      }
    }

    return jsonOut({ ok: true });
  } catch (err) {
    console.error('doPost error: ' + err);
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/** Cho phép mở URL bằng trình duyệt để kiểm tra đã deploy đúng. */
function doGet() {
  var sh = getSheet();
  return jsonOut({
    ok: true,
    message: 'VF3 Rental API đang chạy.',
    sheet: sh.getName(),
    soDon: Math.max(0, sh.getLastRow() - 1)
  });
}


/* ------------------------- HÀM PHỤ ------------------------- */

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }
  // Tạo header nếu sheet còn trống
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    var head = sh.getRange(1, 1, 1, HEADERS.length);
    head.setFontWeight('bold')
        .setBackground('#0FB26A')
        .setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 150);
    sh.setColumnWidth(2, 160);
    sh.setColumnWidth(3, 120);
    sh.setColumnWidth(14, 260);   // Ghi chú
  }
  return sh;
}

/** Chặn gửi trùng: cùng SĐT + cùng ngày nhận trong 2 phút gần nhất. */
function isDuplicate(sdt, ngayNhan) {
  var sh = getSheet();
  var last = sh.getLastRow();
  if (last < 2) return false;
  var from = Math.max(2, last - 30);                       // chỉ quét 30 dòng cuối
  var rows = sh.getRange(from, 1, last - from + 1, 8).getValues();
  var now = new Date().getTime();
  for (var i = rows.length - 1; i >= 0; i--) {
    var r = rows[i];
    if (String(r[2]) !== String(sdt)) continue;
    if (String(r[6]) !== String(ngayNhan)) continue;
    var t = parseVnDate(r[0]);
    if (t && (now - t) < 2 * 60 * 1000) return true;
  }
  return false;
}

function parseVnDate(v) {
  if (v instanceof Date) return v.getTime();
  var m = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]).getTime();
}

function clean(v) {
  if (v === null || v === undefined) return '';
  var s = String(v);
  // Chặn công thức độc hại kiểu =SUM(...) khi mở Sheet
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.slice(0, 1000);
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ------------------------- TIỆN ÍCH THÊM ------------------------- */

/**
 * Chạy thử 1 lần trong Apps Script để tạo header cho Sheet.
 * Chọn hàm  setup  →  bấm  Run.
 */
function setup() {
  var sh = getSheet();
  Logger.log('Sheet sẵn sàng: ' + sh.getName() + ' | số đơn hiện có: ' + Math.max(0, sh.getLastRow() - 1));
}

/**
 * Xuất các đơn ra CSV (chạy trong Apps Script, xem kết quả ở Log).
 */
function exportCsv() {
  var sh = getSheet();
  var values = sh.getDataRange().getValues();
  var csv = values.map(function (row) {
    return row.map(function (c) {
      var s = String(c === null ? '' : c);
      return '"' + s.replace(/"/g, '""') + '"';
    }).join(',');
  }).join('\n');
  Logger.log(csv);
}
