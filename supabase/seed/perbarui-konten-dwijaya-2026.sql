-- ==============================================================================
-- Seed: perbarui deskripsi & studi kasus Dwijaya Coffee (November 2026)
-- Tanggal: 2026-11-01
-- Referensi: Laporan Proposal & Progres Mingguan (Minggu 1 - 14) Proyek 1
-- Jalankan di Supabase SQL Editor untuk menyelaraskan data proyek dwijaya-coffee
-- ==============================================================================

BEGIN;

UPDATE public.projects
SET
  title = 'Dwijaya Coffee: Website Pemesanan Kafe',
  title_en = 'Dwijaya Coffee: Café Ordering Website',
  description = 'Platform web pemesanan dan manajemen operasional kafe terintegrasi: katalog menu interaktif dengan status ketersediaan otomatis, pembayaran digital full cashless via Payment Gateway Midtrans, modul kasir pemrosesan pesanan, serta dasbor analitik penjualan Owner dengan visualisasi grafik dan ekspor laporan PDF/Excel. Dikembangkan sebagai proyek kuliah berbasis mitra lokal di Kecamatan Papar, Kabupaten Kediri.',
  description_en = 'An integrated café ordering and operations management web platform: interactive menu catalog with real-time stock availability, 100% cashless digital payments via Midtrans Payment Gateway, cashier order processing module, and an Owner business analytics dashboard with chart visualisations and PDF/Excel report exports. Developed as a college project partnering with a local café in Papar, Kediri.',
  my_role = 'Ketua Tim & Full-Stack Web Engineer: memimpin koordinasi kebutuhan sistem bersama pemilik Coffee Shop Dwijaya (Papar, Kediri) dan membagi sprint 14 minggu untuk tim 4 mahasiswa, merancang arsitektur sistem, Use Case diagram, dan skema database DDL MySQL, mengembangkan frontend responsif dengan Laravel Blade & Bootstrap, mengintegrasikan Midtrans Snap API (GoPay, QRIS, Virtual Account BNI), serta membangun modul kasir, manajemen stok otomatis (Sold Out tag), dan pelaporan analitik omzet Owner.',
  my_role_en = 'Team Lead & Full-Stack Web Engineer: led requirement gathering with the owner of Coffee Shop Dwijaya (Papar, Kediri) and managed a 14-week sprint for a 4-member student team, designed system architecture, Use Case diagrams, and MySQL DDL relational schema, built responsive frontend with Laravel Blade & Bootstrap, integrated Midtrans Snap API (GoPay, QRIS, BNI Virtual Account), and developed cashier order processing, automatic stock deduction (Sold Out tags), and Owner sales analytics.',
  background = 'Coffee Shop Dwijaya merupakan usaha kafe lokal di Kecamatan Papar, Kabupaten Kediri yang menyajikan berbagai varian kopi, minuman non-kopi, makanan, dan kudapan. Proyek ini dikerjakan pada mata kuliah Proyek 1 (Semester 4, Kelas 2B Kelompok 2) beranggotakan 4 mahasiswa, dengan tujuan mendigitalisasi proses pemesanan tatap muka konvensional yang sering mengalami kendala antrean panjang saat jam ramai serta memperluas jangkauan pasar kafe.',
  background_en = 'Coffee Shop Dwijaya is a local café in Papar, Kediri Regency offering a wide selection of coffee, non-coffee beverages, meals, and snacks. This project was developed for the Course Project 1 (Semester 4, Class 2B Group 2) by a 4-student team, aimed at digitalizing traditional walk-in counter ordering that often faced long queues during peak rush hours and expanding the café brand visibility.',
  problem = 'Pemesanan manual di kasir memicu penumpukan antrean panjang saat jam sibuk dan memperbesar risiko salah catat pesanan oleh barista/karyawan. Pelanggan tidak dapat mengetahui ketersediaan stok menu secara real-time sebelum datang ke kafe. Selain itu, inventaris stok bahan tidak terhubung dengan transaksi sehingga menu yang habis sering kali tetap dipesan, serta pemilik kafe kesulitan memantau rekapitulasi omzet harian dan bulanan secara akurat tanpa harus memeriksa pembukuan manual fisik.',
  problem_en = 'Manual counter ordering led to long queues during rush hours and increased the risk of order errors by baristas/cashiers. Customers had no way to check real-time menu availability prior to arriving at the café. Furthermore, inventory stock was disconnected from sales transactions, risking orders placed on out-of-stock items, and the café owner lacked instant visibility into daily and monthly revenue without manually balancing physical cash logs.',
  solution = 'Sistem informasi pemesanan berbasis web dengan pemisahan 3 hak akses (Customer, Admin/Karyawan, dan Owner). Customer dapat menjelajahi katalog menu berfilter, melihat label Sold Out otomatis, mengelola keranjang belanja, serta membayar secara digital via Midtrans (QRIS, GoPay, BNI Virtual Account). Karyawan memiliki panel pemrosesan pesanan real-time (Pending → Processing → Completed), cetak struk transaksi, dan update stok menu. Owner memiliki dasbor analitik omzet lengkap dengan grafik tren penjualan harian/mingguan/bulanan, ekspor laporan formal format PDF dan Excel/CSV, serta manajemen pengguna.',
  solution_en = 'A web-based ordering information system featuring a strict 3-role access model (Customer, Admin/Cashier, Owner). Customers can browse categorized menus, view automatic Sold Out tags, manage interactive carts, and pay digitally via Midtrans (QRIS, GoPay, BNI Virtual Account). Staff use a real-time order processing panel (Pending → Processing → Completed), print receipts, and manage menu stock. The Owner has a dedicated analytics dashboard featuring revenue summaries, sales trend charts across days/weeks/months, formal PDF and Excel/CSV report exports, and user management.',
  features = ARRAY[
    'Katalog menu interaktif berfilter (Coffee, Non-Coffee, Food, Snack) dengan foto, deskripsi, dan status ketersediaan stok Sold Out otomatis',
    'Pembayaran digital full cashless via Payment Gateway Midtrans (GoPay, QRIS, Virtual Account BNI) dengan konfirmasi transaksi otomatis',
    'Keranjang belanja dinamis dengan pop-up notifikasi konfirmasi instan (CSS/JS) dan kalkulasi subtotal harga pesanan transparan',
    'Panel operasional kasir & admin untuk pemrosesan status pesanan (Pending, Processing, Completed, Cancelled) dan cetak struk nota transaksi',
    'Dasbor analitik Owner dengan rekapitulasi omzet penjualan, visualisasi grafik chart tren pendapatan, dan ekspor laporan format PDF serta Excel/CSV',
    'Manajemen pengguna multi-role dengan pemisahan hak akses terproteksi antara Owner, Admin/Karyawan, dan Customer'
  ]::TEXT[],
  features_en = ARRAY[
    'Interactive categorized menu catalog (Coffee, Non-Coffee, Food, Snack) with photos, descriptions, and automatic real-time Sold Out indicators',
    '100% cashless digital checkout via Midtrans Payment Gateway (GoPay, QRIS, BNI Virtual Account) with automated payment confirmation',
    'Dynamic shopping cart featuring instant confirmation pop-up alerts (CSS/JS) and transparent subtotal price calculation',
    'Cashier & admin operations panel for live order status processing (Pending, Processing, Completed, Cancelled) and receipt printing',
    'Owner business analytics dashboard tracking sales revenue, graphical revenue trend charts, and formal PDF and Excel/CSV report exports',
    'Multi-role access control system with role-based permission boundaries separating Owner, Admin/Staff, and Customer accounts'
  ]::TEXT[],
  outcome = 'Sistem berhasil diselesaikan melalui siklus penuh 14 minggu (perencanaan, use case, DDL, integrasi Midtrans, pengujian sistem, hingga pelatihan pengguna akhir). Berhasil memotong waktu antrean di kasir, meminimalisir kesalahan pesanan, serta memberikan transparansi omzet 100% bagi pemilik kafe melalui grafik dan ekspor PDF/CSV. Website sempat aktif daring (live) selama sekitar satu tahun dan diuji coba operasional langsung oleh pemilik Coffee Shop Dwijaya.',
  outcome_en = 'Successfully delivered through a complete 14-week lifecycle (planning, use case design, DDL schema, Midtrans integration, system testing, and end-user training). The system eliminated counter bottlenecks, minimized ordering mistakes, and delivered 100% revenue transparency to the café owner via sales charts and PDF/CSV exports. The website was live online for approximately one year and tested in real operations by the owner of Coffee Shop Dwijaya.',
  thumbnail_url = '/projects/dwijaya-coffee-cover.webp',
  gallery = '[
    {
      "url": "/projects/raw/dwijaya_catalog_menu.webp",
      "caption": "Katalog Menu Pembeli: Tampilan pilihan kopi, minuman, dan makanan dengan filter kategori serta status ketersediaan stok menu.",
      "caption_en": "Customer Menu Catalog: Browse coffees, beverages, and meals with category filters and real-time stock availability status.",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/89a50692-daa9-4e4a-824b-eeb96633b002.webp",
      "caption": "Keranjang Pesanan: Konfirmasi pop-up interaktif, pengaturan jumlah pesanan, dan kalkulasi subtotal harga transparan.",
      "caption_en": "Shopping Cart: Interactive confirmation pop-up alert, order quantity adjustment, and transparent subtotal price calculation.",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/9be9bc82-faf8-47a5-8bc1-8faac4ecdae0.webp",
      "caption": "Pembayaran Digital Midtrans: Integrasi checkout cashless multi-channel (GoPay, QRIS, Virtual Account BNI) dengan verifikasi otomatis.",
      "caption_en": "Midtrans Payment Gateway: Multi-channel cashless digital checkout (GoPay, QRIS, BNI Virtual Account) with automated payment confirmation.",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "/projects/raw/dwijaya_dashboard_admin.webp",
      "caption": "Dashboard Admin & Kasir: Navigasi operasional untuk pemrosesan antrean pesanan (Orders), data kategori, stok produk, dan akun kasir.",
      "caption_en": "Admin & Cashier Dashboard: Operations navigation for processing order queues, categories, inventory stock, and cashier accounts.",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "/projects/raw/dwijaya_dashboard_owner.webp",
      "caption": "Dashboard Owner: Panel eksekutif untuk manajemen hak akses pengguna (Users) dan pemantauan laporan analitik penjualan (Reports).",
      "caption_en": "Owner Dashboard: Executive panel for role-based user management and sales analytics reports monitoring.",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "/projects/raw/dwijaya_use_case.webp",
      "caption": "Diagram Use Case Sistem: Pemetaan interaksi 3 aktor (Owner, Karyawan/Kasir, dan Customer) pada sistem pemesanan kafe Dwijaya Coffee.",
      "caption_en": "System Use Case Diagram: Interaction mapping across 3 actor roles (Owner, Cashier/Staff, and Customer) on the Dwijaya Coffee ordering system.",
      "kind": "diagram",
      "label": "Use Case",
      "label_en": "Use Case",
      "device": "web"
    }
  ]'::JSONB
WHERE slug = 'dwijaya-coffee';

COMMIT;
