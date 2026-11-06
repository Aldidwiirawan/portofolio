/**
 * Detailed project content overrides based on authentic analysis of Jeejak (jeejak.id)
 * and CV Adisatya IT Consultant commercial releases.
 * These enrich and update the database fields so the application immediately reflects
 * the authentic case-study copy and features.
 */

export const PROJECT_OVERRIDES = {
  'jeejak-console': {
    title: 'Jeejak: Konsol Web Bukti Packing',
    title_en: 'Jeejak: Packing Proof Web Console',
    thumbnail_url: '/projects/jeejak-console-cover.webp',
    description:
      'Platform konsol web untuk seller Shopee dan TikTok Shop: integrasi pesanan via Excel/PDF resi, pemantauan antrean kemas real-time, dan arsip bukti packing sah untuk perlindungan klaim sengketa marketplace. Dikembangkan versi awalnya saat magang, kini dirilis resmi oleh CV Adisatya IT Consultant sebagai Jeejak (jeejak.id).',
    description_en:
      'A web console platform for Shopee and TikTok Shop sellers: bulk order import via Excel/PDF shipping labels, real-time packing queue tracking, and verified packing proof archives for marketplace dispute claims. I co-developed its initial version during my internship, now officially released by CV Adisatya IT Consultant as Jeejak (jeejak.id).',
    my_role:
      'Frontend & UI/UX Engineer (versi awal): merancang arsitektur antarmuka dan design system di Figma, membangun halaman web responsif dengan HTML, Jinja2, dan Tailwind CSS, mengembangkan dasbor antrean kemas & analitik performa, serta mengimplementasikan sinkronisasi REST API data scan resi dari aplikasi operator ke server bersama tim magang di CV Adisatya IT Consultant (Jan – Jul 2026).',
    my_role_en:
      'Front End & UI/UX Engineer (early version): designed interface layouts and operational workflows in Figma, built responsive web pages with HTML, Jinja2, and Tailwind CSS, developed packing queue dashboards & performance analytics, and implemented REST API sync for scanned shipping label data from the mobile operator app to the server during my internship at CV Adisatya IT Consultant (Jan – Jul 2026).',
    background:
      'Dikerjakan saat magang sebagai Programmer Intern di CV Adisatya IT Consultant (Jan – Jul 2026). Proyek ini berawal dari kebutuhan toko retail pilot (AyamBebek Pakan dan Ternak) dengan volume 20–100 pesanan per hari dan 7 operator gudang, yang memerlukan sistem dokumentasi bukti packing terpusat untuk meminimalisir kerugian akibat sengketa klaim marketplace. Sistem ini kemudian disempurnakan oleh tim CV Adisatya dan diluncurkan ke publik sebagai platform SaaS Jeejak (jeejak.id).',
    background_en:
      'Developed during my internship as a Programmer Intern at CV Adisatya IT Consultant (Jan – Jul 2026). The project began from the operational needs of a pilot retail store (AyamBebek) handling 20–100 daily orders with 7 warehouse operators, needing a centralized packing proof documentation system to prevent financial losses from marketplace claim disputes. The system was subsequently refined by CV Adisatya and launched publicly as the SaaS platform Jeejak (jeejak.id).',
    problem:
      'Status pengiriman sebelumnya dicatat manual di spreadsheet Excel, sedangkan foto bukti kemas dan serah terima kurir tercecer di grup WhatsApp dan galeri HP pribadi operator. Saat pembeli marketplace mengajukan komplain barang rusak atau paket kosong, pencarian satu riwayat nomor resi memakan waktu hingga 3 hari, sering kali berujung penolakan klaim karena bukti tidak valid.',
    problem_en:
      'Shipping statuses were previously logged by hand in Excel spreadsheets, while photo proofs of packing and courier handovers were scattered across WhatsApp chats and personal phone galleries. When marketplace buyers filed damage or missing-item claims, retrieving a single tracking history took up to 3 days, frequently resulting in rejected claims due to unverified documentation.',
    solution:
      'Konsol web terpadu yang mengimpor pesanan Shopee & TikTok Shop dari Excel/CSV dan PDF resi, menampilkan antrean pesanan siap kemas, dan mengarsipkan foto bukti packing per koli dengan timestamp verifikasi. Konsol ini juga menyediakan dasbor analitik penjualan, manajemen toko dan hak akses multi-peran (Owner, Admin, Operator), serta ekspor laporan ringkasan bukti packing PDF yang siap diunggah sebagai bukti sah banding marketplace.',
    solution_en:
      'A unified web console that imports Shopee & TikTok Shop orders from Excel/CSV and shipping label PDFs, displays ready-to-pack queues, and archives photo proofs per parcel with verified timestamps. The console also features sales analytics dashboards, multi-role user management (Owner, Admin, Operator), and one-click PDF proof report exports ready for official marketplace dispute evidence.',
    features: [
      'Impor pesanan massal dari file Excel/CSV dan PDF resi Shopee & TikTok Shop',
      'Dasbor antrean kemas real-time: Menunggu Kemas, Sedang Dikemas, dan Siap Kirim',
      'Pencarian instan dan verifikasi arsip bukti packing per nomor resi dalam hitungan detik',
      'Ekspor dokumen ringkasan bukti packing sah format PDF untuk klaim banding marketplace',
      'Manajemen toko dan hak akses pengguna bertingkat (Owner, Admin, Operator Gudang)',
      'Analitik operasional: volume pesanan harian, performa operator, dan kurir ekspedisi',
    ],
    features_en: [
      'Bulk order import from Shopee & TikTok Shop Excel/CSV and shipping label PDFs',
      'Real-time packing queue dashboard tracking Pending, Packing, and Ready to Ship statuses',
      'Instant search and retrieval of packing proof archives by tracking number in seconds',
      'Official PDF proof report export formatted for marketplace claim dispute submissions',
      'Multi-store management and role-based access control (Owner, Admin, Warehouse Operator)',
      'Operational analytics: daily order volume, operator performance, and courier distribution',
    ],
    outcome:
      'Versi awal sukses memangkas waktu pencarian bukti paket dari 3 hari menjadi hitungan detik di toko pilot AyamBebek. Sistem ini kemudian dikembangkan lebih lanjut oleh CV Adisatya IT Consultant menjadi produk komersial Jeejak (jeejak.id) yang kini melayani berbagai seller marketplace dengan skema paket gratis hingga berbayar.',
    outcome_en:
      'The initial version successfully cut proof retrieval time from 3 days to mere seconds for the pilot client, AyamBebek. The system was subsequently expanded by CV Adisatya IT Consultant into the commercial product Jeejak (jeejak.id), now serving marketplace sellers across free and premium subscription tiers.',
  },
  'jejakpaket': {
    title: 'JejakPaket: Aplikasi Operator Bukti Packing',
    title_en: 'JejakPaket: Packing Proof App for Operators',
    thumbnail_url: '/projects/jejakpaket-cover.webp',
    description:
      'Aplikasi mobile operasional gudang berbasis Flutter (Android & iOS) untuk operator packing: pemindaian cepat barcode resi dengan deteksi kurir otomatis, alarm anti-scan ganda, pengambilan foto bukti packing, dan pencatatan serah terima kurir dengan mode offline-first. Bagian dari ekosistem Jeejak oleh CV Adisatya IT Consultant.',
    description_en:
      'A Flutter warehouse operations mobile app (Android & iOS) for packing operators: high-speed barcode scanning with auto-courier detection, anti-duplicate scan alarm, packing photo proof capture, and courier handover logging with offline-first support. Part of the Jeejak ecosystem by CV Adisatya IT Consultant.',
    my_role:
      'Mobile Application Engineer (versi awal): ikut mengembangkan aplikasi mobile bersama tim programmer dengan Flutter & Dart, mengimplementasikan alur pemindaian barcode resi dengan auto-detect ekspedisi, pencegahan scan ganda, pengambilan foto bukti per koli paket, modul serah terima kurir, penyimpanan lokal (offline-first), dan sinkronisasi REST API ke server.',
    my_role_en:
      'Mobile Application Engineer (early version): co-developed the mobile app with the team using Flutter & Dart, implementing barcode scanning with auto courier detection, duplicate scan prevention, per-parcel photo capture, courier handover flow, offline-first local caching, and REST API sync to the server.',
    background:
      'Di lingkungan gudang operasional e-commerce yang sibuk dan berpindah-pindah, operator membutuhkan aplikasi mobile yang cepat, responsif, dan tidak bergantung pada sinyal internet yang tidak stabil. JejakPaket dirancang khusus sebagai aplikasi pendamping bagi operator di meja packing untuk mendokumentasikan setiap paket tanpa memperlambat ritme kerja fisik.',
    background_en:
      'In fast-paced, dynamic e-commerce warehouse environments, operators require a fast, responsive mobile tool that operates reliably regardless of unstable Wi-Fi or cellular connections. JejakPaket was designed specifically for packing bench operators to document every parcel without disrupting physical workflow speed.',
    problem:
      'Operator packing sering kali salah memasukkan paket ke ekspedisi yang keliru, melakukan scan berulang (scan ganda) tanpa sadar, atau kehilangan bukti foto karena galeri HP bercampur dengan foto pribadi. Selain itu, sinyal gudang yang sering terputus membuat aplikasi web biasa sering macet saat operator harus memproses puluhan paket per jam.',
    problem_en:
      'Packing operators frequently sorted parcels into the wrong courier bins, accidentally scanned packages twice, or misplaced evidence photos in crowded personal phone galleries. Additionally, weak warehouse wireless signals frequently caused standard web apps to stall while operators processed dozens of packages per hour.',
    solution:
      'Aplikasi mobile Flutter dengan arsitektur offline-first dan alur terstruktur: Packing → Drop Kurir → Retur. Dilengkapi deteksi otomatis marketplace/ekspedisi dari nomor resi, alarm audio saat terjadi scan ganda, panduan foto bukti kondisi paket sebelum dan sesudah dipacking, serta antrean sinkronisasi latar belakang yang otomatis mengunggah data begitu internet tersedia.',
    solution_en:
      'A Flutter mobile app featuring an offline-first architecture and structured workflow: Packing → Courier Handover → Returns. Equipped with automatic marketplace/courier recognition from barcode data, audio alarms for duplicate scans, photo capture guidelines, and a background sync queue that uploads data automatically when connectivity resumes.',
    features: [
      'Scan resi kamera super cepat dengan auto-detect ekspedisi (J&T, SiCepat, JNE, SPX, dll.)',
      'Alarm peringatan instan (audio & visual) untuk mencegah scan paket berulang (anti-scan ganda)',
      'Pengambilan foto bukti isi paket dan segel kemasan langsung dengan watermark resi',
      'Operasional offline-first: tetap bekerja lancar di sudut gudang tanpa sinyal internet',
      'Modul serah terima kurir (Handover) per ekspedisi dengan pencatatan total koli',
      'Modul penerimaan retur paket dengan foto kondisi barang dan alasan ketidaksesuaian',
    ],
    features_en: [
      'High-speed camera barcode scanning with automatic courier identification (J&T, SiCepat, JNE, SPX, etc.)',
      'Instant audio & visual warning alarms preventing accidental duplicate scans',
      'Direct parcel content and sealed box photo capture with tracking number watermarking',
      'Offline-first operations: seamless workflow even in warehouse dead zones without internet',
      'Courier handover batching module per carrier with total parcel count verification',
      'Return management module capturing damaged parcel photos and discrepancy reasons',
    ],
    outcome:
      'Mengurangi tingkat kesalahan kirim dan scan ganda secara signifikan di toko klien. Kini JejakPaket telah resmi didistribusikan di Google Play Store dan Apple App Store sebagai aplikasi mobile resmi ekosistem Jeejak.',
    outcome_en:
      'Significantly reduced mis-shipments and duplicate scans for the pilot client. JejakPaket is now officially distributed on Google Play Store and the Apple App Store as the mobile companion for the Jeejak ecosystem.',
    gallery: [
      {
        url: '/projects/raw/mobile_scan.webp',
        caption: 'Pemindaian Cepat Barcode Resi: Deteksi otomatis kurir ekspedisi (JNE) dan pop-up konfirmasi resi baru.',
        caption_en: 'Fast Shipping Label Barcode Scan: Auto-detects courier (JNE) with instant new-tracking confirmation popup.',
        kind: 'gallery',
        device: 'mobile',
      },
      {
        url: '/projects/raw/mobile_foto.webp',
        caption: 'Antrean Packing & Anti-Scan Ganda: Monitoring total resi unik vs duplikat dan alarm peringatan resi belum berfoto.',
        caption_en: 'Packing Queue & Duplicate Protection: Real-time tracking of unique vs duplicate scans and missing photo alerts.',
        kind: 'gallery',
        device: 'mobile',
      },
      {
        url: '/projects/raw/mobile_video.webp',
        caption: 'Modul Dropping & Serah Terima Kurir: Verifikasi penyerahan paket per ekspedisi dengan bukti video tanpa jeda.',
        caption_en: 'Courier Dropping & Handover Module: Verified parcel dispatch per courier with unedited video and photo proof.',
        kind: 'gallery',
        device: 'mobile',
      },
      {
        url: '/projects/raw/doc_pdf.webp',
        caption: 'Dokumen Sah Bukti Pengiriman Paket (PDF): Berita acara sengketa marketplace lengkap dengan cap stempel Terlacak dan foto fisik kemasan.',
        caption_en: 'Official Marketplace Proof PDF Document: Dispute evidence report complete with Terlacak seal and parcel photos.',
        kind: 'gallery',
        device: 'mobile',
      },
    ],
  },
  'dwijaya-coffee': {
    title: 'Dwijaya Coffee: Website Pemesanan Kafe',
    title_en: 'Dwijaya Coffee: Café Ordering Website',
    description:
      'Platform web pemesanan dan manajemen operasional kafe terintegrasi: katalog menu interaktif dengan status ketersediaan otomatis, pembayaran digital full cashless via Payment Gateway Midtrans, modul kasir pemrosesan pesanan, serta dasbor analitik penjualan Owner dengan visualisasi grafik dan ekspor laporan PDF/Excel. Dikembangkan sebagai proyek kuliah berbasis mitra lokal di Kecamatan Papar, Kabupaten Kediri.',
    description_en:
      'An integrated café ordering and operations management web platform: interactive menu catalog with real-time stock availability, 100% cashless digital payments via Midtrans Payment Gateway, cashier order processing module, and an Owner business analytics dashboard with chart visualisations and PDF/Excel report exports. Developed as a college project partnering with a local café in Papar, Kediri.',
    my_role:
      'Ketua Tim & Full-Stack Web Engineer: memimpin koordinasi kebutuhan sistem bersama pemilik Coffee Shop Dwijaya (Papar, Kediri) dan membagi sprint 14 minggu untuk tim 4 mahasiswa, merancang arsitektur sistem, Use Case diagram, dan skema database DDL MySQL, mengembangkan frontend responsif dengan Laravel Blade & Bootstrap, mengintegrasikan Midtrans Snap API (GoPay, QRIS, Virtual Account BNI), serta membangun modul kasir, manajemen stok otomatis (Sold Out tag), dan pelaporan analitik omzet Owner.',
    my_role_en:
      'Team Lead & Full-Stack Web Engineer: led requirement gathering with the owner of Coffee Shop Dwijaya (Papar, Kediri) and managed a 14-week sprint for a 4-member student team, designed system architecture, Use Case diagrams, and MySQL DDL relational schema, built responsive frontend with Laravel Blade & Bootstrap, integrated Midtrans Snap API (GoPay, QRIS, BNI Virtual Account), and developed cashier order processing, automatic stock deduction (Sold Out tags), and Owner sales analytics.',
    background:
      'Coffee Shop Dwijaya merupakan usaha kafe lokal di Kecamatan Papar, Kabupaten Kediri yang menyajikan berbagai varian kopi, minuman non-kopi, makanan, dan kudapan. Proyek ini dikerjakan pada mata kuliah Proyek 1 (Semester 4, Kelas 2B Kelompok 2) beranggotakan 4 mahasiswa, dengan tujuan mendigitalisasi proses pemesanan tatap muka konvensional yang sering mengalami kendala antrean panjang saat jam ramai serta memperluas jangkauan pasar kafe.',
    background_en:
      'Coffee Shop Dwijaya is a local café in Papar, Kediri Regency offering a wide selection of coffee, non-coffee beverages, meals, and snacks. This project was developed for the Course Project 1 (Semester 4, Class 2B Group 2) by a 4-student team, aimed at digitalizing traditional walk-in counter ordering that often faced long queues during peak rush hours and expanding the café brand visibility.',
    problem:
      'Pemesanan manual di kasir memicu penumpukan antrean panjang saat jam sibuk dan memperbesar risiko salah catat pesanan oleh barista/karyawan. Pelanggan tidak dapat mengetahui ketersediaan stok menu secara real-time sebelum datang ke kafe. Selain itu, inventaris stok bahan tidak terhubung dengan transaksi sehingga menu yang habis sering kali tetap dipesan, serta pemilik kafe kesulitan memantau rekapitulasi omzet harian dan bulanan secara akurat tanpa harus memeriksa pembukuan manual fisik.',
    problem_en:
      'Manual counter ordering led to long queues during rush hours and increased the risk of order errors by baristas/cashiers. Customers had no way to check real-time menu availability prior to arriving at the café. Furthermore, inventory stock was disconnected from sales transactions, risking orders placed on out-of-stock items, and the café owner lacked instant visibility into daily and monthly revenue without manually balancing physical cash logs.',
    solution:
      'Sistem informasi pemesanan berbasis web dengan pemisahan 3 hak akses (Customer, Admin/Karyawan, dan Owner). Customer dapat menjelajahi katalog menu berfilter, melihat label Sold Out otomatis, mengelola keranjang belanja, serta membayar secara digital via Midtrans (QRIS, GoPay, BNI Virtual Account). Karyawan memiliki panel pemrosesan pesanan real-time (Pending → Processing → Completed), cetak struk transaksi, dan update stok menu. Owner memiliki dasbor analitik omzet lengkap dengan grafik tren penjualan harian/mingguan/bulanan, ekspor laporan formal format PDF dan Excel/CSV, serta manajemen pengguna.',
    solution_en:
      'A web-based ordering information system featuring a strict 3-role access model (Customer, Admin/Cashier, Owner). Customers can browse categorized menus, view automatic Sold Out tags, manage interactive carts, and pay digitally via Midtrans (QRIS, GoPay, BNI Virtual Account). Staff use a real-time order processing panel (Pending → Processing → Completed), print receipts, and manage menu stock. The Owner has a dedicated analytics dashboard featuring revenue summaries, sales trend charts across days/weeks/months, formal PDF and Excel/CSV report exports, and user management.',
    features: [
      'Katalog menu interaktif berfilter (Coffee, Non-Coffee, Food, Snack) dengan foto, deskripsi, dan status ketersediaan stok Sold Out otomatis',
      'Pembayaran digital full cashless via Payment Gateway Midtrans (GoPay, QRIS, Virtual Account BNI) dengan konfirmasi transaksi otomatis',
      'Keranjang belanja dinamis dengan pop-up notifikasi konfirmasi instan (CSS/JS) dan kalkulasi subtotal harga pesanan transparan',
      'Panel operasional kasir & admin untuk pemrosesan status pesanan (Pending, Processing, Completed, Cancelled) dan cetak struk nota transaksi',
      'Dasbor analitik Owner dengan rekapitulasi omzet penjualan, visualisasi grafik chart tren pendapatan, dan ekspor laporan format PDF serta Excel/CSV',
      'Manajemen pengguna multi-role dengan pemisahan hak akses terproteksi antara Owner, Admin/Karyawan, dan Customer',
    ],
    features_en: [
      'Interactive categorized menu catalog (Coffee, Non-Coffee, Food, Snack) with photos, descriptions, and automatic real-time Sold Out indicators',
      '100% cashless digital checkout via Midtrans Payment Gateway (GoPay, QRIS, BNI Virtual Account) with automated payment confirmation',
      'Dynamic shopping cart featuring instant confirmation pop-up alerts (CSS/JS) and transparent subtotal price calculation',
      'Cashier & admin operations panel for live order status processing (Pending, Processing, Completed, Cancelled) and receipt printing',
      'Owner business analytics dashboard tracking sales revenue, graphical revenue trend charts, and formal PDF and Excel/CSV report exports',
      'Multi-role access control system with role-based permission boundaries separating Owner, Admin/Staff, and Customer accounts',
    ],
    outcome:
      'Sistem berhasil diselesaikan melalui siklus penuh 14 minggu (perencanaan, use case, DDL, integrasi Midtrans, pengujian sistem, hingga pelatihan pengguna akhir). Berhasil memotong waktu antrean di kasir, meminimalisir kesalahan pesanan, serta memberikan transparansi omzet 100% bagi pemilik kafe melalui grafik dan ekspor PDF/CSV. Website sempat aktif daring (live) selama sekitar satu tahun dan diuji coba operasional langsung oleh pemilik Coffee Shop Dwijaya.',
    outcome_en:
      'Successfully delivered through a complete 14-week lifecycle (planning, use case design, DDL schema, Midtrans integration, system testing, and end-user training). The system eliminated counter bottlenecks, minimized ordering mistakes, and delivered 100% revenue transparency to the café owner via sales charts and PDF/CSV exports. The website was live online for approximately one year and tested in real operations by the owner of Coffee Shop Dwijaya.',
    thumbnail_url: '/projects/dwijaya-coffee-cover.webp',
    gallery: [
      {
        url: '/projects/raw/dwijaya_catalog_menu.webp',
        caption:
          'Katalog Menu Pembeli: Tampilan pilihan kopi, minuman, dan makanan dengan filter kategori serta status ketersediaan stok menu.',
        caption_en:
          'Customer Menu Catalog: Browse coffees, beverages, and meals with category filters and real-time stock availability status.',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: 'https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/89a50692-daa9-4e4a-824b-eeb96633b002.webp',
        caption:
          'Keranjang Pesanan: Konfirmasi pop-up interaktif, pengaturan jumlah pesanan, dan kalkulasi subtotal harga transparan.',
        caption_en:
          'Shopping Cart: Interactive confirmation pop-up alert, order quantity adjustment, and transparent subtotal price calculation.',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: 'https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/9be9bc82-faf8-47a5-8bc1-8faac4ecdae0.webp',
        caption:
          'Pembayaran Digital Midtrans: Integrasi checkout cashless multi-channel (GoPay, QRIS, Virtual Account BNI) dengan verifikasi otomatis.',
        caption_en:
          'Midtrans Payment Gateway: Multi-channel cashless digital checkout (GoPay, QRIS, BNI Virtual Account) with automated payment confirmation.',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: '/projects/raw/dwijaya_dashboard_admin.webp',
        caption:
          'Dashboard Admin & Kasir: Navigasi operasional untuk pemrosesan antrean pesanan (Orders), data kategori, stok produk, dan akun kasir.',
        caption_en:
          'Admin & Cashier Dashboard: Operations navigation for processing order queues, categories, inventory stock, and cashier accounts.',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: '/projects/raw/dwijaya_dashboard_owner.webp',
        caption:
          'Dashboard Owner: Panel eksekutif untuk manajemen hak akses pengguna (Users) dan pemantauan laporan analitik penjualan (Reports).',
        caption_en:
          'Owner Dashboard: Executive panel for role-based user management and sales analytics reports monitoring.',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: '/projects/raw/dwijaya_use_case.webp',
        caption:
          'Diagram Use Case Sistem: Pemetaan interaksi 3 aktor (Owner, Karyawan/Kasir, dan Customer) pada sistem pemesanan kafe Dwijaya Coffee.',
        caption_en:
          'System Use Case Diagram: Interaction mapping across 3 actor roles (Owner, Cashier/Staff, and Customer) on the Dwijaya Coffee ordering system.',
        kind: 'diagram',
        label: 'Use Case',
        label_en: 'Use Case',
        device: 'web',
      },
    ],
  },
  'madura-mart': {
    title: 'Madura Mart: Toko Online dan Sistem Stok',
    title_en: 'Madura Mart: Online Grocery Store & Inventory System',
    thumbnail_url: '/projects/madura-mart-cover.webp',
    description:
      'Platform web toko online sembako dan manajemen rantai pasok 24 jam dengan 3 hak akses terpisah (Customer, Admin, Owner): katalog kebutuhan harian dengan filter multi-kriteria dan promo countdown timer, checkout Midtrans & COD, modul inventaris 3 alur (Stok Masuk, Stok Keluar, Stok Opname selisih fisik), serta dasbor finansial Owner dengan perhitungan laba bersih riil dan ekspor laporan PDF/Excel. Dikembangkan sebagai proyek mandiri aplikatif mahasiswa saat PKL di Dinas Komunikasi dan Informatika (Diskominfo) Kabupaten Kediri.',
    description_en:
      'A web-based 24-hour grocery e-commerce and supply chain management platform featuring 3 distinct access roles (Customer, Admin, Owner): daily essentials catalog with multi-criteria filters and countdown promo timers, Midtrans & COD checkout, a 3-flow inventory engine (Stock In, Stock Out, and Physical Stock-Take reconciliation), and an executive financial dashboard calculating real net profit with PDF/Excel exports. Developed as an applied internship project at the Kediri Regency Communication and Informatics Office (Diskominfo).',
    my_role:
      'Full-Stack Web Engineer & Analis Sistem (Tim 3 Mahasiswa): merancang arsitektur sistem, Use Case diagram (3 aktor), dan Data Flow Diagram (DFD Konteks hingga Level 2), menyusun skema basis data relasional 10 tabel di MySQL, mengembangkan frontend toko sembako responsif, mengintegrasikan Payment Gateway Midtrans (Snap) & opsi Bayar di Tempat (COD), membangun modul inventaris 3 alur (Stok Masuk, Stok Keluar, dan Stok Opname rekonsiliasi selisih rak fisik), mengimplementasikan dasbor keuangan Owner dengan formula laba bersih riil (omzet dikurangi biaya operasional), serta menguji reliabilitas fungsionalitas melalui 18 skenario black-box testing bersama tim PKL di Diskominfo Kabupaten Kediri.',
    my_role_en:
      'Full-Stack Web Engineer & System Analyst (3-Student Team): designed system architecture, Use Case diagrams (3 actors), and Data Flow Diagrams (DFD Context to Level 2), structured the 10-table MySQL relational database schema, developed the responsive grocery storefront, integrated Midtrans Payment Gateway (Snap API) & Cash on Delivery (COD), built the 3-flow inventory module (Stock In, Stock Out, and Physical Stock-Take reconciliation for shelf discrepancies), implemented the Owner financial dashboard with real net-profit accounting (revenue minus operational expenses), and validated system reliability across 18 black-box test scenarios with the internship team at Diskominfo Kediri.',
    background:
      'Dikerjakan saat Praktik Kerja Lapangan (PKL) di Dinas Komunikasi dan Informatika (Diskominfo) Kabupaten Kediri oleh tim 3 mahasiswa Program Studi D3 Manajemen Informatika PSDKU Politeknik Negeri Malang di Kota Kediri (Aldi Dwi Irawan, Ilham Alqodri M. Syafiq, dan M. Faiz Al Hafidz) dengan bimbingan lapangan Mas Hendra Setiawan. Selain mendukung agenda infrastruktur TIK pemerintahan daerah (implementasi SSL HTTPS dan migrasi portal web resmi Kabupaten Kediri), tim mengembangkan proyek mandiri Warung Madura / Madura Mart untuk memberikan kontribusi nyata dalam digitalisasi operasional pelaku usaha kecil dan menengah (UMKM) toko sembako 24 jam.',
    background_en:
      'Developed during the Field Work Practice (PKL) at the Communication and Informatics Office (Diskominfo) of Kediri Regency by a 3-student team from the D3 Informatics Management Program, PSDKU Politeknik Negeri Malang in Kediri (Aldi Dwi Irawan, Ilham Alqodri M. Syafiq, and M. Faiz Al Hafidz) under field supervisor Mas Hendra Setiawan. In addition to supporting government ICT infrastructure initiatives (SSL HTTPS implementation and the Kediri Regency web portal migration), the team developed the Warung Madura / Madura Mart project to provide practical digitalization for 24-hour small grocery merchants (MSMEs).',
    problem:
      'Warung kelontong sembako beroperasi nonstop 24 jam dengan ratusan SKU barang kebutuhan pokok (beras, minyak goreng, gula, mie instan, telur, gas elpiji, perlengkapan mandi) dan perputaran transaksi yang sangat cepat. Pencatatan stok barang masuk dan keluar masih mengandalkan ingatan atau buku nota kertas terpisah, sehingga sering terjadi ketidaksesuaian stok fisik di rak dengan catatan pembukuan (stock discrepancy), dan barang habis terlambat disadari saat pembeli datang. Selain itu, pemilik toko kesulitan mengetahui keuntungan bersih bulanan secara riil karena biaya operasional rutin (sewa toko, listrik, biaya admin, dan pengeluaran mendesak) tidak terekam otomatis bersama omzet penjualan, serta belum tersedianya kanal pemesanan online bagi pelanggan warga sekitar.',
    problem_en:
      'Operating 24/7 with hundreds of fast-moving essential grocery SKUs (rice, cooking oil, sugar, instant noodles, eggs, LPG cylinders, toiletries), traditional grocery shops face severe inventory management hurdles. Incoming and outgoing goods were tracked manually via paper notes or memory, causing frequent stock discrepancies between physical shelves and logbooks, with out-of-stock items noticed only after a customer requested them. Additionally, owners struggled to determine actual monthly net profit because operational overheads (rent, electricity, admin fees, urgent store costs) were never consolidated against gross revenue, and local neighbors lacked an online ordering channel for home delivery.',
    solution:
      'Sistem informasi e-commerce sembako dan rantai pasok terintegrasi berbasis web dengan arsitektur 3 hak akses terproteksi (Customer, Admin/Penjaga Toko, dan Owner/Pemilik Toko). Customer dapat menjelajahi etalase sembako interaktif dengan banner promo countdown timer, memfilter produk berdasarkan rentang harga, rating bintang, dan ketersediaan stok, memesan via keranjang belanja, serta memilih pembayaran Midtrans (QRIS/Transfer) atau COD dengan pelacakan status pesanan. Admin toko dibekali panel kelola produk (harga modal, harga jual, estimasi laba), kategori, dan sistem inventaris 3 alur (Stok Masuk, Stok Keluar, dan Stok Opname untuk mencatat selisih stok fisik vs sistem secara berkala). Owner memiliki dasbor analitik eksekutif yang secara otomatis menghitung laba bersih bulanan (omzet penjualan dikurangi biaya operasional), visualisasi tren penjualan, laporan produk terlaris, serta ekspor dokumen resmi format PDF dan Excel.',
    solution_en:
      'An integrated web-based grocery e-commerce and supply chain information system featuring a secure 3-role access architecture (Customer, Admin/Store Staff, and Owner). Customers browse an interactive grocery storefront with countdown promo banners, filter goods by price sliders, star ratings, and stock availability, place cart orders, and choose Midtrans (QRIS/Bank Transfer) or COD checkout with live order tracking. Admin staff manage product pricing (cost price, retail price, unit margin), categories, and a 3-flow inventory engine (Stock In, Stock Out, and Stock Opname to reconcile physical shelf vs recorded discrepancies). The Owner commands an executive analytics dashboard that automatically calculates net monthly profit (sales revenue minus operational overheads), charts sales trends, identifies best-selling SKUs, and exports formal PDF and Excel reports.',
    features: [
      'Katalog Sembako & Filter Multi-Kriteria: Etalase produk kebutuhan pokok berfilter kategori (Bahan Pokok, Snack, Minuman, Obat, Alat Mandi) dengan slider rentang harga, rating bintang, ketersediaan stok, serta banner promo countdown timer',
      'Checkout Fleksibel & Multi-Metode Pembayaran: Keranjang belanja dinamis terintegrasi Payment Gateway Midtrans (Snap QRIS/Transfer Bank) dan opsi Bayar di Tempat (COD) disertai pelacakan status pesanan (Pending, Dikirim, Diterima)',
      'Sistem Inventaris 3 Alur (Masuk, Keluar, Opname): Manajemen mutasi stok barang masuk dari pemasok, pengurangan otomatis stok keluar transaksi, dan form Stok Opname untuk menghitung dan mencatat histori selisih fisik vs sistem',
      'Monitoring Modal & Margin Laba Otomatis: Pencatatan harga pokok modal versus harga jual per item, dilengkapi kartu ringkasan finansial inventaris toko (Total Modal Rp 93.767.500 dan Total Laba Rp 9.533.000)',
      'Dasbor Eksekutif & Kalkulasi Laba Bersih Owner: Analisis profitabilitas riil yang memotong pendapatan kotor dengan rincian biaya operasional bulanan (biaya admin, biaya urgent), grafik tren penjualan harian, dan identifikasi produk terlaris',
      'Ekspor Laporan Komprehensif (PDF & Excel): Ekspor satu klik laporan riwayat transaksi penjualan, rekapitulasi mutasi stok barang, dan laporan keuntungan per periode ke dalam dokumen PDF siap cetak dan spreadsheet Excel',
    ],
    features_en: [
      'Interactive Grocery Catalog & Multi-Criteria Filters: Categorized storefront (Staples, Snacks, Beverages, Medicine, Toiletries) with price sliders, star ratings, stock status, and promo banners with live countdown timers',
      'Flexible Checkout & Multi-Channel Payments: Dynamic shopping cart integrated with Midtrans Payment Gateway (Snap QRIS/Bank Transfer) and Cash on Delivery (COD) alongside real-time order status tracking (Pending, Shipped, Delivered)',
      '3-Flow Inventory Engine (In, Out, Stock-Take): Incoming stock logging from suppliers, automated outgoing sales deduction, and a dedicated Stock Opname module recording discrepancies between physical shelf counts and system logs',
      'Automated Capital & Profit Margin Monitoring: Unit cost vs retail price tracking per SKU, featuring financial inventory cards displaying Total Capital (Rp 93,767,500) and Total Estimated Profit (Rp 9,533,000)',
      'Executive Owner Dashboard & Net Profit Calculation: Real profitability analytics subtracting recorded monthly operating costs (admin fees, urgent overheads) from gross sales, daily trend charts, and best-seller SKU rankings',
      'Comprehensive Report Exports (PDF & Excel): One-click export of sales transaction histories, inventory stock audit logs, and monthly profit-and-loss summaries into printable PDF documents and Excel spreadsheets',
    ],
    outcome:
      'Sistem berhasil diselesaikan melalui seluruh siklus pengembangan (analisis kebutuhan UMKM sembako, perancangan DFD Level 0–2, perancangan ERD 10 tabel basis data, implementasi Laravel & MySQL, hingga pengujian sistem). Berhasil lulus 18 dari 18 skenario pengujian black-box testing mencakup seluruh fungsionalitas Customer, Admin, dan Owner tanpa kendala kritis. Sistem ini sukses meminimalisir selisih stok fisik, mengotomatiskan kalkulasi laba bersih riil warung sembako, dan menjadi portofolio aplikatif yang dipresentasikan dalam Laporan Praktik Kerja Lapangan di Dinas Kominfo Kabupaten Kediri.',
    outcome_en:
      'Successfully delivered through the complete engineering lifecycle (grocery MSME requirement gathering, DFD Level 0–2 modeling, 10-table ERD database schema, Laravel & MySQL implementation, and comprehensive testing). Achieved a 100% pass rate across 18/18 black-box testing scenarios across all Customer, Admin, and Owner modules without critical defects. The system effectively eliminated shelf stock discrepancies, automated real net-profit accounting for the grocery merchant, and served as an applied portfolio milestone presented in the official PKL Report at Diskominfo Kediri.',
    gallery: [
      {
        url: 'https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/1f7e40d8-d711-40e1-b883-d5ca77e1d0ee.webp',
        caption: 'Halaman katalog',
        caption_en: 'Catalog page',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: 'https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/7826dda2-2b36-452a-9a77-d89109b3ed76.webp',
        caption: 'Halaman data produk',
        caption_en: 'Product data page',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: 'https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/5f1229e8-642f-4c68-8d3b-8a26abad02e5.webp',
        caption: 'Halaman stok masuk',
        caption_en: 'Incoming stock page',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: 'https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/818bb00e-f210-42c5-9ed6-39906962c061.webp',
        caption: 'Halaman stok keluar',
        caption_en: 'Outgoing stock page',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: 'https://lgmmoqnoareadpmjmyyy.supabase.co/storage/v1/object/public/portfolio-assets/gallery/d1539dbe-bd10-46b2-8f73-d3ccf36dc977.webp',
        caption: 'Halaman kategori',
        caption_en: 'Category page',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: '/projects/raw/madura_use_case.webp',
        caption:
          'Diagram Use Case Sistem: Pemetaan interaksi 3 peran pengguna (Customer: katalog, keranjang, Midtrans & COD; Admin: CRUD produk, stok masuk/keluar/opname; Owner: laporan laba dan data user).',
        caption_en:
          'System Use Case Diagram: Interaction mapping across 3 user roles (Customer: catalog, cart, Midtrans & COD; Admin: CRUD products, stock flows; Owner: profit reports and user data).',
        kind: 'diagram',
        label: 'Use Case',
        label_en: 'Use Case',
        device: 'web',
      },
      {
        url: '/projects/raw/madura_erd.webp',
        caption:
          'Entity Relationship Diagram (ERD): Skema basis data relasional 11 tabel mencakup users, produk, kategori, transaksi, detail_transaksi, stokmasuk, stokkeluar, stokopname, stokhistori, stokhistoriopname, dan biaya_operasional.',
        caption_en:
          'Entity Relationship Diagram (ERD): 11-table relational database schema covering users, products, categories, transactions, transaction details, stock in/out/take, history, stock take history, and operational costs.',
        kind: 'diagram',
        label: 'ERD Basis Data',
        label_en: 'Database ERD',
        device: 'web',
      },
      {
        url: '/projects/raw/madura_dfd.webp',
        caption:
          'Data Flow Diagram Lengkap: Aliran data level 0 (konteks), level 1 (manajemen user, produk, transaksi, stok, laporan), dan level 2 (alur pesanan, kelola stok, laporan laba).',
        caption_en:
          'Complete Data Flow Diagram: Level 0 context diagram, Level 1 core processes, and Level 2 detailed flows for ordering, stock reconciliation, and profit reporting.',
        kind: 'diagram',
        label: 'DFD (Level 0 - 2)',
        label_en: 'DFD (Level 0 - 2)',
        device: 'web',
      },
    ],
  },
  'sim-absensi-mts-suguja': {
    title: 'SIM Absensi MTs Suguja: Dasbor Admin Sekolah',
    title_en: 'MTs Suguja Attendance System: School Admin Dashboard',
    thumbnail_url: '/projects/sim-absensi-mts-cover.webp',
    description:
      'Dasbor admin berbasis Flutter (web dan desktop) untuk MTs Sunan Gunung Jati: pengelolaan data guru, kelas, dan siswa, rekap presensi harian dan bulanan, verifikasi surat izin dan sakit dari wali murid, kartu QR presensi siswa, serta pengumuman ke HP wali murid lewat OneSignal Push dan WhatsApp. Terhubung dengan aplikasi mobile guru dan orang tua melalui satu basis data Supabase.',
    description_en:
      'A Flutter admin dashboard (web and desktop) for MTs Sunan Gunung Jati: teacher, class, and student records, daily and monthly attendance recaps, review of sick and leave letters sent by parents, student QR attendance cards, and announcements to parents\' phones via OneSignal Push and WhatsApp. It shares one Supabase database with the teacher and parent mobile app.',
    my_role:
      'Anggota Tim Pengembang (tim 5 mahasiswa): membangun halaman Data Guru (tabel guru dengan avatar, form tambah dan edit, serta dialog hapus) dan halaman Data Absensi (daftar presensi, form koreksi status kehadiran, tanggal, waktu masuk dan pulang, serta keterangan) yang membaca dan menulis langsung ke Supabase, lengkap dengan pesan berhasil atau gagal dan tampilan saat data kosong.',
    my_role_en:
      'Development Team Member (5-student team): built the Teacher Data page (teacher table with avatars, add and edit forms, delete dialog) and the Attendance Data page (attendance list, correction form for attendance status, date, check-in and check-out time, and notes) that read and write directly to Supabase, with success and error messages and an empty state.',
    background:
      'MTs Sunan Gunung Jati (Suguja) membutuhkan presensi digital yang menghubungkan sekolah, guru, dan wali murid. Proyek ini dikerjakan tim 5 mahasiswa mulai Oktober 2025 sebagai bagian dari dua aplikasi yang saling terhubung: aplikasi mobile untuk guru (memindai QR presensi siswa) dan orang tua (mengajukan surat izin), serta dasbor admin ini sebagai pusat pengelolaan data sekolah. Keduanya memakai satu basis data Supabase.',
    background_en:
      'MTs Sunan Gunung Jati (Suguja) needed digital attendance that connects the school, its teachers, and parents. A team of 5 students built it starting in October 2025 as two connected apps: a mobile app for teachers (scanning student QR codes) and parents (submitting leave letters), and this admin dashboard as the school\'s data hub. Both share one Supabase database.',
    problem:
      'Presensi siswa dicatat di lembar kertas per kelas, sehingga rekap harian dan bulanan harus dihitung manual dan sulit dipantau lintas kelas. Surat izin dan sakit datang dalam bentuk kertas yang mudah tercecer dan tidak langsung masuk ke rekap kehadiran. Wali murid juga tidak segera tahu bila anaknya terlambat atau tidak hadir, dan pengumuman sekolah masih disebar satu per satu lewat grup chat.',
    problem_en:
      'Attendance was recorded on paper sheets per class, so daily and monthly recaps were counted by hand and hard to follow across classes. Sick and leave letters arrived on paper, got lost easily, and never reached the attendance recap directly. Parents did not find out quickly when their child was late or absent, and school announcements were still passed around one chat group at a time.',
    solution:
      'Dasbor admin Flutter yang berjalan di browser dan desktop Windows, terhubung ke Supabase (PostgreSQL, Auth, Storage, Realtime). Admin mengelola data guru, kelas (wali kelas, jam masuk dan pulang), dan siswa (aktif, lulus, pindah) dengan impor Excel dan kenaikan kelas massal. Presensi yang dikirim guru dari aplikasi mobile langsung muncul di dasbor, bisa dikoreksi admin, dan direkap per hari, per bulan, dan per semester. Surat izin dan sakit dari wali murid diperiksa di satu halaman dan bisa dicadangkan ke ZIP. Halaman Notifikasi mengirim pengumuman ke semua wali murid, per kelas, atau per siswa lewat OneSignal Push, WhatsApp, atau keduanya.',
    solution_en:
      'A Flutter admin dashboard that runs in the browser and on Windows desktop, backed by Supabase (PostgreSQL, Auth, Storage, Realtime). Admins manage teachers, classes (homeroom teacher, check-in and check-out times), and students (active, graduated, transferred), with Excel import and bulk class promotion. Attendance sent by teachers from the mobile app shows up on the dashboard right away, can be corrected by the admin, and is recapped per day, month, and semester. Sick and leave letters from parents are reviewed on one page and can be backed up to a ZIP file. The Notifications page sends announcements to all parents, one class, or one student via OneSignal Push, WhatsApp, or both.',
    features: [
      'Dasbor ringkasan yang diperbarui otomatis: kehadiran hari ini, terlambat, absen (sakit, izin, alfa), total siswa aktif, rekap semester, grafik kehadiran, dan distribusi per kelas',
      'Data guru, kelas, dan siswa: wali kelas, jam masuk dan pulang per kelas, status siswa (aktif, lulus, pindah), impor Excel, dan kenaikan kelas massal',
      'Presensi harian dan rekap bulanan dengan filter tanggal dan kelas, koreksi status oleh admin (waktu masuk, waktu pulang, keterangan, pencatat perubahan), serta ekspor Excel, CSV, dan PDF',
      'Kartu QR presensi per siswa yang dicetak per kelas ke PDF, untuk dipindai guru lewat aplikasi mobile',
      'Pemeriksaan surat izin dan sakit dari wali murid dengan pratinjau lampiran, filter jenis dan tanggal, serta cadangan ZIP',
      'Pusat notifikasi: pengumuman ke semua wali murid, per kelas, atau per siswa lewat OneSignal Push, WhatsApp, atau keduanya, dengan template pesan, riwayat kiriman, dan uji koneksi gateway',
    ],
    features_en: [
      'Self-updating summary dashboard: today\'s attendance, late arrivals, absences (sick, leave, unexcused), active students, semester recap, attendance chart, and per-class distribution',
      'Teacher, class, and student records: homeroom teachers, check-in and check-out times per class, student status (active, graduated, transferred), Excel import, and bulk class promotion',
      'Daily attendance and monthly recap with date and class filters, admin corrections (check-in, check-out, notes, who changed it), and Excel, CSV, and PDF export',
      'QR attendance card for every student, printed per class to PDF, for teachers to scan with the mobile app',
      'Review of sick and leave letters from parents with attachment preview, type and date filters, and ZIP backup',
      'Notification center: announcements to all parents, one class, or one student via OneSignal Push, WhatsApp, or both, with message templates, send history, and a gateway connection test',
    ],
    outcome:
      'Dasbor berjalan di browser dan desktop Windows dengan data 77 siswa aktif di 8 rombel kelas (7A sampai 9C) beserta guru dan wali kelasnya. Presensi dari aplikasi guru langsung terekap tanpa hitung manual, surat izin dan sakit tercatat bersama data kehadiran, dan sekolah punya jalur pengumuman langsung ke HP wali murid. Kodenya disusun berlapis (core, data, logic, presentation) dengan cache stale-while-revalidate untuk data master, serta dilengkapi unit test dan widget test.',
    outcome_en:
      'The dashboard runs in the browser and on Windows desktop with 77 active students in 8 class groups (7A to 9C), along with their teachers and homeroom teachers. Attendance from the teacher app is recapped without manual counting, sick and leave letters sit next to the attendance data, and the school has a direct announcement channel to parents\' phones. The code is layered (core, data, logic, presentation) with a stale-while-revalidate cache for master data, plus unit and widget tests.',
    gallery: [
      {
        url: '/projects/raw/simabsensi_dashboard.webp',
        caption:
          'Dashboard Admin: Ringkasan kehadiran hari ini, rekap semester, grafik statistik kehadiran, dan distribusi siswa per kelas.',
        caption_en:
          'Admin Dashboard: Today\'s attendance summary, semester recap, attendance chart, and student distribution per class.',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: '/projects/raw/simabsensi_data_siswa.webp',
        caption:
          'Data Siswa: Filter kelas, nama, dan status, dengan tombol impor Excel, kenaikan kelas massal, dan cetak QR Code per kelas.',
        caption_en:
          'Student Data: Class, name, and status filters, with Excel import, bulk class promotion, and per-class QR code printing.',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: '/projects/raw/simabsensi_notifikasi.webp',
        caption:
          'Pusat Notifikasi: Kirim pengumuman ke semua wali murid, per kelas, atau per siswa lewat OneSignal Push, WhatsApp, atau keduanya.',
        caption_en:
          'Notification Center: Send announcements to all parents, one class, or one student via OneSignal Push, WhatsApp, or both.',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: '/projects/raw/simabsensi_surat.webp',
        caption:
          'Data Surat Siswa: Arsip surat izin dan sakit dari wali murid dengan filter jenis dan tanggal, pratinjau lampiran, dan cadangan ZIP.',
        caption_en:
          'Student Letters: Archive of sick and leave letters from parents with type and date filters, attachment preview, and ZIP backup.',
        kind: 'gallery',
        device: 'web',
      },
      {
        url: '/projects/raw/simabsensi_data_kelas.webp',
        caption: 'Data Kelas: Daftar rombel dengan wali kelas serta jam masuk dan jam pulang masing-masing kelas.',
        caption_en: 'Class Data: Class groups with their homeroom teacher and check-in and check-out times.',
        kind: 'gallery',
        device: 'web',
      },
    ],
  },
  'mobile-absensi-mts-suguja': {
    title: 'Mobile Absensi MTs Suguja: Aplikasi Guru dan Wali Murid',
    title_en: 'MTs Suguja Attendance Mobile: Teacher and Parent App',
    thumbnail_url: '/projects/mobile-absensi-mts-cover.webp',
    description:
      'Aplikasi mobile Flutter (Android dan iOS) untuk presensi MTs Sunan Gunung Jati dengan tiga peran dalam satu aplikasi: petugas gerbang memindai kartu QR siswa, guru dan wali kelas memantau kehadiran per kelas dan menyetujui surat izin atau sakit, serta wali murid melihat status kehadiran anaknya dan mengajukan surat dari HP. Notifikasi dikirim lewat OneSignal, dan datanya satu basis data Supabase dengan dasbor admin sekolah.',
    description_en:
      'A Flutter mobile app (Android and iOS) for attendance at MTs Sunan Gunung Jati with three roles in one app: gate staff scan student QR cards, teachers and homeroom teachers follow attendance per class and approve sick or leave letters, and parents check their child\'s attendance and submit letters from their phone. Notifications go out through OneSignal, and the app shares one Supabase database with the school\'s admin dashboard.',
    my_role:
      'Anggota Tim Pengembang (tim 5 mahasiswa), satu proyek dengan dasbor admin SIM Absensi: membangun halaman Data Guru (tabel guru dengan avatar, form tambah dan edit, serta dialog hapus) dan halaman Data Absensi (daftar presensi, form koreksi status kehadiran, tanggal, waktu masuk dan pulang, serta keterangan) di dasbor admin, yang membaca dan menulis langsung ke basis data Supabase yang juga dipakai aplikasi mobile ini.',
    my_role_en:
      'Development Team Member (5-student team), one project with the SIM Absensi admin dashboard: built the Teacher Data page (teacher table with avatars, add and edit forms, delete dialog) and the Attendance Data page (attendance list, correction form for attendance status, date, check-in and check-out time, and notes) in the admin dashboard, which read and write directly to the Supabase database this mobile app also uses.',
    background:
      'Sistem presensi MTs Sunan Gunung Jati (Suguja) terdiri dari dua aplikasi yang memakai satu basis data Supabase: dasbor admin untuk mengelola data sekolah, dan aplikasi mobile ini untuk orang-orang yang setiap hari terlibat langsung dengan kehadiran siswa, yaitu petugas di gerbang, guru dan wali kelas, serta orang tua. Pengembangannya dimulai Oktober 2025 oleh tim 5 mahasiswa.',
    background_en:
      'The attendance system of MTs Sunan Gunung Jati (Suguja) is made of two apps sharing one Supabase database: an admin dashboard to manage school data, and this mobile app for the people who deal with student attendance every day: gate staff, teachers and homeroom teachers, and parents. A team of 5 students started building it in October 2025.',
    problem:
      'Presensi dicatat manual di lembar kertas per kelas, sehingga guru baru tahu siapa yang terlambat atau tidak hadir setelah lembar itu dihitung. Orang tua tidak segera tahu apakah anaknya sudah sampai di sekolah. Surat izin dan sakit dititipkan dalam bentuk kertas, mudah tercecer, dan status kehadirannya harus diubah satu per satu. Guru juga tidak selalu berada di depan komputer untuk membuka dasbor sekolah.',
    problem_en:
      'Attendance was written by hand on a paper sheet per class, so teachers only knew who was late or absent after the sheet was counted. Parents did not find out quickly whether their child had reached school. Sick and leave letters were handed over on paper, got lost easily, and the attendance status had to be changed one student at a time. Teachers were also not always at a computer to open the school dashboard.',
    solution:
      'Satu aplikasi Flutter yang memilih tampilan sesuai peran saat login. Petugas gerbang memakai pemindai QR kontinu: kartu siswa cukup didekatkan ke kamera, status Hadir atau Terlambat ditentukan dari jam masuk kelas, dan pindaian kedua dicatat sebagai pulang. Guru masuk dengan email dan melihat ringkasan kelas yang diampu, daftar presensi per kelas, form koreksi status dengan catatan, dan halaman persetujuan surat yang otomatis memperbarui presensi. Wali murid masuk cukup dengan NIS anak, bisa menambah lebih dari satu anak, lalu melihat status hari ini, rekap dan grafik bulanan, pengumuman sekolah, dan mengajukan surat dengan foto lampiran. Notifikasi presensi dan status surat dikirim lewat OneSignal melalui Supabase Edge Function.',
    solution_en:
      'One Flutter app that picks its screens by role at login. Gate staff use a continuous QR scanner: students hold their card up to the camera, Present or Late is set from the class check-in time, and a second scan records check-out. Teachers sign in with email and see a summary of the classes they teach, the attendance list per class, a status correction form with notes, and a letter approval page that updates attendance automatically. Parents sign in with just their child\'s student ID (NIS), can add more than one child, and then see today\'s status, the monthly recap and chart, school announcements, and submit letters with a photo attachment. Attendance and letter notifications are sent through OneSignal via a Supabase Edge Function.',
    features: [
      'Pemindai QR kontinu untuk petugas gerbang: tanpa berhenti di tiap siswa, jeda per NIS agar tidak tercatat ganda, status Hadir, Terlambat, atau Pulang otomatis, animasi laser, getar, senter, dan ganti kamera',
      'Dasbor guru: persentase kehadiran hari ini, ringkasan per kelas yang diampu (hadir, telat, sakit, izin, alfa), penanda surat yang menunggu, dan pembaruan otomatis',
      'Daftar presensi per kelas dengan pencarian dan filter status, serta koreksi status manual lewat tombol cepat dan catatan guru',
      'Persetujuan surat izin dan sakit: tab Menunggu, Disetujui, Ditolak, dan Semua, foto lampiran yang bisa diperbesar, catatan untuk orang tua, dan presensi yang ikut diperbarui',
      'Portal wali murid dengan login NIS: beberapa anak dalam satu akun, kartu status hari ini (jam masuk dan pulang), rekap dan grafik kehadiran bulanan, serta tombol WhatsApp ke wali kelas',
      'Pengajuan surat dari HP dengan rentang tanggal dan foto yang dikompres sebelum diunggah (wajib untuk surat sakit), pengumuman sekolah per kelas, dan notifikasi OneSignal',
    ],
    features_en: [
      'Continuous QR scanner for gate staff: no stopping per student, a per-NIS cooldown against double entries, automatic Present, Late, or Check-out status, laser animation, vibration, flashlight, and camera switch',
      'Teacher dashboard: today\'s attendance rate, a summary per class taught (present, late, sick, leave, unexcused), a badge for pending letters, and automatic refresh',
      'Attendance list per class with search and status filters, plus manual status correction with quick buttons and teacher notes',
      'Sick and leave letter approval: Pending, Approved, Rejected, and All tabs, zoomable photo attachments, a note for parents, and attendance updated along with it',
      'Parent portal with NIS login: several children in one account, today\'s status card (check-in and check-out time), monthly attendance recap and chart, and a WhatsApp button to the homeroom teacher',
      'Letter submission from the phone with a date range and a photo compressed before upload (required for sick letters), school announcements per class, and OneSignal notifications',
    ],
    outcome:
      'Satu aplikasi melayani tiga peran sekaligus, dan semua yang dicatat di HP langsung tampil di dasbor admin karena keduanya memakai basis data Supabase yang sama. Kehadiran tercatat saat siswa memindai kartu di gerbang, orang tua bisa memantau dan mengajukan surat tanpa datang ke sekolah, dan guru menyetujui surat langsung dari HP. Kodenya disusun per fitur (core, data, features), dan build Android memakai R8 untuk memperkecil ukuran APK. Tangkapan layar di galeri memakai data contoh, bukan data siswa asli.',
    outcome_en:
      'One app serves all three roles, and everything recorded on a phone shows up on the admin dashboard right away because both use the same Supabase database. Attendance is recorded when students scan their card at the gate, parents can follow attendance and submit letters without coming to school, and teachers approve letters straight from their phone. The code is organised by feature (core, data, features), and the Android build uses R8 to shrink the APK. The gallery screenshots use sample data, not real student records.',
    gallery: [
      {
        url: '/projects/raw/mobileabsensi_dashboard_guru.webp',
        caption:
          'Dashboard Guru: Persentase kehadiran hari ini, penanda surat yang menunggu persetujuan, dan ringkasan tiap kelas yang diampu.',
        caption_en:
          'Teacher Dashboard: Today\'s attendance rate, a badge for letters awaiting approval, and a summary of every class taught.',
        kind: 'gallery',
        device: 'mobile',
      },
      {
        url: '/projects/raw/mobileabsensi_scanner_qr.webp',
        caption:
          'Pemindai Presensi QR: Kartu pelajar dipindai di gerbang dan status Hadir Tepat Waktu langsung muncul tanpa menutup kamera.',
        caption_en:
          'QR Attendance Scanner: A student card is scanned at the gate and the On Time status appears without closing the camera.',
        kind: 'gallery',
        device: 'mobile',
      },
      {
        url: '/projects/raw/mobileabsensi_presensi_kelas.webp',
        caption:
          'Presensi Kelas: Daftar siswa dengan jam masuk, filter status, penanda surat, dan tombol koreksi status per siswa.',
        caption_en:
          'Class Attendance: Student list with check-in times, status filters, letter markers, and a correction button per student.',
        kind: 'gallery',
        device: 'mobile',
      },
      {
        url: '/projects/raw/mobileabsensi_persetujuan_surat.webp',
        caption:
          'Persetujuan Izin / Sakit: Surat dari wali murid dengan foto lampiran yang bisa diperbesar, lalu disetujui atau ditolak guru.',
        caption_en:
          'Leave / Sick Approval: Letters from parents with a zoomable photo attachment, approved or rejected by the teacher.',
        kind: 'gallery',
        device: 'mobile',
      },
      {
        url: '/projects/raw/mobileabsensi_wali_murid.webp',
        caption:
          'Portal Wali Murid: Status kehadiran anak hari ini, jam masuk dan pulang, pengajuan surat, pengumuman, dan kontak wali kelas.',
        caption_en:
          'Parent Portal: The child\'s attendance today, check-in and check-out time, letter submission, announcements, and the homeroom teacher\'s contact.',
        kind: 'gallery',
        device: 'mobile',
      },
    ],
  },
}

