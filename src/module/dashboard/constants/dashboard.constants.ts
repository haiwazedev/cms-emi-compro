export const DASHBOARD_LABELS = {
  pageTitle: 'Dashboard',
  documentTitle: 'Dashboard | PLN EMI Admin',
  greeting: (name: string) => `Selamat datang, ${name} 👋`,
  description: (time: string) =>
    `Ringkasan konten situs PT Energy Management Indonesia (Persero) — diperbarui hari ini, ${time} WIB.`,
  viewSite: 'Lihat Situs',
  newArticle: 'Artikel Baru',
  latestArticles: 'Artikel Terbaru',
  viewAll: 'Lihat semua',
  recentActivity: 'Aktivitas Terakhir',
  loadingActivity: 'Memuat aktivitas…',
  activityFailed: 'Gagal memuat aktivitas',
  noActivity: 'Belum ada aktivitas.',
  quickAccess: 'Akses Cepat',
  articles: 'Artikel',
  languageCount: (languageId: string, published: number, draft: number) =>
    `${languageId.toUpperCase()} - ${published} terbit · ${draft} draf`,
  loadingArticleCounts: 'Memuat jumlah artikel…',
  articleCountsFailed: 'Gagal memuat jumlah artikel',
  documents: 'Dokumen',
  categoryCount: (count: number) => `${count} kategori`,
  services: 'Layanan',
  divisionCount: (count: number) => `dalam ${count} divisi`,
  inbox: 'Pesan Masuk',
  unread: 'belum dibaca',
  loadingCount: 'Memuat jumlah…',
  countFailed: 'Gagal memuat jumlah',
} as const

export const DASHBOARD_QUICK_LINKS = [
  { key: 'article', label: 'Tulis artikel baru', to: '/articles/create' },
  { key: 'document', label: 'Unggah dokumen', to: '/document_commitments' },
  { key: 'home', label: 'Atur slide beranda', to: '/home' },
  { key: 'inbox', label: 'Baca pesan masuk', to: '/inbox' },
] as const
