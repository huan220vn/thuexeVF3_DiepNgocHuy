/* ==========================================================================
   CẤU HÌNH — Chỉ sửa file này, không cần đụng tới code khác
   ==========================================================================
   1) Tạo Google Sheet mới, đặt tên sheet (tab) là:  Bookings
   2) Mở rộng (Extensions) → Apps Script
   3) Dán nội dung file  google-apps-script/Code.gs  vào
   4) Triển khai (Deploy) → New deployment → Web app
        - Execute as:  Me
        - Who has access:  Anyone
   5) Copy "Web app URL" dán vào  API_URL  bên dưới
   ========================================================================== */

window.VF3_CONFIG = {

  /* ---- Google Apps Script Web App URL (dạng https://script.google.com/macros/s/AKfy.../exec) ---- */
  API_URL: '',

  /* ---- Thông tin liên hệ ---- */
  phone: '0938 477 107',
  phoneRaw: '0938477107',
  email: 'huan220vn@gmail.com',
  address: '72/4 Nguyễn Công Trứ, P.19, Q. Bình Thạnh, TP.HCM',

  /* ---- Thông tin xe ---- */
  car: 'VinFast VF3',

  /* ---- Bảng giá (đồng) ---- */
  price: {
    hour: 80000,      // mỗi giờ  (tối thiểu 4 giờ)
    day: 690000,      // mỗi ngày
    freeKmPerDay: 100,
    extraPerKm: 3000  // vượt km
  },

  minHours: 4,

  /* ---- Nếu API_URL trống: đơn được lưu tạm vào localStorage và hiện cảnh báo ---- */
  debug: false
};