/**
 * Apply overrides to a project row if an override exists for its slug.
 */
export function enrichProject(row) {
  if (!row?.slug) return row
  const override = PROJECT_OVERRIDES[row.slug]
  if (!override) return row
  return {
    ...row,
    ...override,
  }
}

export const EXPERIENCE_OVERRIDES = {
  // Web Developer Intern · Dinas Komunikasi dan Informatika Kabupaten Kediri
  '56438a24-ae97-4007-989b-3c08e589f948': {
    description:
      'Praktik Kerja Lapangan (PKL) di Diskominfo Kabupaten Kediri bersama tim 3 mahasiswa Politeknik Negeri Malang, berfokus pada pengembangan sistem web e-commerce & rantai pasok Madura Mart serta dukungan infrastruktur portal Pemkab Kediri.',
    description_en:
      'Internship (PKL) at Kediri Regency Communication and Informatics Office with a team of 3 students from Politeknik Negeri Malang, focusing on web e-commerce & supply chain development for Madura Mart and municipal portal infrastructure support.',
  },
  // Programmer Intern · CV Adisatya IT Consultant
  '0bb89873-2bb2-480d-a377-c29d37bd0d3e': {
    description:
      'Magang industri di CV Adisatya IT Consultant, berkontribusi dalam perancangan UI/UX dan frontend konsol web serta pengembangan aplikasi mobile pencatatan bukti packing paket marketplace (kini dirilis sebagai Jeejak).',
    description_en:
      'Industrial internship at CV Adisatya IT Consultant, contributing to the UI/UX and web console frontend design as well as the mobile operator app for marketplace parcel packing verification (now released as Jeejak).',
  },
}

export function enrichExperience(row) {
  if (!row?.id) return row
  const override = EXPERIENCE_OVERRIDES[row.id]
  if (!override) return row
  return {
    ...row,
    ...override,
  }
}

export const EDUCATION_OVERRIDES = {
  // Diploma III (D3) · Politeknik Negeri Malang
  '950e0792-31fa-40d2-8c9d-74c5920f65af': {
    description:
      'Menempuh studi D3 Manajemen Informatika PSDKU Kota Kediri dengan fokus rekayasa perangkat lunak web dan mobile, perancangan basis data relasional, serta perancangan sistem monitoring berbasis pemindaian barcode.',
    description_en:
      'Studied D3 Informatics Management at PSDKU Kediri, focusing on web & mobile software engineering, relational database design, and barcode scanning-based monitoring systems.',
  },
}

export function enrichEducation(row) {
  if (!row?.id) return row
  const override = EDUCATION_OVERRIDES[row.id]
  if (!override) return row
  return {
    ...row,
    ...override,
  }
}

