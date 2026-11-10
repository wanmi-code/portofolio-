/* ═══════════════════════════════════════════════════════════════════════════
   PORTOFOLIO — script.js
   01 Utilitas             10 Penyaring + FLIP
   02 Tema                 11 Pratinjau arsip
   03 Kursor kustom        12 Akordeon
   04 Kepala & navigasi    13 Dialog studi kasus
   05 Jam WIB              14 Palet perintah
   06 Pecah kata hero      15 Progres + penanda bagian
   07 Marquee              16 Angka berjalan
   08 Reveal               17 Salin & toast
   09 Tombol magnetik      18 Tahun & penutup

   Semua modul tahan-henti: kalau elemennya tidak ada, modul berhenti sendiri.
   ═══════════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── 01 UTILITAS ─────────────────────────────────────────────────────── */

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const body = document.body;

  const KALEM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HALUS = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
  const lerp  = (a, b, t) => a + (b - a) * t;
  const raf   = () => new Promise((r) => requestAnimationFrame(() => r()));

  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
  const ready = (fn) => document.readyState !== 'loading'
    ? fn()
    : document.addEventListener('DOMContentLoaded', fn, { once: true });

  /* ── 02 TEMA ─────────────────────────────────────────────────────────── */

  const Tema = (() => {
    const KEY = 'porto:tema';
    const tombol = $('[data-theme-toggle]');
    const meta = $('meta[name="theme-color"]');
    const WARNA = { light: '#F0EEEB', dark: '#0C0C0B' };

    const pakai = (nilai, simpan = true) => {
      root.dataset.theme = nilai;
      if (simpan) { try { localStorage.setItem(KEY, nilai); } catch {} }
      if (meta) meta.content = WARNA[nilai] || WARNA.light;
      window.dispatchEvent(new CustomEvent('tema:ganti', { detail: { tema: nilai } }));
    };

    let tersimpan = null;
    try { tersimpan = localStorage.getItem(KEY); } catch {}
    const sistemGelap = window.matchMedia('(prefers-color-scheme: dark)').matches;
    pakai(tersimpan || (sistemGelap ? 'dark' : 'light'), false);

    const balik = () => {
      const baru = root.dataset.theme === 'dark' ? 'light' : 'dark';
      const tukar = () => pakai(baru);
      if (document.startViewTransition && !KALEM) {
        document.startViewTransition(tukar);
      } else {
        tukar();
      }
    };

    on(tombol, 'click', balik);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      let ada = null;
      try { ada = localStorage.getItem(KEY); } catch {}
      if (!ada) pakai(e.matches ? 'dark' : 'light', false);
    });

    return {
      balik,
      get kini() { return root.dataset.theme; }
    };
  })();

  /* ── 03 KURSOR KUSTOM ────────────────────────────────────────────────── */

  const Kursor = (() => {
    if (!HALUS || KALEM) return { setLabel() {} };
    const wrap = $('[data-cursor]');
    if (!wrap) return { setLabel() {} };

    const ring = $('.cursor__ring', wrap);
    const dot = $('.cursor__dot', wrap);
    const label = $('[data-cursor-label]', wrap);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let jalan = false;

    const putar = () => {
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      label.style.transform = `translate(${rx + 18}px, ${ry + 16}px)`;
      requestAnimationFrame(putar);
    };

    on(window, 'pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      body.classList.add('has-cursor');
      if (!jalan) { jalan = true; rx = mx; ry = my; requestAnimationFrame(putar); }
    }, { passive: true });

    on(document, 'mouseleave', () => body.classList.remove('has-cursor'));

    const besar = () => body.classList.add('is-cursor-grow');
    const kecil = () => body.classList.remove('is-cursor-grow');

    $$('[data-cursor-grow]').forEach((el) => {
      on(el, 'pointerenter', () => {
        besar();
        const t = el.dataset.cursorLabel;
        if (t) label.textContent = t;
      });
      on(el, 'pointerleave', () => {
        kecil();
        label.textContent = '';
      });
    });

    on(document, 'pointerover', (e) => {
      const a = e.target.closest('a, button');
      a ? besar() : kecil();
    });

    return { setLabel(t) { label.textContent = t || ''; } };
  })();

  /* ── 04 KEPALA & NAVIGASI ────────────────────────────────────────────── */

  const Kepala = (() => {
    const bar = $('[data-topbar]');
    if (!bar) return;

    let terakhir = -1;
    const periksa = () => {
      const tersangkut = window.scrollY > 8 ? 1 : 0;
      if (tersangkut !== terakhir) {
        bar.classList.toggle('is-stuck', Boolean(tersangkut));
        terakhir = tersangkut;
      }
    };
    periksa();
    on(window, 'scroll', periksa, { passive: true });

    const tombol = $('[data-nav-toggle]');
    const nav = $('[data-nav]');
    if (!tombol || !nav) return;

    const setBuka = (buka) => {
      nav.classList.toggle('is-open', buka);
      tombol.setAttribute('aria-expanded', String(buka));
    };

    on(tombol, 'click', () => setBuka(!nav.classList.contains('is-open')));
    $$('a', nav).forEach((a) => on(a, 'click', () => setBuka(false)));
    on(window, 'keydown', (e) => { if (e.key === 'Escape') setBuka(false); });
    on(window, 'resize', () => { if (window.innerWidth > 820) setBuka(false); });

    on($('[data-top]'), 'click', () =>
      window.scrollTo({ top: 0, behavior: KALEM ? 'auto' : 'smooth' }));
  })();

  /* ── 05 JAM WIB ──────────────────────────────────────────────────────── */

  const Jam = (() => {
    const pendek = $('[data-clock]');
    const panjang = $('[data-clock-full]');
    if (!pendek && !panjang) return;

    const fmt = (opt) => new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      ...opt
    });

    const jamSaja = fmt({ hour: '2-digit', minute: '2-digit', hour12: false });
    const lengkap = fmt({
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: false
    });

    const jalan = () => {
      const now = new Date();
      if (pendek) pendek.textContent = jamSaja.format(now).replace(':', '.') + ' WIB';
      if (panjang) panjang.textContent = lengkap.format(now).replace('.', ':') + ' WIB';
    };

    jalan();
    setInterval(jalan, 15000);
    on(document, 'visibilitychange', () => { if (!document.hidden) jalan(); });
  })();

  /* ── 06 PECAH KATA HERO ──────────────────────────────────────────────── */

  const Hero = (() => {
    const hero = $('.hero');
    const h1 = $('[data-split]');
    if (!hero || !h1) return;

    const daun = [];

    const jalan = (node) => {
      Array.from(node.childNodes).forEach((anak) => {
        if (anak.nodeType === 3) {
          const kata = anak.textContent.split(/\s+/).filter(Boolean);
          if (!kata.length) return;
          const frag = document.createDocumentFragment();
          kata.forEach((k) => {
            const luar = document.createElement('span');
            const dalam = document.createElement('span');
            luar.className = 'word';
            dalam.className = 'word__in';
            dalam.textContent = k;
            luar.appendChild(dalam);
            frag.append(luar, document.createTextNode(' '));
            daun.push(dalam);
          });
          anak.replaceWith(frag);
        } else if (anak.nodeType === 1) {
          jalan(anak);
        }
      });
    };

    jalan(h1);
    daun.forEach((el, i) => el.style.setProperty('--i', String(i * 48)));
    daun.forEach((el) => el.setAttribute('aria-hidden', 'false'));

    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));
  })();

  /* ── 07 MARQUEE ──────────────────────────────────────────────────────── */

  (() => {
    const jalur = $('[data-marquee-track]');
    if (!jalur) return;
    jalur.innerHTML += jalur.innerHTML;
  })();

  /* ── 08 REVEAL ───────────────────────────────────────────────────────── */

  (() => {
    const item = $$('[data-reveal]');
    if (!item.length) return;

    if (KALEM || !('IntersectionObserver' in window)) {
      item.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    item.forEach((el) => io.observe(el));
  })();

  /* ── 09 TOMBOL MAGNETIK ──────────────────────────────────────────────── */

  (() => {
    if (!HALUS || KALEM) return;
    $$('[data-magnet]').forEach((el) => {
      let r = null;
      on(el, 'pointerenter', () => { r = el.getBoundingClientRect(); });
      on(el, 'pointermove', (e) => {
        if (!r) r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        el.style.transform = `translate(${clamp(dx, -8, 8)}px, ${clamp(dy, -8, 8)}px)`;
      });
      on(el, 'pointerleave', () => { el.style.transform = ''; r = null; });
    });
  })();

  /* ── 10 PENYARING + FLIP ─────────────────────────────────────────────── */

  const Saring = (() => {
    const wadah = $('[data-filters]');
    const grid = $('[data-grid]');
    if (!wadah || !grid) return { buka() {} };

    const kartu = $$('.card', grid);
    const kosong = $('[data-empty]');
    const hitung = $('[data-visible-count]');
    const total = $('[data-total-count]');

    if (total) total.textContent = String(kartu.length);

    let aktif = 'all';

    const terapkan = (tag) => {
      aktif = tag;
      kartu.forEach((k) => {
        const tags = (k.dataset.tags || '').split(/\s+/);
        const tampil = tag === 'all' || tags.includes(tag);
        const sudah = !k.classList.contains('is-filtered');
        k.dataset.show = tampil ? '1' : '0';
        if (tampil && !sudah) k.classList.remove('is-filtered');
        if (!tampil && sudah) k.classList.add('is-filtered');
      });
      if (hitung) hitung.textContent = String(kartu.filter((k) => k.dataset.show === '1').length);
      if (kosong) kosong.hidden = kartu.some((k) => k.dataset.show === '1');
    };

    const flip = async (tag) => {
      if (KALEM) { terapkan(tag); return; }

      const sebelum = new Map();
      kartu.forEach((k) => sebelum.set(k, k.getBoundingClientRect()));

      terapkan(tag);
      await raf();

      kartu.forEach((k) => {
        const a = sebelum.get(k);
        const b = k.getBoundingClientRect();
        const sembunyi = k.dataset.show !== '1';

        if (sembunyi && a.width) {
          k.animate(
            [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(10px)' }],
            { duration: 180, easing: 'cubic-bezier(0.4,0,1,1)', fill: 'forwards' }
          ).onfinish = () => { k.style.opacity = ''; k.style.transform = ''; };
          return;
        }

        const dx = a.left - b.left;
        const dy = a.top - b.top;

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          k.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
            { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
          );
        }

        k.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' });
      });
    };

    on(wadah, 'click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b) return;
      const tag = b.dataset.filter;
      if (tag === aktif) return;
      $$('[data-filter]', wadah).forEach((x) => x.classList.toggle('is-on', x === b));
      flip(tag);
    });

    terapkan('all');
    return { buka: (tag) => flip(tag) };
  })();

  /* ── 11 PRATINJAU ARSIP ──────────────────────────────────────────────── */

  const Pratinjau = (() => {
    if (!HALUS || KALEM) return;
    const kotak = $('[data-preview-box]');
    const baris = $$('[data-archive] .row');
    if (!kotak || !baris.length) return;

    const kata = $('[data-preview-word]', kotak);
    const ket = $('[data-preview-desc]', kotak);

    let tx = 0, ty = 0, cx = 0, cy = 0, hidup = false;

    const putar = () => {
      cx = lerp(cx, tx, 0.18);
      cy = lerp(cy, ty, 0.18);
      kotak.style.left = cx + 'px';
      kotak.style.top = cy + 'px';
      if (hidup) requestAnimationFrame(putar);
    };

    on(window, 'pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (hidup && !putar._jalan) { /* noop */ }
    }, { passive: true });

    baris.forEach((r) => {
      on(r, 'pointerenter', (e) => {
        if (kata) kata.textContent = r.dataset.plate || '';
        if (ket) ket.textContent = r.dataset.desc || '';
        tx = e.clientX; ty = e.clientY; cx = tx; cy = ty;
        hidup = true;
        body.classList.add('is-previewing');
        requestAnimationFrame(putar);
      });
      on(r, 'pointerleave', () => {
        hidup = false;
        body.classList.remove('is-previewing');
      });
    });
  })();

  /* ── 12 AKORDEON ─────────────────────────────────────────────────────── */

  (() => {
    const tombol = $$('[data-acc]');
    if (!tombol.length) return;

    const buka = (btn) => {
      const panel = btn.nextElementSibling;
      if (!panel) return;
      const b = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(b));
      panel.style.height = b ? panel.scrollHeight + 'px' : '0px';
    };

    tombol.forEach((btn) => {
      const panel = btn.nextElementSibling;
      if (panel) {
        panel.style.height = '0px';
        panel.setAttribute('role', 'region');
        if (!panel.id) panel.id = 'acc-' + Math.random().toString(36).slice(2, 8);
        btn.setAttribute('aria-controls', panel.id);
      }
      on(btn, 'click', () => buka(btn));
    });

    on(window, 'resize', () => {
      tombol.forEach((btn) => {
        if (btn.getAttribute('aria-expanded') !== 'true') return;
        const panel = btn.nextElementSibling;
        if (panel) panel.style.height = panel.scrollHeight + 'px';
      });
    });
  })();

  /* ── 13 DIALOG STUDI KASUS ───────────────────────────────────────────── */

  const StudiKasus = (() => {
    const dlg = $('[data-case-dialog]');
    if (!dlg) return { buka() {} };

    const DATA = {
      p1: {
        judul: 'Dasbor Analitik', jenis: 'Produk · 2026', tahun: '2026',
        peran: 'Front-end utama', bidang: 'Produk data', waktu: '11 minggu',
        kata: 'Dasbor', tags: ['Vue', 'Chart', 'A11y'],
        desc: 'Tim internal butuh melihat puluhan ribu baris transaksi tanpa menunggu sepuluh detik setiap kali mengganti penyaring.',
        more: 'Saya menata ulang menjadi tabel yang mengapuskan baris secara bertahap dan menyimpan keadaan penyaring di alamat halaman, supaya tautan hasil saringan bisa dibagikan ke rekan kerja.'
      },
      p2: {
        judul: 'Peluncuran Produk', jenis: 'Situs · 2025', tahun: '2025',
        peran: 'Desain + bangun', bidang: 'Pemasaran', waktu: '3 minggu',
        kata: 'Peluncuran', tags: ['HTML', 'Editorial', 'SEO'],
        desc: 'Perusahaan perlu memperkenalkan produk baru tanpa membuat pengunjung menunggu animasi pembuka yang panjang.',
        more: 'Satu halaman panjang dengan urutan naratif yang ketat. Semua animasi berjalan setelah teks terbaca, dan halaman tetap berguna saat JavaScript gagal dimuat.'
      },
      p3: {
        judul: 'Kasir Toko', jenis: 'Produk · 2025', tahun: '2025',
        peran: 'Front-end', bidang: 'Ritel', waktu: '9 minggu',
        kata: 'Kasir', tags: ['Offline', 'IndexedDB', 'PWA'],
        desc: 'Pemilik toko di daerah jaringan lemah tetap harus bisa mencatat penjualan sepanjang hari.',
        more: 'Transaksi disimpan lebih dulu di peramban lalu dikirim saat jaringan kembali. Tidak ada tombol simpan, tidak ada kehilangan data, tidak ada pelatihan panjang.'
      },
      p4: {
        judul: 'Sistem Desain Kecil', jenis: 'Sistem · 2024', tahun: '2024',
        peran: 'Desain sistem', bidang: 'Fondasi', waktu: '6 minggu',
        kata: 'Sistem', tags: ['Token', 'CSS', 'Dokumentasi'],
        desc: 'Tiga orang pembangun menghasilkan tampilan yang berbeda-beda di setiap layar baru.',
        more: 'Saya menyusun tangga tipe modular, skala spasi 8pt, dan 24 komponen dasar. Semuanya diberi nama sesuai maksudnya, bukan sesuai warnanya.'
      },
      p5: {
        judul: 'Tipografi Generatif', jenis: 'Eksperimen · 2024', tahun: '2024',
        peran: 'Eksperimen mandiri', bidang: 'Eksperimen', waktu: '2 minggu',
        kata: 'Tipografi', tags: ['Canvas', 'Variable font'],
        desc: 'Latihan untuk memahami sejauh mana gerak kursor bisa mengubah bentuk huruf sebelum mengganggu pembacaan.',
        more: 'Batasnya ternyata sempit: begitu pergeseran melewati beberapa persen, huruf berhenti terbaca. Pelajaran itu saya pakai di semua proyek setelahnya.'
      },
      p6: {
        judul: 'Studio Foto', jenis: 'Situs · 2023', tahun: '2023',
        peran: 'Bangun', bidang: 'Galeri', waktu: '4 minggu',
        kata: 'Studio', tags: ['Masonry', 'Lazy', 'AVIF'],
        desc: 'Galeri berisi ratusan foto berukuran besar yang harus tetap terasa ringan di ponsel.',
        more: 'Gambar dimuat bertahap sesuai posisi gulir, dengan ukuran cadangan di bawahnya supaya tata letak tidak melompat saat gambar datang.'
      }
    };

    const isi = {
      judul: $('[data-case-title]'),
      jenis: $('[data-case-kind]'),
      tahun: $('[data-case-year]'),
      peran: $('[data-case-role]'),
      bidang: $('[data-case-field]'),
      waktu: $('[data-case-time]'),
      kata: $('[data-case-word]'),
      desc: $('[data-case-desc]'),
      more: $('[data-case-more]'),
      tags: $('[data-case-tags]')
    };

    let fokusTerakhir = null;

    const buka = (id) => {
      const d = DATA[id];
      if (!d) return;

      isi.judul.textContent = d.judul;
      isi.jenis.textContent = d.jenis;
      isi.tahun.textContent = d.tahun;
      isi.peran.textContent = d.peran;
      isi.bidang.textContent = d.bidang;
      isi.waktu.textContent = d.waktu;
      isi.kata.textContent = d.kata;
      isi.desc.textContent = d.desc;
      isi.more.textContent = d.more;
      if (isi.tags) {
        isi.tags.innerHTML = d.tags.map((t) => `<li>${t}</li>`).join('');
      }

      fokusTerakhir = document.activeElement;
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');

      body.style.overflow = 'hidden';
      const tutupBtn = $('[data-case-close]', dlg);
      if (tutupBtn) tutupBtn.focus();
    };

    const tutup = () => {
      if (typeof dlg.close === 'function' && dlg.open) dlg.close();
      else dlg.removeAttribute('open');
      body.style.overflow = '';
      if (fokusTerakhir && fokusTerakhir.focus) fokusTerakhir.focus();
    };

    $$('[data-case]').forEach((el) => on(el, 'click', (e) => {
      e.preventDefault();
      buka(el.dataset.case);
    }));

    $$('[data-case-close]', dlg).forEach((b) => on(b, 'click', tutup));
    on(dlg, 'cancel', (e) => { e.preventDefault(); tutup(); });
    on(dlg, 'click', (e) => { if (e.target === dlg) tutup(); });

    return { buka, tutup };
  })();

  /* ── 14 PALET PERINTAH ───────────────────────────────────────────────── */

  const Palet = (() => {
    const kotak = $('[data-cmdk]');
    if (!kotak) return;

    const input = $('[data-cmd-input]');
    const lis
