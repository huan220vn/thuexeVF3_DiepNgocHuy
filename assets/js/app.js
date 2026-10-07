/* ==========================================================================
   VF3 Rental — app.js
   Header, menu mobile, reveal on scroll, validate form, tính giá, gửi đơn
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.VF3_CONFIG || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------ *
   * 1. Tiện ích
   * ------------------------------------------------------------------ */
  function fmtVnd(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return Math.round(n).toLocaleString('vi-VN') + 'đ';
  }

  function todayISO(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d.toISOString().slice(0, 10);
  }

  function parseDate(s) {
    if (!s) return null;
    // Hỗ trợ cả "YYYY-MM-DD" (input type=date) và "YYYY-MM-DDTHH:MM" (ghép thêm giờ)
    var m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?/);
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  /** Ghép ngày + giờ thành Date. Nếu không có giờ thì trả về nửa đêm. */
  function toDateTime(ngay, gio) {
    var datePart = parseDate(ngay);
    if (!datePart) return null;
    if (!gio) return datePart;
    var hm = String(gio).match(/^(\d{1,2}):(\d{2})$/);
    if (!hm) return datePart;
    var d = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), +hm[1], +hm[2], 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ------------------------------------------------------------------ *
   * 2. Header: đổ bóng khi cuộn + thanh tiến trình
   * ------------------------------------------------------------------ */
  var header = $('#siteHeader');
  var progress = $('#scrollProgress');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ *
   * 3. Menu mobile
   * ------------------------------------------------------------------ */
  var burger = $('#burger');
  var nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. Reveal on scroll
   * ------------------------------------------------------------------ */
  var revealEls = $$('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ------------------------------------------------------------------ *
   * 5. Năm hiện tại ở footer
   * ------------------------------------------------------------------ */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ *
   * 6. Form "Tìm xe nhanh" ở trang chủ → chuyển sang trang đặt xe
   * ------------------------------------------------------------------ */
  var quickBook = $('#quickBook');
  if (quickBook) {
    var qNgayNhan = quickBook.querySelector('[name="ngayNhan"]');
    var qNgayTra = quickBook.querySelector('[name="ngayTra"]');
    if (qNgayNhan) { qNgayNhan.min = todayISO(0); qNgayNhan.value = todayISO(1); }
    if (qNgayTra) { qNgayTra.min = todayISO(0); qNgayTra.value = todayISO(3); }

    if (qNgayNhan && qNgayTra) {
      qNgayNhan.addEventListener('change', function () {
        qNgayTra.min = qNgayNhan.value || todayISO(0);
        if (qNgayTra.value && qNgayTra.value < qNgayNhan.value) qNgayTra.value = qNgayNhan.value;
      });
    }

    quickBook.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(quickBook);
      var q = new URLSearchParams();
      q.set('diaDiem', fd.get('diaDiem') || '');
      q.set('ngayNhan', fd.get('ngayNhan') || '');
      q.set('ngayTra', fd.get('ngayTra') || '');
      window.location.href = 'dat-xe.html?' + q.toString();
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. Form đặt xe đầy đủ
   * ------------------------------------------------------------------ */
  var bookForm = $('#bookForm');
  if (!bookForm) return;

  var elNhan = bookForm.querySelector('[name="ngayNhan"]');
  var elTra = bookForm.querySelector('[name="ngayTra"]');
  var elHinhThuc = $$('input[name="hinhThuc"]', bookForm);
  var elDiaDiem = bookForm.querySelector('[name="diaDiem"]');
  var elGhiChu = bookForm.querySelector('[name="ghiChu"]');
  var errBox = $('#formError');
  var okBox = $('#formSuccess');
  var submitBtn = $('#submitBtn');
  var submitText = $('#submitText');
  var summaryBox = $('#summary');

  /* --- Nhận tham số từ trang chủ --- */
  (function prefill() {
    var p = new URLSearchParams(window.location.search);
    if (p.get('diaDiem') && elDiaDiem) {
      var found = false;
      $$('option', elDiaDiem).forEach(function (o) {
        if (o.value === p.get('diaDiem')) { o.selected = true; found = true; }
      });
      if (!found) {
        var o = document.createElement('option');
        o.value = o.textContent = p.get('diaDiem');
        elDiaDiem.appendChild(o);
        elDiaDiem.value = p.get('diaDiem');
      }
    }
    if (p.get('ngayNhan') && elNhan) elNhan.value = p.get('ngayNhan');
    if (p.get('ngayTra') && elTra) elTra.value = p.get('ngayTra');
  })();

  /* --- Giới hạn ngày + giờ --- */
  var elGioNhan = bookForm.querySelector('[name="gioNhan"]');
  var elGioTra = bookForm.querySelector('[name="gioTra"]');

  if (elNhan) { elNhan.min = todayISO(0); if (!elNhan.value) elNhan.value = todayISO(1); }
  if (elTra) { elTra.min = todayISO(0); if (!elTra.value) elTra.value = todayISO(3); }
  var gioNhanDefault = CFG.gioNhanDefault || '08:00';
  var gioTraDefault = CFG.gioTraDefault || '17:00';
  if (elGioNhan && !elGioNhan.value) elGioNhan.value = gioNhanDefault;
  if (elGioTra && !elGioTra.value) elGioTra.value = gioTraDefault;

  if (elNhan && elTra) {
    elNhan.addEventListener('change', function () {
      elTra.min = elNhan.value || todayISO(0);
      if (elTra.value && elTra.value < elNhan.value) elTra.value = elNhan.value;
      updateSummary();
    });
    elTra.addEventListener('change', updateSummary);
  }
  elHinhThuc.forEach(function (r) { r.addEventListener('change', updateSummary); });
  if (elDiaDiem) elDiaDiem.addEventListener('change', updateSummary);
  if (elGhiChu) elGhiChu.addEventListener('input', updateSummary);
  if (elGioNhan) elGioNhan.addEventListener('change', updateSummary);
  if (elGioTra) elGioTra.addEventListener('change', updateSummary);

  /* --- Tính giá + hiển thị tóm tắt --- */
  function computeQuote() {
    var d1 = toDateTime(elNhan && elNhan.value, elGioNhan && elGioNhan.value);
    var d2 = toDateTime(elTra && elTra.value, elGioTra && elGioTra.value);
    var out = { ok: false, msg: '', days: 0, hours: 0, total: 0, unit: '', mode: '' };
    if (!d1 || !d2) { out.msg = 'Vui lòng chọn ngày nhận và ngày trả xe.'; return out; }
    if (d2 <= d1) { out.msg = 'Thời điểm trả xe phải sau thời điểm nhận xe.'; return out; }

    var days = Math.max(1, Math.ceil((d2 - d1) / 86400000));
    var hours = Math.round((d2 - d1) / 3600000);
    var giaNgay = CFG.price.day || 690000;
    var giaGio = CFG.price.hour || 80000;

    if (hours < (CFG.minHours || 4)) {
      // Dưới mức tối thiểu → tính theo số giờ tối thiểu
      out.mode = 'hour';
      out.hours = CFG.minHours || 4;
      out.total = out.hours * giaGio;
      out.unit = 'giờ (tối thiểu ' + (CFG.minHours || 4) + ' giờ)';
    } else if (hours <= 10 && hours * giaGio <= giaNgay) {
      // Trong ngày nhưng chưa vượt giá 1 ngày → tính theo giờ (có lợi cho khách)
      out.mode = 'hour';
      out.hours = hours;
      out.total = hours * giaGio;
      out.unit = 'giờ';
    } else {
      // Vượt giá 1 ngày, hoặc thuê nhiều ngày → tính theo ngày
      out.mode = 'day';
      out.days = days;
      out.total = days * giaNgay;
      out.unit = 'ngày';
      if (hours <= 24) out.cappedFromHour = true;
    }
    out.ok = true;
    out.freeKm = (out.mode === 'day' ? days : 0) * (CFG.price.freeKmPerDay || 100);
    return out;
  }

  function fmtDateVN(iso) {
    if (!iso) return '—';
    var p = String(iso).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  }

  function updateSummary() {
    if (!summaryBox) return;
    var q = computeQuote();
    var hinhThuc = (elHinhThuc.filter(function (r) { return r.checked; })[0] || {}).value || 'Tự lái';

    if (!q.ok) {
      summaryBox.innerHTML = '<h3>Tóm tắt đơn</h3><p style="font-size:.9rem;color:var(--muted);margin:0">' +
        escapeHtml(q.msg) + '</p>';
      return;
    }

    var gioNhanTxt = elGioNhan && elGioNhan.value ? ' lúc ' + elGioNhan.value : '';
    var gioTraTxt = elGioTra && elGioTra.value ? ' lúc ' + elGioTra.value : '';

    var rows = [
      ['Dòng xe', CFG.car || 'VinFast VF3'],
      ['Hình thức', hinhThuc],
      ['Nhận xe', fmtDateVN(elNhan.value) + gioNhanTxt],
      ['Trả xe', fmtDateVN(elTra.value) + gioTraTxt],
      ['Thời lượng', q.mode === 'day' ? q.days + ' ngày' : q.hours + ' giờ'],
      ['Địa điểm', elDiaDiem ? elDiaDiem.value : '—']
    ];
    if (q.mode === 'day') {
      rows.push(['Miễn phí km', q.freeKm + ' km']);
    }

    var html = '<h3>Tóm tắt đơn</h3><dl>';
    rows.forEach(function (r) {
      html += '<div class="srow"><dt>' + escapeHtml(r[0]) + '</dt><dd>' + escapeHtml(r[1]) + '</dd></div>';
    });
    html += '<div class="srow total"><dt>Tạm tính</dt><dd>' + fmtVnd(q.total) + '</dd></div></dl>';
    html += '<p style="font-size:.78rem;color:var(--muted);margin:14px 0 0">' +
            'Giá tạm tính theo ' + q.unit + '. Điện sạc và phí vượt km thanh toán theo thực tế.</p>';
    if (q.cappedFromHour) {
      html += '<p style="font-size:.78rem;color:var(--green-700);background:var(--green-50);' +
              'border:1px solid var(--green-200);border-radius:8px;padding:9px 11px;margin:10px 0 0">' +
              'Thời gian thuê vượt giá 1 ngày nên đã tính trọn <b>1 ngày</b> — có lợi hơn cho bạn.</p>';
    }
    summaryBox.innerHTML = html;
  }
  updateSummary();

  /* --- Hiện/ẩn thông báo --- */
  function showError(msg) {
    if (!errBox) return;
    errBox.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg><span>' + escapeHtml(msg) + '</span>';
    errBox.classList.add('is-on');
    if (okBox) okBox.classList.remove('is-on');
    errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function clearError() { if (errBox) errBox.classList.remove('is-on'); }

  function showSuccess(html) {
    if (!okBox) return;
    okBox.innerHTML = html;
    okBox.classList.add('is-on');
    if (errBox) errBox.classList.remove('is-on');
    okBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* --- Validate --- */
  function validate(data) {
    // Bẫy chống spam: bot điền vào ô ẩn → chặn
    if (data.website) return 'SPAM_FILTERED';
    if (!data.dongY) return 'Vui lòng đồng ý với chính sách thuê xe để tiếp tục.';
    if (!data.hoTen || data.hoTen.trim().length < 2) return 'Vui lòng nhập họ tên.';
    var sdt = (data.sdt || '').replace(/[\s.\-()]/g, '');
    if (!/^(0|\+84)\d{9}$/.test(sdt)) return 'Số điện thoại chưa hợp lệ (VD: 0938477107).';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return 'Email chưa hợp lệ.';
    if (!data.ngayNhan) return 'Vui lòng chọn ngày nhận xe.';
    if (!data.ngayTra) return 'Vui lòng chọn ngày trả xe.';
    var t1 = toDateTime(data.ngayNhan, data.gioNhan);
    var t2 = toDateTime(data.ngayTra, data.gioTra);
    if (t1 && t2 && t2 <= t1) {
      return 'Thời điểm trả xe phải sau thời điểm nhận xe. Nếu thuê trong ngày, hãy chọn giờ trả muộn hơn giờ nhận.';
    }
    if (!data.diaDiem) return 'Vui lòng chọn địa điểm nhận xe.';
    return '';
  }

  /* --- Gửi đơn --- */
  bookForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    var fd = new FormData(bookForm);
    var data = {};
    fd.forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });

    var err = validate(data);
    if (err === 'SPAM_FILTERED') {
      // Bot: giả vờ thành công, không gửi đi đâu cả
      done(true, '');
      return;
    }
    if (err) { showError(err); return; }

    var q = computeQuote();
    data.tamTinh = q.ok ? q.total : 0;
    data.thoiLuong = q.ok ? (q.mode === 'day' ? q.days + ' ngày' : q.hours + ' giờ') : '';
    data.guiLuc = new Date().toISOString();
    data.trang = window.location.href;

    // Chống trùng: khoá tạm trong 20 giây
    var lockKey = 'vf3_lock';
    var last = +(sessionStorage.getItem(lockKey) || 0);
    if (Date.now() - last < 20000) {
      showError('Đơn vừa được gửi. Vui lòng đợi 20 giây trước khi gửi lại.');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Đang gửi…';

    function done(ok, message) {
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.textContent = 'Gửi đơn đặt xe';
      if (ok) {
        sessionStorage.setItem(lockKey, String(Date.now()));
        var maDon = 'VF3-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' +
                    Math.random().toString(36).slice(2, 6).toUpperCase();
        showSuccess(
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>' +
          '<span><b>Đã nhận đơn đặt xe!</b><br>Mã đơn: <b>' + maDon + '</b><br>' +
          'Chúng tôi sẽ gọi xác nhận trong <b>15 phút</b>. Cần gấp, gọi <a href="tel:' +
          escapeHtml(CFG.phoneRaw || '') + '">' + escapeHtml(CFG.phone || '') + '</a>.</span>'
        );
        bookForm.reset();
        if (elNhan) elNhan.value = todayISO(1);
        if (elTra) elTra.value = todayISO(3);
        if (elGioNhan) elGioNhan.value = gioNhanDefault;
        if (elGioTra) elGioTra.value = gioTraDefault;
        updateSummary();
      } else {
        showError(message || 'Không gửi được đơn. Vui lòng gọi hotline để đặt xe.');
      }
    }

    // Chưa cấu hình API → lưu tạm và báo rõ
    if (!CFG.API_URL) {
      try {
        var box = JSON.parse(localStorage.getItem('vf3_don_cho') || '[]');
        box.push(data);
        localStorage.setItem('vf3_don_cho', JSON.stringify(box));
      } catch (_) {}
      done(true, '');
      if (okBox) {
        okBox.innerHTML += '<br><small style="opacity:.8">(Chế độ thử: đơn được lưu tạm trên máy. ' +
                           'Cần dán API_URL trong assets/js/config.js để lưu vào Google Sheet.)</small>';
      }
      return;
    }

    // Gửi tới Google Apps Script.
    // KHÔNG set Content-Type để tránh CORS preflight (Apps Script không xử lý OPTIONS).
    fetch(CFG.API_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      redirect: 'follow'
    })
      .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
      .then(function (json) {
        if (json && json.ok === false) throw new Error(json.error || 'Máy chủ từ chối');
        done(true, '');
      })
      .catch(function () {
        // Lưới an toàn: giữ đơn lại trên máy để không mất khách
        try {
          var box2 = JSON.parse(localStorage.getItem('vf3_don_cho') || '[]');
          box2.push(data);
          localStorage.setItem('vf3_don_cho', JSON.stringify(box2));
        } catch (_) {}
        done(false, 'Không kết nối được máy chủ. Đơn đã được lưu tạm trên máy này — ' +
                    'vui lòng gọi ' + (CFG.phone || '') + ' để xác nhận ngay.');
      });
  });

  /* ------------------------------------------------------------------ *
   * 8. Gửi lại các đơn tồn (nếu có mạng lại)
   * ------------------------------------------------------------------ */
  window.VF3_flushPending = function () {
    if (!CFG.API_URL) return Promise.resolve(0);
    var box;
    try { box = JSON.parse(localStorage.getItem('vf3_don_cho') || '[]'); } catch (_) { box = []; }
    if (!box.length) return Promise.resolve(0);
    var keep = [], sent = 0;
    return box.reduce(function (chain, item) {
      return chain.then(function () {
        return fetch(CFG.API_URL, { method: 'POST', body: JSON.stringify(item), redirect: 'follow' })
          .then(function () { sent++; })
          .catch(function () { keep.push(item); });
      });
    }, Promise.resolve()).then(function () {
      localStorage.setItem('vf3_don_cho', JSON.stringify(keep));
      return sent;
    });
  };
  if (navigator.onLine && CFG.API_URL) window.VF3_flushPending();
})();
