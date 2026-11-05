BEGIN;

-- ==============================================================================
-- Seed: proyek dan pengalaman tambahan (bukan migrasi)
-- Tanggal: 2026-10-28
-- Jalankan di Supabase SQL Editor SETELAH semua migrasi, termasuk
-- 20261018000000_project_links.sql dan 20261019000000_english_content.sql.
--
-- Isinya
-- 1. Proyek AyamBebek (slug ayambebek) menjadi "Jeejak: Konsol Web Bukti Packing" (slug
--    jeejak-console). Cover, galeri, dan penjelasan lengkap tidak diubah.
-- 2. Proyek baru JejakPaket (aplikasi mobile) dan Dwijaya Coffee. Dilewati bila slug, judul yang
--    mirip, atau tautan kodenya sudah ada.
-- 3. Madura Mart diperbarui (slug tetap). Website Portofolio Pribadi tidak lagi unggulan.
--    Urutan proyek: Jeejak, JejakPaket, Dwijaya Coffee, Madura Mart, Portofolio, SI-Arsip.
-- 4. Pengalaman CV Adisatya IT Consultant dan Diskominfo Kabupaten Kediri: poin tugas (ID dan EN)
--    diganti seluruhnya; Diskominfo mendapat tag SSL dan Bootstrap (tag lama tetap).
-- 5. Keahlian Midtrans (Backend, bukan unggulan, paling akhir di kategorinya), bila belum ada.
--
-- Format yang disimpan (sama dengan form admin)
-- - Status dan jenis proyek memakai kode: production, completed, web, mobile.
-- - Urutan memakai sort_order mulai 0, seperti tombol Naik/Turun di admin: urutan 1 = 0,
--   urutan 6 = 5. Query cek di bawah menampilkan urutan mulai 1.
-- - Tautan: { label, label_en, type, url, is_private }. Tautan privat tanpa alamat disimpan dengan
--   url null. Setelah tautan diisi, github_url, demo_url, dan "repo privat" diselaraskan seperti
--   saat menyimpan di admin: github_url = tautan code pertama yang tidak privat, demo_url = tautan
--   demo pertama yang tidak privat (keduanya NULL bila tidak ada), repo privat = semua tautan code
--   privat.
-- - Kolom gambar (cover, galeri, logo) dan tabel profiles tidak disentuh.
--
-- Aman dijalankan ulang: UPDATE mencari baris lewat slug atau judul dan mengisi nilai yang sama,
-- INSERT memakai WHERE NOT EXISTS. Satu transaksi: bila satu perintah gagal, tidak ada yang
-- berubah. Query setelah COMMIT menampilkan semua proyek, poin tugas per pengalaman, dan Midtrans.
-- ==============================================================================


