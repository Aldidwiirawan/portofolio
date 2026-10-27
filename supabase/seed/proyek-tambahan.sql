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
  description = 'Konsol web untuk seller Shopee dan TikTok Shop: impor pesanan, pantau pengemasan, dan simpan bukti packing. Saya ikut mengembangkan versi awalnya saat magang, yang kini dirilis CV Adisatya IT Consultant sebagai Jeejak.',
  description_en = 'A web console for Shopee and TikTok Shop sellers to import orders, track packing, and keep packing proof. I helped build its early version during my internship; CV Adisatya IT Consultant now offers it as Jeejak.',
  status = 'production',
  year = 2026,
  project_type = 'web',
  client_name = 'CV Adisatya IT Consultant (awalnya untuk AyamBebek Pakan dan Ternak)',
  client_name_en = 'CV Adisatya IT Consultant (first built for AyamBebek Pakan dan Ternak)',
  my_role = 'Frontend dan UI/UX versi awal: merancang tampilan di Figma lalu membangun halamannya dengan HTML, Jinja2, dan Tailwind CSS; mengembangkan dasbor dan halaman analitik; serta fitur sinkronisasi data scan resi dari aplikasi mobile ke server. Dikerjakan bersama tim selama magang (Januari–Juli 2026).',
  my_role_en = 'Front end and UI/UX for the early version: designed the screens in Figma and built them with HTML, Jinja2, and Tailwind CSS; developed the dashboard and analytics pages; and built the feature that syncs scanned shipping labels from the mobile app to the server. Done with the team during my internship (January–July 2026).',
  problem = 'Status pengiriman dicatat manual di Excel dan bukti serah terima dikirim lewat WhatsApp, sehingga mencari status satu paket bisa memakan waktu hingga sekitar 3 hari. Toko klien memproses 20–100 pesanan per hari dengan 7 operator.',
  problem_en = 'Shipping status was tracked by hand in Excel and handover proof was sent over WhatsApp, so finding the status of a single parcel could take up to about 3 days. The client handled 20–100 orders a day with 7 operators.',
  solution = 'Konsol web yang mengimpor pesanan Shopee dan TikTok Shop dari file Excel/CSV dan PDF resi, menampilkan antrean pesanan yang perlu dikirim dan yang sudah dikirim, bukti drop dan retur dari aplikasi operator, analitik penjualan, serta pengelolaan toko dan pengguna dengan hak akses per peran.',
  solution_en = 'A web console that imports Shopee and TikTok Shop orders from Excel/CSV files and shipping-label PDFs, shows to-ship and shipped queues, drop-off and return proof from the operator app, sales analytics, and store and user management with role-based access.',
  outcome = 'Versi awal dipakai klien AyamBebek, lalu dikembangkan lebih lanjut oleh tim CV Adisatya menjadi produk Jeejak yang kini terbuka untuk umum, dari paket gratis hingga berlangganan.',
  outcome_en = 'The early version was used by the client, AyamBebek, and the CV Adisatya team later developed it into Jeejak, now available to the public with free and paid plans.',
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
  client_name, client_name_en, my_role, my_role_en, problem, problem_en, solution, solution_en,
  outcome, outcome_en, tech_stack, links, is_featured, sort_order, is_visible
)
SELECT
  'JejakPaket: Aplikasi Operator Bukti Packing',
  'JejakPaket: Packing Proof App for Operators',
  'jejakpaket',
  'Aplikasi Android dan iPhone untuk operator gudang: scan resi, foto isi paket, dan rekam serah terima ke kurir, lalu sinkron ke konsol web. Saya ikut mengembangkan versi awalnya bersama tim; kini dirilis sebagai bagian dari Jeejak.',
  'An Android and iPhone app for warehouse operators to scan shipping labels, photograph parcel contents, and record courier handovers, then sync everything to the web console. I helped build its early version with the team; it is now released as part of Jeejak.',
  'production', 2026, 'mobile',
  'CV Adisatya IT Consultant (awalnya untuk AyamBebek Pakan dan Ternak)',
  'CV Adisatya IT Consultant (first built for AyamBebek Pakan dan Ternak)',
  'Ikut mengembangkan aplikasi versi awal dengan Flutter bersama programmer lain di tim: alur scan packing, foto per koli, drop ke kurir, retur, dan sinkronisasi data ke server.',
  'Helped build the early version in Flutter with other programmers on the team: the packing scan flow, per-parcel photos, courier drop-off, returns, and syncing data to the server.',
  'Operator memindai resi hanya untuk memperbarui file Excel, sedangkan foto bukti serah terima tersebar di galeri HP dan WhatsApp, sehingga sulit ditemukan saat ada klaim dari pembeli.',
  'Operators scanned labels only to update an Excel file, while handover photos were scattered across phone galleries and WhatsApp, making them hard to find when a buyer filed a claim.',
  'Aplikasi dengan alur kerja Packing → Drop ke Kurir → Retur: scan resi dengan marketplace dan kurir terbaca otomatis, pencegahan scan ganda, foto per koli, foto bukti serah terima, serta scan retur dengan foto dan alasan. Data tersimpan di HP lalu tersinkron ke server saat ada koneksi.',
  'An app built around a Packing → Courier drop-off → Returns workflow: label scanning that detects the marketplace and courier, duplicate-scan prevention, per-parcel photos, handover photos, and return scans with photos and reasons. Data is stored on the phone and synced to the server when a connection is available.',
  'Kini tersedia di Google Play dan App Store dengan nama JejakPaket.',
  'Now available on Google Play and the App Store as JejakPaket.',
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
