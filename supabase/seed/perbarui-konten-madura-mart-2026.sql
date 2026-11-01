-- ==============================================================================
-- Seed: perbarui deskripsi & studi kasus Madura Mart (November 2026)
-- Tanggal: 2026-11-01
-- Referensi: Laporan Praktik Kerja Lapangan (PKL) Diskominfo Kabupaten Kediri 2023
-- Penulis: Aldi Dwi Irawan (2331730099), Ilham Alqodri M. Syafiq, M. Faiz Al Hafidz
-- Pembimbing: Mas Hendra Setiawan
-- Jalankan di Supabase SQL Editor untuk menyelaraskan data proyek madura-mart
-- ==============================================================================

BEGIN;

UPDATE public.projects
SET
  title = 'Madura Mart: Toko Online dan Sistem Stok',
  title_en = 'Madura Mart: Online Grocery Store & Inventory System',
  description = 'Platform web toko online sembako dan manajemen rantai pasok 24 jam dengan 3 hak akses terpisah (Customer, Admin, Owner): katalog kebutuhan harian dengan filter multi-kriteria dan promo countdown timer, checkout Midtrans & COD, modul inventaris 3 alur (Stok Masuk, Stok Keluar, Stok Opname selisih fisik), serta dasbor finansial Owner dengan perhitungan laba bersih riil dan ekspor laporan PDF/Excel. Dikembangkan sebagai proyek mandiri aplikatif mahasiswa saat PKL di Dinas Komunikasi dan Informatika (Diskominfo) Kabupaten Kediri.',
  description_en = 'A web-based 24-hour grocery e-commerce and supply chain management platform featuring 3 distinct access roles (Customer, Admin, Owner): daily essentials catalog with multi-criteria filters and countdown promo timers, Midtrans & COD checkout, a 3-flow inventory engine (Stock In, Stock Out, and Physical Stock-Take reconciliation), and an executive financial dashboard calculating real net profit with PDF/Excel exports. Developed as an applied internship project at the Kediri Regency Communication and Informatics Office (Diskominfo).',
  my_role = 'Full-Stack Web Engineer & Analis Sistem (Tim 3 Mahasiswa): merancang arsitektur sistem, Use Case diagram (3 aktor), dan Data Flow Diagram (DFD Konteks hingga Level 2), menyusun skema basis data relasional 10 tabel di MySQL, mengembangkan frontend toko sembako responsif, mengintegrasikan Payment Gateway Midtrans (Snap) & opsi Bayar di Tempat (COD), membangun modul inventaris 3 alur (Stok Masuk, Stok Keluar, dan Stok Opname rekonsiliasi selisih rak fisik), mengimplementasikan dasbor keuangan Owner dengan formula laba bersih riil (omzet dikurangi biaya operasional), serta menguji reliabilitas fungsionalitas melalui 18 skenario black-box testing bersama tim PKL di Diskominfo Kabupaten Kediri.',
  my_role_en = 'Full-Stack Web Engineer & System Analyst (3-Student Team): designed system architecture, Use Case diagrams (3 actors), and Data Flow Diagrams (DFD Context to Level 2), structured the 10-table MySQL relational database schema, developed the responsive grocery storefront, integrated Midtrans Payment Gateway (Snap API) & Cash on Delivery (COD), built the 3-flow inventory module (Stock In, Stock Out, and Physical Stock-Take reconciliation for shelf discrepancies), implemented the Owner financial dashboard with real net-profit accounting (revenue minus operational expenses), and validated system reliability across 18 black-box test scenarios with the internship team at Diskominfo Kediri.',
  background = 'Dikerjakan saat Praktik Kerja Lapangan (PKL) di Dinas Komunikasi dan Informatika (Diskominfo) Kabupaten Kediri oleh tim 3 mahasiswa Program Studi D3 Manajemen Informatika PSDKU Politeknik Negeri Malang di Kota Kediri (Aldi Dwi Irawan, Ilham Alqodri M. Syafiq, dan M. Faiz Al Hafidz) dengan bimbingan lapangan Mas Hendra Setiawan. Selain mendukung agenda infrastruktur TIK pemerintahan daerah (implementasi SSL HTTPS dan migrasi portal web resmi Kabupaten Kediri), tim mengembangkan proyek mandiri Warung Madura / Madura Mart untuk memberikan kontribusi nyata dalam digitalisasi operasional pelaku usaha kecil dan menengah (UMKM) toko sembako 24 jam.',
  background_en = 'Developed during the Field Work Practice (PKL) at the Communication and Informatics Office (Diskominfo) of Kediri Regency by a 3-student team from the D3 Informatics Management Program, PSDKU Politeknik Negeri Malang in Kediri (Aldi Dwi Irawan, Ilham Alqodri M. Syafiq, and M. Faiz Al Hafidz) under field supervisor Mas Hendra Setiawan. In addition to supporting government ICT infrastructure initiatives (SSL HTTPS implementation and the Kediri Regency web portal migration), the team developed the Warung Madura / Madura Mart project to provide practical digitalization for 24-hour small grocery merchants (MSMEs).',
  problem = 'Warung kelontong sembako beroperasi nonstop 24 jam dengan ratusan SKU barang kebutuhan pokok (beras, minyak goreng, gula, mie instan, telur, gas elpiji, perlengkapan mandi) dan perputaran transaksi yang sangat cepat. Pencatatan stok barang masuk dan keluar masih mengandalkan ingatan atau buku nota kertas terpisah, sehingga sering terjadi ketidaksesuaian stok fisik di rak dengan catatan pembukuan (stock discrepancy), dan barang habis terlambat disadari saat pembeli datang. Selain itu, pemilik toko kesulitan mengetahui keuntungan bersih bulanan secara riil karena biaya operasional rutin (sewa toko, listrik, biaya admin, dan pengeluaran mendesak) tidak terekam otomatis bersama omzet penjualan, serta belum tersedianya kanal pemesanan online bagi pelanggan warga sekitar.',
  problem_en = 'Operating 24/7 with hundreds of fast-moving essential grocery SKUs (rice, cooking oil, sugar, instant noodles, eggs, LPG cylinders, toiletries), traditional grocery shops face severe inventory management hurdles. Incoming and outgoing goods were tracked manually via paper notes or memory, causing frequent stock discrepancies between physical shelves and logbooks, with out-of-stock items noticed only after a customer requested them. Additionally, owners struggled to determine actual monthly net profit because operational overheads (rent, electricity, admin fees, urgent store costs) were never consolidated against gross revenue, and local neighbors lacked an online ordering channel for home delivery.',
  solution = 'Sistem informasi e-commerce sembako dan rantai pasok terintegrasi berbasis web dengan arsitektur 3 hak akses terproteksi (Customer, Admin/Penjaga Toko, dan Owner/Pemilik Toko). Customer dapat menjelajahi etalase sembako interaktif dengan banner promo countdown timer, memfilter produk berdasarkan rentang harga, rating bintang, dan ketersediaan stok, memesan via keranjang belanja, serta memilih pembayaran Midtrans (QRIS/Transfer) atau COD dengan pelacakan status pesanan. Admin toko dibekali panel kelola produk (harga modal, harga jual, estimasi laba), kategori, dan sistem inventaris 3 alur (Stok Masuk, Stok Keluar, dan Stok Opname untuk mencatat selisih stok fisik vs sistem secara berkala). Owner memiliki dasbor analitik eksekutif yang secara otomatis menghitung laba bersih bulanan (omzet penjualan dikurangi biaya operasional), visualisasi tren penjualan, laporan produk terlaris, serta ekspor dokumen resmi format PDF dan Excel.',
  solution_en = 'An integrated web-based grocery e-commerce and supply chain information system featuring a secure 3-role access architecture (Customer, Admin/Store Staff, and Owner). Customers browse an interactive grocery storefront with countdown promo banners, filter goods by price sliders, star ratings, and stock availability, place cart orders, and choose Midtrans (QRIS/Bank Transfer) or COD checkout with live order tracking. Admin staff manage product pricing (cost price, retail price, unit margin), categories, and a 3-flow inventory engine (Stock In, Stock Out, and Stock Opname to reconcile physical shelf vs recorded discrepancies). The Owner commands an executive analytics dashboard that automatically calculates net monthly profit (sales revenue minus operational overheads), charts sales trends, identifies best-selling SKUs, and exports formal PDF and Excel reports.',
  features = ARRAY[
    'Katalog Sembako & Filter Multi-Kriteria: Etalase produk kebutuhan pokok berfilter kategori (Bahan Pokok, Snack, Minuman, Obat, Alat Mandi) dengan slider rentang harga, rating bintang, ketersediaan stok, serta banner promo countdown timer',
    'Checkout Fleksibel & Multi-Metode Pembayaran: Keranjang belanja dinamis terintegrasi Payment Gateway Midtrans (Snap QRIS/Transfer Bank) dan opsi Bayar di Tempat (COD) disertai pelacakan status pesanan (Pending, Dikirim, Diterima)',
    'Sistem Inventaris 3 Alur (Masuk, Keluar, Opname): Manajemen mutasi stok barang masuk dari pemasok, pengurangan otomatis stok keluar transaksi, dan form Stok Opname untuk menghitung dan mencatat histori selisih fisik vs sistem',
    'Monitoring Modal & Margin Laba Otomatis: Pencatatan harga pokok modal versus harga jual per item, dilengkapi kartu ringkasan finansial inventaris toko (Total Modal Rp 93.767.500 dan Total Laba Rp 9.533.000)',
    'Dasbor Eksekutif & Kalkulasi Laba Bersih Owner: Analisis profitabilitas riil yang memotong pendapatan kotor dengan rincian biaya operasional bulanan (biaya admin, biaya urgent), grafik tren penjualan harian, dan identifikasi produk terlaris',
    'Ekspor Laporan Komprehensif (PDF & Excel): Ekspor satu klik laporan riwayat transaksi penjualan, rekapitulasi mutasi stok barang, dan laporan keuntungan per periode ke dalam dokumen PDF siap cetak dan spreadsheet Excel'
  ]::TEXT[],
  features_en = ARRAY[
    'Interactive Grocery Catalog & Multi-Criteria Filters: Categorized storefront (Staples, Snacks, Beverages, Medicine, Toiletries) with price sliders, star ratings, stock status, and promo banners with live countdown timers',
    'Flexible Checkout & Multi-Channel Payments: Dynamic shopping cart integrated with Midtrans Payment Gateway (Snap QRIS/Bank Transfer) and Cash on Delivery (COD) alongside real-time order status tracking (Pending, Shipped, Delivered)',
    '3-Flow Inventory Engine (In, Out, Stock-Take): Incoming stock logging from suppliers, automated outgoing sales deduction, and a dedicated Stock Opname module recording discrepancies between physical shelf counts and system logs',
    'Automated Capital & Profit Margin Monitoring: Unit cost vs retail price tracking per SKU, featuring financial inventory cards displaying Total Capital (Rp 93,767,500) and Total Estimated Profit (Rp 9,533,000)',
    'Executive Owner Dashboard & Net Profit Calculation: Real profitability analytics subtracting recorded monthly operating costs (admin fees, urgent overheads) from gross sales, daily trend charts, and best-seller SKU rankings',
    'Comprehensive Report Exports (PDF & Excel): One-click export of sales transaction histories, inventory stock audit logs, and monthly profit-and-loss summaries into printable PDF documents and Excel spreadsheets'
  ]::TEXT[],
  outcome = 'Sistem berhasil diselesaikan melalui seluruh siklus pengembangan (analisis kebutuhan UMKM sembako, perancangan DFD Level 0–2, perancangan ERD 10 tabel basis data, implementasi Laravel & MySQL, hingga pengujian sistem). Berhasil lulus 18 dari 18 skenario pengujian black-box testing mencakup seluruh fungsionalitas Customer, Admin, dan Owner tanpa kendala kritis. Sistem ini sukses meminimalisir selisih stok fisik, mengotomatiskan kalkulasi laba bersih riil warung sembako, dan menjadi portofolio aplikatif yang dipresentasikan dalam Laporan Praktik Kerja Lapangan di Dinas Kominfo Kabupaten Kediri.',
  outcome_en = 'Successfully delivered through the complete engineering lifecycle (grocery MSME requirement gathering, DFD Level 0–2 modeling, 10-table ERD database schema, Laravel & MySQL implementation, and comprehensive testing). Achieved a 100% pass rate across 18/18 black-box testing scenarios across all Customer, Admin, and Owner modules without critical defects. The system effectively eliminated shelf stock discrepancies, automated real net-profit accounting for the grocery merchant, and served as an applied portfolio milestone presented in the official PKL Report at Diskominfo Kediri.',
  thumbnail_url = '/projects/madura-mart-cover.webp',
  gallery = '[
    {
      "url": "https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/1f7e40d8-d711-40e1-b883-d5ca77e1d0ee.webp",
      "caption": "Halaman katalog",
      "caption_en": "Catalog page",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/7826dda2-2b36-452a-9a77-d89109b3ed76.webp",
      "caption": "Halaman data produk",
      "caption_en": "Product data page",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/5f1229e8-642f-4c68-8d3b-8a26abad02e5.webp",
      "caption": "Halaman stok masuk",
      "caption_en": "Incoming stock page",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/818bb00e-f210-42c5-9ed6-39906962c061.webp",
      "caption": "Halaman stok keluar",
      "caption_en": "Outgoing stock page",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/d1539dbe-bd10-46b2-8f73-d3ccf36dc977.webp",
      "caption": "Halaman kategori",
      "caption_en": "Category page",
      "kind": "gallery",
      "device": "web"
    },
    {
      "url": "/projects/raw/madura_use_case.webp",
      "caption": "Diagram Use Case Sistem: Pemetaan interaksi 3 peran pengguna (Customer: katalog, keranjang, Midtrans & COD; Admin: CRUD produk, stok masuk/keluar/opname; Owner: laporan laba dan data user).",
      "caption_en": "System Use Case Diagram: Interaction mapping across 3 user roles (Customer: catalog, cart, Midtrans & COD; Admin: CRUD products, stock flows; Owner: profit reports and user data).",
      "kind": "diagram",
      "label": "Use Case",
      "label_en": "Use Case",
      "device": "web"
    },
    {
      "url": "/projects/raw/madura_erd.webp",
      "caption": "Entity Relationship Diagram (ERD): Skema basis data relasional 10 tabel mencakup users, produk, kategori, transaksi, detail_transaksi, stokmasuk, stokkeluar, stokopname, stokhistori, dan biaya_operasional.",
      "caption_en": "Entity Relationship Diagram (ERD): 10-table relational database schema covering users, products, categories, transactions, transaction details, stock in/out/take, history, and operational costs.",
      "kind": "diagram",
      "label": "ERD Basis Data",
      "label_en": "Database ERD",
      "device": "web"
    },
    {
      "url": "/projects/raw/madura_dfd.webp",
      "caption": "Data Flow Diagram Lengkap: Aliran data level 0 (konteks), level 1 (manajemen user, produk, transaksi, stok, laporan), dan level 2 (alur pesanan, kelola stok, laporan laba).",
      "caption_en": "Complete Data Flow Diagram: Level 0 context diagram, Level 1 core processes, and Level 2 detailed flows for ordering, stock reconciliation, and profit reporting.",
      "kind": "diagram",
      "label": "DFD (Level 0 - 2)",
      "label_en": "DFD (Level 0 - 2)",
      "device": "web"
    }
  ]'::jsonb,
  updated_at = NOW()
WHERE slug = 'madura-mart';

COMMIT;