-- ==============================================================================
-- 1. PROYEK: AyamBebek → Jeejak (konsol web)
-- ==============================================================================
-- Dicari lewat slug lama/baru atau judul lama/baru; slug baru didahulukan saat dijalankan ulang.
UPDATE public.projects
SET
  slug = 'jeejak-console',
  title = 'Jeejak: Konsol Web Bukti Packing',
  title_en = 'Jeejak: Packing Proof Web Console',
  description = 'Platform konsol web untuk seller Shopee dan TikTok Shop: integrasi pesanan via Excel/PDF resi, pemantauan antrean kemas real-time, dan arsip bukti packing sah untuk perlindungan klaim sengketa marketplace. Dikembangkan versi awalnya saat magang, kini dirilis resmi oleh CV Adisatya IT Consultant sebagai Jeejak (jeejak.id).',
  description_en = 'A web console platform for Shopee and TikTok Shop sellers: bulk order import via Excel/PDF shipping labels, real-time packing queue tracking, and verified packing proof archives for marketplace dispute claims. I co-developed its initial version during my internship, now officially released by CV Adisatya IT Consultant as Jeejak (jeejak.id).',
  status = 'production',
  year = 2026,
  project_type = 'web',
  client_name = 'CV Adisatya IT Consultant (awalnya untuk AyamBebek Pakan dan Ternak)',
  client_name_en = 'CV Adisatya IT Consultant (first built for AyamBebek Pakan dan Ternak)',
  my_role = 'Frontend & UI/UX Engineer (versi awal): merancang arsitektur antarmuka dan design system di Figma, membangun halaman web responsif dengan HTML, Jinja2, dan Tailwind CSS, mengembangkan dasbor antrean kemas & analitik performa, serta mengimplementasikan sinkronisasi REST API data scan resi dari aplikasi operator ke server bersama tim magang di CV Adisatya IT Consultant (Jan – Jul 2026).',
  my_role_en = 'Front End & UI/UX Engineer (early version): designed interface layouts and operational workflows in Figma, built responsive web pages with HTML, Jinja2, and Tailwind CSS, developed packing queue dashboards & performance analytics, and implemented REST API sync for scanned shipping label data from the mobile operator app to the server during my internship at CV Adisatya IT Consultant (Jan – Jul 2026).',
  background = 'Dikerjakan saat magang sebagai Programmer Intern di CV Adisatya IT Consultant (Jan – Jul 2026). Proyek ini berawal dari kebutuhan toko retail pilot (AyamBebek Pakan dan Ternak) dengan volume 20–100 pesanan per hari dan 7 operator gudang, yang memerlukan sistem dokumentasi bukti packing terpusat untuk meminimalisir kerugian akibat sengketa klaim marketplace. Sistem ini kemudian disempurnakan oleh tim CV Adisatya dan diluncurkan ke publik sebagai platform SaaS Jeejak (jeejak.id).',
  background_en = 'Developed during my internship as a Programmer Intern at CV Adisatya IT Consultant (Jan – Jul 2026). The project began from the operational needs of a pilot retail store (AyamBebek) handling 20–100 daily orders with 7 warehouse operators, needing a centralized packing proof documentation system to prevent financial losses from marketplace claim disputes. The system was subsequently refined by CV Adisatya and launched publicly as the SaaS platform Jeejak (jeejak.id).',
  problem = 'Status pengiriman sebelumnya dicatat manual di spreadsheet Excel, sedangkan foto bukti kemas dan serah terima kurir tercecer di grup WhatsApp dan galeri HP pribadi operator. Saat pembeli marketplace mengajukan komplain barang rusak atau paket kosong, pencarian satu riwayat nomor resi memakan waktu hingga 3 hari, sering kali berujung penolakan klaim karena bukti tidak valid.',
  problem_en = 'Shipping statuses were previously logged by hand in Excel spreadsheets, while photo proofs of packing and courier handovers were scattered across WhatsApp chats and personal phone galleries. When marketplace buyers filed damage or missing-item claims, retrieving a single tracking history took up to 3 days, frequently resulting in rejected claims due to unverified documentation.',
  solution = 'Konsol web terpadu yang mengimpor pesanan Shopee & TikTok Shop dari Excel/CSV dan PDF resi, menampilkan antrean pesanan siap kemas, dan mengarsipkan foto bukti packing per koli dengan timestamp verifikasi. Konsol ini juga menyediakan dasbor analitik penjualan, manajemen toko dan hak akses multi-peran (Owner, Admin, Operator), serta ekspor laporan ringkasan bukti packing PDF yang siap diunggah sebagai bukti sah banding marketplace.',
  solution_en = 'A unified web console that imports Shopee & TikTok Shop orders from Excel/CSV and shipping label PDFs, displays ready-to-pack queues, and archives photo proofs per parcel with verified timestamps. The console also features sales analytics dashboards, multi-role user management (Owner, Admin, Operator), and one-click PDF proof report exports ready for official marketplace dispute evidence.',
  features = ARRAY[
    'Impor pesanan massal dari file Excel/CSV dan PDF resi Shopee & TikTok Shop',
    'Dasbor antrean kemas real-time: Menunggu Kemas, Sedang Dikemas, dan Siap Kirim',
    'Pencarian instan dan verifikasi arsip bukti packing per nomor resi dalam hitungan detik',
    'Ekspor dokumen ringkasan bukti packing sah format PDF untuk klaim banding marketplace',
    'Manajemen toko dan hak akses pengguna bertingkat (Owner, Admin, Operator Gudang)',
    'Analitik operasional: volume pesanan harian, performa operator, dan kurir ekspedisi'
  ]::TEXT[],
  features_en = ARRAY[
    'Bulk order import from Shopee & TikTok Shop Excel/CSV and shipping label PDFs',
    'Real-time packing queue dashboard tracking Pending, Packing, and Ready to Ship statuses',
    'Instant search and retrieval of packing proof archives by tracking number in seconds',
    'Official PDF proof report export formatted for marketplace claim dispute submissions',
    'Multi-store management and role-based access control (Owner, Admin, Warehouse Operator)',
    'Operational analytics: daily order volume, operator performance, and courier distribution'
  ]::TEXT[],
  outcome = 'Versi awal sukses memangkas waktu pencarian bukti paket dari 3 hari menjadi hitungan detik di toko pilot AyamBebek. Sistem ini kemudian dikembangkan lebih lanjut oleh CV Adisatya IT Consultant menjadi produk komersial Jeejak (jeejak.id) yang kini melayani berbagai seller marketplace dengan skema paket gratis hingga berbayar.',
  outcome_en = 'The initial version successfully cut proof retrieval time from 3 days to mere seconds for the pilot client, AyamBebek. The system was subsequently expanded by CV Adisatya IT Consultant into the commercial product Jeejak (jeejak.id), now serving marketplace sellers across free and premium subscription tiers.',
  tech_stack = ARRAY['Figma', 'HTML', 'Tailwind CSS', 'JavaScript', 'Jinja2', 'FastAPI', 'SQLAlchemy', 'PostgreSQL']::TEXT[],
  links = '[
    {"label": "Situs produk (jeejak.id)", "label_en": "Product site (jeejak.id)", "type": "demo", "url": "https://jeejak.id", "is_private": false},
    {"label": "Konsol web (seller-integration)", "label_en": "Web console (seller-integration)", "type": "code", "url": null, "is_private": true}
  ]'::JSONB,
  is_featured = true,
  sort_order = 0,
  is_visible = true
