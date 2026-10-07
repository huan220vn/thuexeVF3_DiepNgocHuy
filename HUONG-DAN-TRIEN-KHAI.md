# Hướng dẫn triển khai — VF3 Rental

Toàn bộ hướng dẫn từ số 0 đến khi web chạy thật. Làm theo đúng thứ tự.

---

## PHẦN A — Nối form đặt xe vào Google Sheet (5 phút)

> Bỏ qua phần này nếu bạn chỉ muốn xem giao diện. Form vẫn chạy nhưng đơn chỉ lưu tạm trên máy khách.

### A1. Tạo Google Sheet

1. Mở https://sheet.new — Google tạo một bảng tính mới.
2. Đổi tên file thành: **VF3 Rental — Đơn đặt xe**
3. Ở thanh dưới cùng, **bấm đúp vào tên tab** `Sheet1` và đổi thành: **`Bookings`**
   (chữ B hoa, đúng như vậy)

### A2. Mở Apps Script

1. Trên thanh menu: **Tiện ích mở rộng** (Extensions) → **Apps Script**
2. Một tab mới mở ra với file `Code.gs` chứa hàm mẫu `myFunction()`.
3. **Xoá sạch** nội dung đó.
4. Mở file `google-apps-script/Code.gs` trong thư mục này, **copy toàn bộ** rồi dán vào.
5. Bấm biểu tượng **Lưu** (hoặc `Ctrl + S`).

### A3. Chạy thử để tạo cột tiêu đề

1. Trong Apps Script, ở ô chọn hàm phía trên, chọn hàm **`setup`**.
2. Bấm **Run** (Chạy).
3. Google hỏi cấp quyền → **Xem quyền** → chọn tài khoản → **Nâng cao** →
   **Đi tới … (không an toàn)** → **Cho phép**.
   *(Cảnh báo này là bình thường với script tự viết, vì Google không kiểm duyệt code cá nhân.)*
4. Quay lại Google Sheet — tab `Bookings` đã có dòng tiêu đề màu xanh.

### A4. Triển khai thành Web App

1. Trong Apps Script, bấm **Triển khai** (Deploy) → **Tuỳ chọn triển khai mới**
   (New deployment).
2. Bấm biểu tượng bánh răng cạnh "Chọn loại" → chọn **Ứng dụng web** (Web app).
3. Điền:
   - **Mô tả**: `VF3 Rental API`
   - **Thực thi dưới dạng** (Execute as): **Tôi** (Me)
   - **Ai có quyền truy cập** (Who has access): **Bất kỳ ai** (Anyone) ← **rất quan trọng**
4. Bấm **Triển khai**.
5. **Copy** đoạn URL dạng:
   ```
   https://script.google.com/macros/s/AKfycb...../exec
   ```

> ⚠️ Nếu chọn "Chỉ mình tôi" thì web sẽ không gửi được đơn. Phải là **Bất kỳ ai**.

### A5. Dán URL vào web

Mở file `assets/js/config.js`, tìm dòng:

```js
API_URL: '',
```

Dán URL vào giữa hai dấu nháy:

```js
API_URL: 'https://script.google.com/macros/s/AKfycb...../exec',
```

**Lưu file.** Xong — từ giờ mọi đơn đặt xe sẽ tự động thành một dòng mới trong Google Sheet.

### A6. Kiểm tra

1. Mở web, vào trang **Đặt xe**, điền thử một đơn.
2. Bấm **Gửi đơn đặt xe** → thấy thông báo xanh kèm mã đơn.
3. Mở Google Sheet → dòng mới đã xuất hiện.

Nếu không thấy dòng nào: mở **Console** trình duyệt (`F12` → tab Console) xem lỗi, và kiểm tra lại bước A4 (quyền truy cập phải là **Anyone**).

---

## PHẦN B — Đưa web lên GitHub Pages

### B1. Tạo repository trên GitHub

1. Đăng nhập https://github.com
2. Bấm **+** góc phải → **New repository**
3. Điền:
   - **Repository name**: `vf3-rental`
   - **Public** (bắt buộc — GitHub Pages miễn phí chỉ chạy với repo public)
   - **KHÔNG** tick "Add a README file"
4. Bấm **Create repository**

### B2. Đẩy code lên

Mở PowerShell tại thư mục `vf3-rental` và chạy (thay `TEN_BAN` bằng username GitHub):

```powershell
git init
git add .
git commit -m "VF3 Rental - website cho thue xe dien"
git branch -M main
git remote add origin https://github.com/TEN_BAN/thuexeVF3_DiepNgocHuy.git
git push -u origin main
```

GitHub sẽ hỏi đăng nhập. Nếu dùng HTTPS, hãy tạo **Personal Access Token**:

> ⚠️ **QUAN TRỌNG — chọn đúng loại token:**
> Phải chọn **Tokens (classic)**, **KHÔNG** chọn *Fine-grained tokens*.
> Fine-grained token mặc định **không có** quyền tạo repository và sẽ báo lỗi `404 Not Found`.

