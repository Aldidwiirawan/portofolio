/**
 * Custom highlight metrics for projects matching the Styfen Sagala reference.
 * If a project is not listed here or has no entry, ProjectCard falls back
 * to the standard database facts (role, year, client).
 */
export const PROJECT_HIGHLIGHTS = {
  'jeejak-console': {
    id: [
      { value: 'Shopee & TikTok', label: 'Integrasi Marketplace' },
      { value: 'Bukti Sah PDF', label: 'Klaim Sengketa' },
      { value: 'CV Adisatya', label: 'Mitra Produksi' },
    ],
    en: [
      { value: 'Shopee & TikTok', label: 'Marketplace Integration' },
      { value: 'Verified PDF', label: 'Dispute Evidence' },
      { value: 'CV Adisatya', label: 'Production Client' },
    ],
  },
  'jejakpaket': {
    id: [
      { value: 'Android & iOS', label: 'Platform (Flutter)' },
      { value: 'Anti-Scan Ganda', label: 'Alarm Gudang' },
      { value: 'Offline-First', label: 'Operasional Gudang' },
    ],
    en: [
      { value: 'Android & iOS', label: 'Platform (Flutter)' },
      { value: 'Anti-Duplicate', label: 'Warehouse Alarm' },
      { value: 'Offline-First', label: 'Warehouse Mode' },
    ],
  },
  'dwijaya-coffee': {
    id: [
      { value: 'Midtrans', label: 'Payment Gateway' },
      { value: '3 Role Aktor', label: 'Owner, Kasir, Tamu' },
      { value: 'Ekspor Laporan', label: 'Format PDF & CSV' },
    ],
    en: [
      { value: 'Midtrans', label: 'Payment Gateway' },
      { value: '3 Roles', label: 'Owner, Admin, Customer' },
      { value: 'Report Export', label: 'PDF & CSV Format' },
    ],
  },
  'sistem-informasi-pengelolaan-data-produk-madura-mart': {
    id: [
      { value: '18/18 Uji', label: 'Skenario Lulus' },
      { value: 'Stok Opname', label: 'Otomatisasi Data' },
      { value: 'Diskominfo', label: 'Instansi Magang' },
    ],
    en: [
      { value: '18/18 Tests', label: 'Scenarios Passed' },
      { value: 'Stock Take', label: 'Data Automation' },
      { value: 'Diskominfo', label: 'Internship Agency' },
    ],
  },
  'madura-mart': {
    id: [
      { value: '18/18 Uji', label: 'Skenario Lulus' },
      { value: 'Stok Opname', label: 'Otomatisasi Data' },
      { value: 'Diskominfo', label: 'Instansi Magang' },
    ],
    en: [
      { value: '18/18 Tests', label: 'Scenarios Passed' },
      { value: 'Stock Take', label: 'Data Automation' },
      { value: 'Diskominfo', label: 'Internship Agency' },
    ],
  },
  'website-portofolio-pribadi': {
    id: [
      { value: 'Bilingual', label: 'Dukungan ID & EN' },
      { value: 'Dual Theme', label: 'Light & Dark Mode' },
      { value: 'React + Vite', label: 'Modern SPA Engine' },
    ],
    en: [
      { value: 'Bilingual', label: 'ID & EN Support' },
      { value: 'Dual Theme', label: 'Light & Dark Mode' },
      { value: 'React + Vite', label: 'Modern SPA Engine' },
    ],
  },
  'aplikasi-arsip-surat': {
    id: [
      { value: 'Kompeten', label: 'Sertifikasi BNSP' },
      { value: 'In-Browser', label: 'Preview Dokumen PDF' },
      { value: 'Karangduren', label: 'Studi Kasus Nyata' },
    ],
    en: [
      { value: 'Competent', label: 'BNSP Certification' },
      { value: 'In-Browser', label: 'PDF Document Preview' },
      { value: 'Karangduren', label: 'Real Case Study' },
    ],
  },
}

export function getProjectHighlights(project, lang) {
  if (!project?.slug) return null
  const custom = PROJECT_HIGHLIGHTS[project.slug]
  if (custom && custom[lang]) {
    return custom[lang].map((item, idx) => ({
      key: `custom_${idx}`,
      label: item.label,
      value: item.value,
    }))
  }
  return null
}