WHERE id = (
  SELECT p.id
  FROM public.projects AS p
  WHERE p.slug IN ('jeejak-console', 'ayambebek')
    OR lower(btrim(p.title)) = lower('Jeejak: Konsol Web Bukti Packing')
    OR lower(btrim(p.title)) LIKE 'ayambebek:%'
  ORDER BY (p.slug = 'jeejak-console') DESC, (p.slug = 'ayambebek') DESC, p.created_at
  LIMIT 1
);


-- ==============================================================================
-- 2. PROYEK BARU: JejakPaket (aplikasi mobile)
-- ==============================================================================
-- Dilewati bila slug jejakpaket atau judul yang memuat "JejakPaket" sudah ada.
INSERT INTO public.projects (
  title, title_en, slug, description, description_en, status, year, project_type,
  client_name, client_name_en, my_role, my_role_en, background, background_en, problem, problem_en, solution, solution_en,
  features, features_en, outcome, outcome_en, tech_stack, links, is_featured, sort_order, is_visible
)
SELECT
  'JejakPaket: Aplikasi Operator Bukti Packing',
  'JejakPaket: Packing Proof App for Operators',
  'jejakpaket',
  'Aplikasi mobile operasional gudang berbasis Flutter (Android & iOS) untuk operator packing: pemindaian cepat barcode resi dengan deteksi kurir otomatis, alarm anti-scan ganda, pengambilan foto bukti packing, dan pencatatan serah terima kurir dengan mode offline-first. Bagian dari ekosistem Jeejak oleh CV Adisatya IT Consultant.',
  'A Flutter warehouse operations mobile app (Android & iOS) for packing operators: high-speed barcode scanning with auto-courier detection, anti-duplicate scan alarm, packing photo proof capture, and courier handover logging with offline-first support. Part of the Jeejak ecosystem by CV Adisatya IT Consultant.',
  'production', 2026, 'mobile',
  'CV Adisatya IT Consultant (awalnya untuk AyamBebek Pakan dan Ternak)',
  'CV Adisatya IT Consultant (first built for AyamBebek Pakan dan Ternak)',
  'Mobile Application Engineer (versi awal): ikut mengembangkan aplikasi mobile bersama tim programmer dengan Flutter & Dart, mengimplementasikan alur pemindaian barcode resi dengan auto-detect ekspedisi, pencegahan scan ganda, pengambilan foto bukti per koli paket, modul serah terima kurir, penyimpanan lokal (offline-first), dan sinkronisasi REST API ke server.',
  'Mobile Application Engineer (early version): co-developed the mobile app with the team using Flutter & Dart, implementing barcode scanning with auto courier detection, duplicate scan prevention, per-parcel photo capture, courier handover flow, offline-first local caching, and REST API sync to the server.',
  'Di lingkungan gudang operasional e-commerce yang sibuk dan berpindah-pindah, operator membutuhkan aplikasi mobile yang cepat, responsif, dan tidak bergantung pada sinyal internet yang tidak stabil. JejakPaket dirancang khusus sebagai aplikasi pendamping bagi operator di meja packing untuk mendokumentasikan setiap paket tanpa memperlambat ritme kerja fisik.',
  'In fast-paced, dynamic e-commerce warehouse environments, operators require a fast, responsive mobile tool that operates reliably regardless of unstable Wi-Fi or cellular connections. JejakPaket was designed specifically for packing bench operators to document every parcel without disrupting physical workflow speed.',
  'Operator packing sering kali salah memasukkan paket ke ekspedisi yang keliru, melakukan scan berulang (scan ganda) tanpa sadar, atau kehilangan bukti foto karena galeri HP bercampur dengan foto pribadi. Selain itu, sinyal gudang yang sering terputus membuat aplikasi web biasa sering macet saat operator harus memproses puluhan paket per jam.',
  'Packing operators frequently sorted parcels into the wrong courier bins, accidentally scanned packages twice, or misplaced evidence photos in crowded personal phone galleries. Additionally, weak warehouse wireless signals frequently caused standard web apps to stall while operators processed dozens of packages per hour.',
  'Aplikasi mobile Flutter dengan arsitektur offline-first dan alur terstruktur: Packing → Drop Kurir → Retur. Dilengkapi deteksi otomatis marketplace/ekspedisi dari nomor resi, alarm audio saat terjadi scan ganda, panduan foto bukti kondisi paket sebelum dan sesudah dipacking, serta antrean sinkronisasi latar belakang yang otomatis mengunggah data begitu internet tersedia.',
  'A Flutter mobile app featuring an offline-first architecture and structured workflow: Packing → Courier Handover → Returns. Equipped with automatic marketplace/courier recognition from barcode data, audio alarms for duplicate scans, photo capture guidelines, and a background sync queue that uploads data automatically when connectivity resumes.',
  ARRAY[
    'Scan resi kamera super cepat dengan auto-detect ekspedisi (J&T, SiCepat, JNE, SPX, dll.)',
    'Alarm peringatan instan (audio & visual) untuk mencegah scan paket berulang (anti-scan ganda)',
    'Pengambilan foto bukti isi paket dan segel kemasan langsung dengan watermark resi',
    'Operasional offline-first: tetap bekerja lancar di sudut gudang tanpa sinyal internet',
    'Modul serah terima kurir (Handover) per ekspedisi dengan pencatatan total koli',
    'Modul penerimaan retur paket dengan foto kondisi barang dan alasan ketidaksesuaian'
  ]::TEXT[],
  ARRAY[
    'High-speed camera barcode scanning with automatic courier identification (J&T, SiCepat, JNE, SPX, etc.)',
    'Instant audio & visual warning alarms preventing accidental duplicate scans',
    'Direct parcel content and sealed box photo capture with tracking number watermarking',
    'Offline-first operations: seamless workflow even in warehouse dead zones without internet',
    'Courier handover batching module per carrier with total parcel count verification',
    'Return management module capturing damaged parcel photos and discrepancy reasons'
  ]::TEXT[],
  'Mengurangi tingkat kesalahan kirim dan scan ganda secara signifikan di toko klien. Kini JejakPaket telah resmi didistribusikan di Google Play Store dan Apple App Store sebagai aplikasi mobile resmi ekosistem Jeejak.',
  'Significantly reduced mis-shipments and duplicate scans for the pilot client. JejakPaket is now officially distributed on Google Play Store and the Apple App Store as the mobile companion for the Jeejak ecosystem.',
  ARRAY['Flutter', 'Dart', 'REST API']::TEXT[],
  '[
    {"label": "Google Play", "label_en": "Google Play", "type": "demo", "url": "https://play.google.com/store/apps/details?id=id.jeejak.paket", "is_private": false},
    {"label": "App Store", "label_en": "App Store", "type": "demo", "url": "https://apps.apple.com/id/app/jejakpaket/id6820439104", "is_private": false},
    {"label": "Aplikasi mobile (ayambebekmobile)", "label_en": "Mobile app (ayambebekmobile)", "type": "code", "url": null, "is_private": true}
  ]'::JSONB,
  true, 1, true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.projects AS p
  WHERE p.slug = 'jejakpaket'
    OR lower(p.title) LIKE '%jejakpaket%'
);