1. Mở **https://github.com/settings/tokens**
2. Bấm **Generate new token** → chọn **Tokens (classic)** ← *bắt buộc*
3. **Note**: `VF3 Rental deploy` · **Expiration**: 7 ngày
4. Tick ô **`repo`** (ô đầu tiên — sẽ tự tick hết các ô con)
5. **Generate token** → copy chuỗi `ghp_...` → dùng làm mật khẩu khi `git push`

*Nếu buộc phải dùng Fine-grained token:* vào **Settings → Developer settings →
Personal access tokens → Fine-grained tokens** → chọn token → **Edit** →
mục **Repository access** chọn *All repositories* → mục **Permissions → Account permissions** →
**Administration: Read and write** → Save. Khi đó mới tạo được repository.

### B3. Bật GitHub Pages

1. Vào repository → tab **Settings**
2. Menu trái → **Pages**
3. Mục **Source**: chọn **Deploy from a branch**
4. **Branch**: chọn `main`, thư mục `/ (root)` → bấm **Save**
5. Đợi 1–2 phút, tải lại trang Settings → Pages sẽ thấy:

   ```
   Your site is live at https://TEN_BAN.github.io/thuexeVF3_DiepNgocHuy/
   ```

### B4. Gắn tên miền riêng (tuỳ chọn)

Nếu có tên miền (ví dụ `vf3rental.vn`):

1. Tại nơi quản lý tên miền, thêm bản ghi DNS:

   | Loại | Tên | Giá trị |
   |---|---|---|
   | A | @ | `185.199.108.153` |
   | A | @ | `185.199.109.153` |
   | A | @ | `185.199.110.153` |
   | A | @ | `185.199.111.153` |
   | CNAME | www | `TEN_BAN.github.io` |

2. Trong **Settings → Pages → Custom domain**, nhập tên miền → **Save**
3. Tick **Enforce HTTPS** (đợi vài phút cho chứng chỉ được cấp)

---

## PHẦN C — Sửa nội dung

| Muốn sửa gì | Sửa ở đâu |
|---|---|
| Số điện thoại, email, địa chỉ | `assets/js/config.js` (mục thông tin liên hệ) **và** phần footer trong mỗi file `.html` |
| Bảng giá | `assets/js/config.js` (mục `price`) **và** mục `#bang-gia` trong `index.html` |
| URL Google Sheet | `assets/js/config.js` → `API_URL` |
| Chữ trên trang chủ | `index.html` |
| Bài viết tin tức | `tin-tuc.html` |
| Chính sách | `chinh-sach.html` |
| Màu sắc, giao diện | `assets/css/style.css` — sửa biến ở mục `:root` |

> Sau khi sửa, chạy lại `git add . && git commit -m "cap nhat" && git push`. GitHub Pages tự cập nhật sau khoảng 1 phút.

---

## PHẦN D — Câu hỏi thường gặp

**Hỏi: Đơn đặt xe có bị mất khi khách đóng trình duyệt không?**
Không — đơn đã gửi thành công là đã nằm trong Google Sheet. Nếu mạng lỗi, web tự lưu tạm trên máy khách và gửi lại khi có mạng.

**Hỏi: Ai cũng xem được Google Sheet của tôi à?**
Không. URL Apps Script chỉ **ghi thêm** dòng, không đọc được dữ liệu. Sheet vẫn ở chế độ riêng tư của bạn.

**Hỏi: Có giới hạn số đơn không?**
Apps Script miễn phí chịu khoảng **20.000 request/ngày** — thừa sức cho quy mô thuê xe nhỏ.

**Hỏi: Bị spam thì sao?**
Đã có 3 lớp: ô bẫy ẩn (honeypot), kiểm tra định dạng số điện thoại, và chặn gửi trùng trong 2 phút. Nếu vẫn bị, có thể thêm Google reCAPTCHA.

**Hỏi: Muốn nhận email mỗi khi có đơn mới?**
Mở `Code.gs`, sửa dòng:
```js
var NOTIFY_EMAIL = '';   →   var NOTIFY_EMAIL = 'huan220vn@gmail.com';
```
Rồi triển khai lại (Deploy → Manage deployments → sửa → Version: New version).

**Hỏi: Trang web có chạy được khi mở trực tiếp file `index.html` không?**
Có, nhưng nên chạy qua GitHub Pages để đường dẫn và form hoạt động đúng nhất.

---

## Cấu trúc thư mục

```
vf3-rental/
├── index.html                  Trang chủ
├── dat-xe.html                 Form đặt xe
├── gioi-thieu.html             Giới thiệu
├── tin-tuc.html                Tin tức
├── lien-he.html                Liên hệ + bản đồ
├── chinh-sach.html             Chính sách & điều khoản
├── robots.txt                  Cho công cụ tìm kiếm
├── sitemap.xml                 Sơ đồ site
├── .nojekyll                   Bắt buộc để GitHub Pages không xử lý Jekyll
├── assets/
│   ├── css/style.css           Toàn bộ giao diện
│   ├── js/config.js            ⚙️  CẤU HÌNH — sửa file này
│   ├── js/app.js               Logic form, tính giá, gửi đơn
│   └── img/                    hero.svg, vf3.svg, favicon.svg
└── google-apps-script/
    └── Code.gs                 Code dán vào Google Apps Script
```
