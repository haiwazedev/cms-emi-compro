export const DASHBOARD_LABELS = {
  pageTitle: 'Dashboard',
  documentTitle: 'Dashboard | PLN EMI Admin',
  greeting: (name: string) => `Selamat datang, ${name} 👋`,
  description:
    'Ringkasan konten situs PT Energy Management Indonesia (Persero) — diperbarui hari ini, 09.14 WIB.',
  viewSite: 'Lihat Situs',
  newArticle: 'Artikel Baru',
  latestArticles: 'Artikel Terbaru',
  viewAll: 'Lihat semua',
  photo: 'Foto',
  title: 'Judul',
  date: 'Tanggal',
  status: 'Status',
  actions: 'Aksi',
  edit: 'Ubah',
  delete: 'Hapus',
  published: 'Terbit',
  actionNeeded: 'Perlu Tindakan',
  recentActivity: 'Aktivitas Terakhir',
  quickAccess: 'Akses Cepat',
} as const

// shortcut: static data until dashboard API exists, replace per feature.
export const DASHBOARD_USER_NAME = 'Neni'

export const DASHBOARD_SITE_URL = import.meta.env.VITE_LANDING_SITE_URL

export const DASHBOARD_STATS = [
  { key: 'articles', label: 'Artikel', value: 5, note: '4 terbit · 1 draf' },
  { key: 'documents', label: 'Dokumen', value: 12, note: '4 kategori' },
  { key: 'services', label: 'Layanan', value: 30, note: 'dalam 5 divisi' },
  { key: 'inbox', label: 'Pesan Masuk', value: 3, note: 'belum dibaca' },
] as const

export type DashboardStatKey = (typeof DASHBOARD_STATS)[number]['key']

export const DASHBOARD_ARTICLES = [
  {
    id: 1,
    title: 'Kompas.com Bersama PLN EMI Dukung Dekarbonisasi Emisi Operasional',
    category: 'Siaran Pers',
    date: '12 Agu 2026',
  },
  {
    id: 2,
    title:
      'PLN EMI Perkuat Pengembangan Karbon Kredit di Global Hydrogen Summit 2026',
    category: 'Siaran Pers',
    date: '21 Jul 2026',
  },
  {
    id: 3,
    title: 'PLN EMI dan Icon Green Jalin Kolaborasi Strategis Energi Hijau',
    category: 'Siaran Pers',
    date: '14 Jul 2026',
  },
  {
    id: 4,
    title: 'Hadapi Perubahan Iklim, PLN Group dan DLH Jabar Perkuat Kolaborasi',
    category: 'Berita CSR',
    date: '5 Jun 2026',
  },
] as const

export const DASHBOARD_ACTION_ITEMS = [
  {
    title: '1 artikel masih berstatus draf',
    description:
      '“PLN EMI x Minimalistmom Gelar Pasar Tukar” belum diterbitkan sejak 22 Mei 2026.',
  },
] as const

export const DASHBOARD_ACTIVITIES = [
  {
    initials: 'NA',
    actor: 'Neni A.',
    action: 'menerbitkan artikel',
    target: 'Kompas.com × PLN EMI',
    time: '2 jam lalu',
  },
  {
    initials: 'KR',
    actor: 'Korkom',
    action: 'mengunggah',
    target: 'Laporan Keberlanjutan 2025.pdf',
    time: 'Kemarin',
  },
  {
    initials: 'NA',
    actor: 'Neni A.',
    action: 'memperbarui',
    target: 'Slide Beranda',
    time: '2 hari lalu',
  },
] as const

export const DASHBOARD_QUICK_LINKS = [
  { key: 'article', label: 'Tulis artikel baru', to: '/articles/create' },
  { key: 'document', label: 'Unggah dokumen', to: '/document_commitments' },
  { key: 'home', label: 'Atur slide beranda', to: '/home' },
  { key: 'inbox', label: 'Baca pesan masuk', to: '/inbox' },
] as const