-- ==============================================================================
-- 3. PROYEK BARU: Dwijaya Coffee
-- ==============================================================================
-- Dilewati bila slug dwijaya-coffee, judul yang memuat "Dwijaya", atau repo coffeeshop sudah
-- dipakai proyek lain (di github_url atau di daftar tautan).
INSERT INTO public.projects (
  title, title_en, slug, description, description_en, status, year, project_type,
  client_name, client_name_en, my_role, my_role_en, problem, problem_en, solution, solution_en,
  outcome, outcome_en, tech_stack, links, is_featured, sort_order, is_visible
)
SELECT
  'Dwijaya Coffee: Website Pemesanan Kafe',
  'Dwijaya Coffee: Café Ordering Website',
  'dwijaya-coffee',
  'Website kafe dengan katalog menu, keranjang, dan pembayaran online lewat Midtrans, plus panel Admin dan Owner untuk mengelola pesanan, produk, dan laporan penjualan. Proyek tim 4 orang yang saya pimpin di semester 4.',
  'A café website with a menu catalog, shopping cart, and online payment through Midtrans, plus Admin and Owner panels for managing orders, products, and sales reports. A four-person team project I led in my fourth semester.',
  'completed', 2025, 'web',
  'Dwijaya Coffee, Kediri (mitra proyek kuliah)',
  'Dwijaya Coffee, Kediri (course project partner)',
  'Ketua tim dari 4 orang. Memimpin perencanaan bersama pemilik kafe dan pembagian tugas, serta ikut mengerjakan semua bagian: halaman customer, panel Admin dan Owner, integrasi pembayaran Midtrans, dan laporan penjualan.',
  'Team lead of four. Led planning with the café owner and task assignment, and worked on every part: the customer pages, the Admin and Owner panels, the Midtrans payment integration, and the sales reports.',
  'Dwijaya Coffee membutuhkan website untuk menerima pesanan dan pembayaran online, sekaligus mencatat penjualan yang bisa dipantau langsung oleh pemilik.',
  'Dwijaya Coffee needed a website to take orders and payments online and to record sales the owner could monitor directly.',
  'Tiga peran pengguna. Customer: katalog dengan filter kategori dan pencarian, tanda "Sold Out" otomatis saat stok habis, keranjang, checkout dengan Midtrans (virtual account, GoPay/QRIS, dan kartu), serta riwayat pesanan. Admin: kelola pesanan dan statusnya, kategori, produk dan stok, serta struk transaksi. Owner: kelola pengguna, laporan penjualan dengan filter dan grafik, serta ekspor PDF dan CSV.',
  'Three user roles. Customers: a catalog with category filters and search, automatic "Sold Out" labels when stock runs out, a cart, Midtrans checkout (virtual account, GoPay/QRIS, and cards), and order history. Admins: order and status management, categories, products and stock, and transaction receipts. Owners: user management, sales reports with filters and charts, and PDF and CSV export.',
  'Sempat online sekitar satu tahun dan dicoba langsung oleh pemilik Dwijaya Coffee.',
  'The site was live for about a year and was tried out by the owner of Dwijaya Coffee.',
  ARRAY['PHP', 'Laravel', 'Blade', 'MySQL', 'Bootstrap', 'JavaScript', 'Midtrans']::TEXT[],
  '[
    {"label": "Kode (coffeeshop)", "label_en": "Code (coffeeshop)", "type": "code", "url": "https://github.com/Aldidwiirawan/coffeeshop", "is_private": false}
  ]'::JSONB,
  true, 2, true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.projects AS p
  WHERE p.slug = 'dwijaya-coffee'
    OR lower(p.title) LIKE '%dwijaya%'
    OR lower(rtrim(btrim(p.github_url), '/')) = 'https://github.com/aldidwiirawan/coffeeshop'
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p.links) AS l (item)
      WHERE lower(rtrim(btrim(l.item ->> 'url'), '/')) = 'https://github.com/aldidwiirawan/coffeeshop'
    )
);


