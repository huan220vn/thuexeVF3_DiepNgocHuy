# VF3 Rental — Website cho thuê xe điện VinFast VF3

Website tĩnh, hiện đại cho dịch vụ cho thuê xe điện **VinFast VF3** tại TP.HCM.
Form đặt xe gửi thẳng vào **Google Sheet** — không cần server, không tốn phí hosting.

## Tính năng

- **6 trang**: Trang chủ · Đặt xe · Giới thiệu · Tin tức · Liên hệ · Chính sách
- **Form đặt xe** đầy đủ: họ tên, SĐT, email, loại xe, ngày nhận–trả, địa điểm, hình thức, ghi chú
- **Tính giá tự động** theo giờ / theo ngày, hiển thị tóm tắt đơn ngay khi chọn ngày
- **Lưu vào Google Sheet** qua Apps Script (không cần backend)
- **Chống mất đơn**: nếu mạng lỗi, đơn được giữ trên máy khách và tự gửi lại
- **Chống spam**: honeypot + kiểm tra SĐT + chặn gửi trùng
- **Responsive** hoàn toàn: điện thoại, tablet, desktop
- **Tối ưu SEO**: meta description, Open Graph, sitemap.xml, robots.txt
- **Tối ưu truy cập**: skip link, ARIA, hỗ trợ `prefers-reduced-motion`
- Không dùng thư viện ngoài — tải nhanh, không phụ thuộc CDN

## Công nghệ

HTML5 · CSS3 (custom properties, grid, flexbox) · JavaScript thuần (ES5, không build step) · Google Apps Script

## Bắt đầu nhanh

```bash
# 1. Xem thử giao diện
#    Mở index.html bằng trình duyệt, hoặc chạy server tĩnh:
npx serve .

# 2. Nối Google Sheet
#    Làm theo HUONG-DAN-TRIEN-KHAI.md — Phần A (5 phút)

# 3. Đưa lên GitHub Pages
#    Làm theo HUONG-DAN-TRIEN-KHAI.md — Phần B
```

## Cấu hình

Mọi thứ cần sửa nằm trong **một file duy nhất**: `assets/js/config.js`

```js
window.VF3_CONFIG = {
  API_URL: '',                       // URL Google Apps Script
  phone: '0938 477 107',
  email: 'huan220vn@gmail.com',
  address: '72/4 Nguyễn Công Trứ, P.19, Q. Bình Thạnh, TP.HCM',
  price: {
    hour: 80000,                     // 80.000đ/giờ (tối thiểu 4 giờ)
    day: 690000,                     // 690.000đ/ngày
    freeKmPerDay: 100,
    extraPerKm: 3000
  }
};
```

> Khi `API_URL` còn trống, form vẫn chạy nhưng đơn chỉ lưu tạm trên máy khách (chế độ thử).

## Liên hệ

- **Địa chỉ**: 72/4 Nguyễn Công Trứ, Phường 19, Quận Bình Thạnh, TP.HCM
- **Hotline**: 0938 477 107
- **Email**: huan220vn@gmail.com

## Giấy phép

© VF3 Rental. Tất cả các quyền được bảo lưu.
