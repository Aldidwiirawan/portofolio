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