-- ==============================================================================
-- 4. PROYEK: Madura Mart (slug tidak diubah)
-- ==============================================================================
UPDATE public.projects
SET
  title = 'Madura Mart: Sistem Data Produk dan Stok',
  title_en = 'Madura Mart: Product and Stock Management System',
  description = 'Panel admin berbasis web untuk mengelola produk, stok (masuk, keluar, dan opname), kategori, serta validasi transaksi Toko Madura Mart. Dibuat saat PKL di Diskominfo Kabupaten Kediri.',
  description_en = 'A web-based admin panel for managing products, stock (incoming, outgoing, and stock takes), categories, and order validation for the Madura Mart store. Built during my internship at the Kediri Regency Communication and Informatics Office.',
  status = 'completed',
  year = 2025,
  project_type = 'web',
  client_name = 'Dinas Komunikasi dan Informatika Kabupaten Kediri (mitra: Toko Madura Mart)',
  client_name_en = 'Communication and Informatics Office of Kediri Regency (partner: Madura Mart store)',
  my_role = 'Merancang dan mengembangkan seluruh Role Admin: analisis kebutuhan, perancangan dengan Use Case, DFD, ERD, dan Activity Diagram, basis data 10 tabel, implementasi, serta pengujian.',
  my_role_en = 'Designed and built the entire Admin role: requirements analysis, design with use case, DFD, ERD, and activity diagrams, a 10-table database, implementation, and testing.',
  problem = 'Pencatatan produk, stok, dan validasi transaksi masih terpisah atau manual, sehingga stok fisik dan stok sistem sering tidak sesuai dan validasi pesanan berjalan lambat.',
  problem_en = 'Product records, stock, and order validation were handled separately or by hand, so physical and recorded stock often didn''t match and order validation was slow.',
  solution = 'Panel admin terpusat: kelola produk (harga modal, harga jual, laba per produk, dan foto) dan kategori; stok masuk, keluar, dan opname yang otomatis memperbarui stok produk; riwayat stok dengan ekspor PDF; ringkasan stok menipis dan habis; serta validasi transaksi dari Pending, Dikirim, hingga Selesai. Tampilan responsif dengan Bootstrap.',
  solution_en = 'A central admin panel: products (cost price, selling price, profit per item, and photos) and categories; incoming, outgoing, and stock-take entries that update product stock automatically; stock history with PDF export; low-stock and out-of-stock summaries; and order validation from Pending to Shipped to Completed. Responsive layout with Bootstrap.',
  outcome = 'Lulus 18 skenario pengujian black box, dan kini dipakai untuk mengelola produk dan stok di toko saya sendiri.',
  outcome_en = 'Passed all 18 black-box test scenarios and is now used to manage products and stock in my own store.',
  tech_stack = ARRAY['PHP', 'Laravel', 'MySQL', 'Bootstrap']::TEXT[],
  links = '[
    {"label": "Kode (sembako)", "label_en": "Code (sembako)", "type": "code", "url": "https://github.com/Aldidwiirawan/sembako", "is_private": false}
  ]'::JSONB,
  is_featured = true,
  sort_order = 3,
  is_visible = true
