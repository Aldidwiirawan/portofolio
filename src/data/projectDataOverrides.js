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