WHERE id = (
  SELECT p.id
  FROM public.projects AS p
  WHERE p.slug = 'sistem-informasi-pengelolaan-data-produk-madura-mart'
    OR lower(p.title) LIKE '%madura mart%'
  ORDER BY (p.slug = 'sistem-informasi-pengelolaan-data-produk-madura-mart') DESC, p.created_at
  LIMIT 1
);


-- ==============================================================================
-- 5. PROYEK LAIN: urutan (dan unggulan untuk Portofolio)
-- ==============================================================================
UPDATE public.projects
SET is_featured = false, sort_order = 4
WHERE id = (
  SELECT p.id
  FROM public.projects AS p
  WHERE p.slug = 'website-portofolio-pribadi'
    OR lower(btrim(p.title)) = 'website portofolio pribadi'
  ORDER BY (p.slug = 'website-portofolio-pribadi') DESC, p.created_at
  LIMIT 1
);

UPDATE public.projects
SET sort_order = 5
WHERE id = (
  SELECT p.id
  FROM public.projects AS p
  WHERE p.slug = 'aplikasi-arsip-surat'
    OR lower(btrim(p.title)) LIKE 'si-arsip%'
    OR lower(btrim(p.title)) = 'aplikasi arsip surat'
  ORDER BY (p.slug = 'aplikasi-arsip-surat') DESC, p.created_at
  LIMIT 1
);


-- ==============================================================================
-- 6. TAUTAN LAMA: github_url, demo_url, dan repo privat mengikuti daftar tautan
-- ==============================================================================
-- Sama seperti saat menyimpan di admin (legacyUrls dan allCodePrivate di projectLinks.js), untuk
-- empat proyek yang tautannya diisi file ini (dicari lewat judul barunya).
UPDATE public.projects AS p
SET
  github_url = (
    SELECT l.item ->> 'url'
    FROM jsonb_array_elements(p.links) WITH ORDINALITY AS l (item, position)
    WHERE l.item ->> 'type' = 'code'
      AND l.item ->> 'is_private' = 'false'
      AND COALESCE(l.item ->> 'url', '') <> ''
    ORDER BY l.position
    LIMIT 1
  ),
  demo_url = (
    SELECT l.item ->> 'url'
    FROM jsonb_array_elements(p.links) WITH ORDINALITY AS l (item, position)
    WHERE l.item ->> 'type' = 'demo'
      AND l.item ->> 'is_private' = 'false'
      AND COALESCE(l.item ->> 'url', '') <> ''
    ORDER BY l.position
    LIMIT 1
  ),
  is_repo_private = (
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(p.links) AS l (item)
      WHERE l.item ->> 'type' = 'code'
    )
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(p.links) AS l (item)
      WHERE l.item ->> 'type' = 'code' AND l.item ->> 'is_private' <> 'true'
    )
  )
WHERE p.title IN (
  'Jeejak: Konsol Web Bukti Packing',
  'JejakPaket: Aplikasi Operator Bukti Packing',
  'Dwijaya Coffee: Website Pemesanan Kafe',
  'Madura Mart: Sistem Data Produk dan Stok'
);


-- ==============================================================================
-- 7. PENGALAMAN: CV Adisatya IT Consultant
-- ==============================================================================
-- Poin tugas ID dan EN diganti seluruhnya (item ke-n EN = terjemahan item ke-n ID). Proyek
-- terkait diarahkan ke jeejak-console (tetap seperti semula bila proyek itu tidak ditemukan).
UPDATE public.experiences
SET
  responsibilities = ARRAY[
    'Merancang UI/UX konsol web di Figma dan membangun halaman frontend-nya dengan HTML, Jinja2, dan Tailwind CSS.',
    'Mengembangkan dasbor, halaman analitik, dan fitur sinkronisasi data scan resi dari aplikasi mobile ke server.',
    'Ikut mengembangkan aplikasi mobile operator berbasis Flutter bersama tim programmer.',
    'Versi awal yang saya kerjakan kini dirilis CV Adisatya IT Consultant sebagai Jeejak (jeejak.id).'
  ]::TEXT[],
  responsibilities_en = ARRAY[
    'Designed the web console''s UI/UX in Figma and built its front end with HTML, Jinja2, and Tailwind CSS.',
    'Developed the dashboard, analytics pages, and the feature that syncs scanned shipping labels from the mobile app to the server.',
    'Helped build the Flutter mobile app for warehouse operators with the programming team.',
    'The early version I worked on is now offered by CV Adisatya IT Consultant as Jeejak (jeejak.id).'
  ]::TEXT[],
  related_project_id = COALESCE(
    (SELECT p.id FROM public.projects AS p WHERE p.slug = 'jeejak-console' LIMIT 1),
    related_project_id
  )
WHERE lower(btrim(company)) = 'cv adisatya it consultant';


-- ==============================================================================
-- 8. PENGALAMAN: Dinas Komunikasi dan Informatika Kabupaten Kediri
-- ==============================================================================
-- Poin tugas ID dan EN diganti seluruhnya. Tag SSL dan Bootstrap ditambahkan di akhir bila belum
-- ada (tanpa membedakan huruf besar/kecil); tag lama tetap.
UPDATE public.experiences AS e
SET
  responsibilities = ARRAY[
    'Merancang dan mengembangkan sistem informasi pengelolaan data produk Madura Mart berbasis web.',
    'Membangun Role Admin untuk produk, kategori, stok, dan validasi transaksi.',
    'Menerapkan tampilan responsif dengan Bootstrap untuk memudahkan input dan pemantauan data.',
    'Membantu aktivasi SSL untuk situs web desa dan kecamatan di Kabupaten Kediri.',
    'Membantu migrasi portal website Pemerintah Kabupaten Kediri.'
  ]::TEXT[],
  responsibilities_en = ARRAY[
    'Designed and built a web-based product data management system for the Madura Mart store.',
    'Built the Admin role for products, categories, stock, and order validation.',
    'Implemented a responsive layout with Bootstrap to make data entry and monitoring easier.',
    'Helped enable SSL for village and district websites across Kediri Regency.',
    'Helped migrate the Kediri Regency Government''s web portal.'
  ]::TEXT[],
  skill_tags = e.skill_tags || ARRAY(
    SELECT t.tag
    FROM unnest(ARRAY['SSL', 'Bootstrap']::TEXT[]) WITH ORDINALITY AS t (tag, position)
    WHERE NOT EXISTS (
      SELECT 1 FROM unnest(e.skill_tags) AS s (tag)
      WHERE lower(btrim(s.tag)) = lower(t.tag)
    )
    ORDER BY t.position
  )
WHERE lower(btrim(e.company)) = 'dinas komunikasi dan informatika kabupaten kediri';


-- ==============================================================================
-- 9. KEAHLIAN: Midtrans (Backend, paling akhir di kategorinya)
-- ==============================================================================
INSERT INTO public.skills (name, category, is_featured, sort_order)
SELECT
  'Midtrans',
  'Backend',
  false,
  COALESCE((SELECT max(s.sort_order) FROM public.skills AS s WHERE s.category = 'Backend'), -1) + 1
WHERE NOT EXISTS (
  SELECT 1
  FROM public.skills AS s
  WHERE lower(btrim(s.name)) = 'midtrans'
);

COMMIT;


-- ==============================================================================
-- CEK (hanya membaca, berjalan setelah COMMIT): semua proyek urut tampil, lalu jumlah poin tugas
-- per pengalaman, lalu Midtrans. urutan dimulai dari 1 (= sort_order + 1). Untuk pengalaman,
-- slug berisi slug proyek terkaitnya; untuk keahlian, status berisi kategorinya.
-- ==============================================================================
SELECT bagian, slug, judul, status, unggulan, tampil, urutan, jumlah_tautan, github_url, demo_url,
  repo_privat, poin_tugas, poin_tugas_en, tag
FROM (
  SELECT
    1 AS no, 'proyek' AS bagian, p.slug, p.title AS judul, p.status, p.is_featured AS unggulan,
    p.is_visible AS tampil, p.sort_order + 1 AS urutan, jsonb_array_length(p.links) AS jumlah_tautan,
    p.github_url, p.demo_url, p.is_repo_private AS repo_privat,
    NULL::INTEGER AS poin_tugas, NULL::INTEGER AS poin_tugas_en, NULL::TEXT AS tag,
    p.created_at AS dibuat
  FROM public.projects AS p

  UNION ALL
  SELECT
    2, 'pengalaman', rp.slug, e.company, e.experience_type, e.is_featured, e.is_visible,
    e.sort_order + 1, NULL, NULL, NULL, NULL,
    cardinality(e.responsibilities), cardinality(e.responsibilities_en),
    array_to_string(e.skill_tags, ', '),
    e.created_at
  FROM public.experiences AS e
  LEFT JOIN public.projects AS rp ON rp.id = e.related_project_id

  UNION ALL
  SELECT
    3, 'keahlian', NULL, s.name, s.category, s.is_featured, s.is_visible,
    s.sort_order + 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    s.created_at
  FROM public.skills AS s
  WHERE lower(btrim(s.name)) = 'midtrans'
) AS hasil
ORDER BY no, urutan, dibuat;
