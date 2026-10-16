import type { SiteSettingsFormValues } from '@/module/site_settings/schemas/site-settings.schema'

export const SITE_SETTINGS_LABELS = {
  pageTitle: 'Pengaturan Situs',
  documentTitle: 'Pengaturan Situs | CMS PLN EMI',
  description:
    'Informasi perusahaan yang tampil di navbar, footer, dan halaman Hubungi Kami.',
  save: 'Simpan Perubahan',
  saveSuccess: 'Pengaturan situs berhasil disimpan.',
  saveFailed: 'Pengaturan situs gagal disimpan.',
  loading: 'Memuat pengaturan situs...',
  loadFailed: 'Pengaturan situs gagal dimuat',
  retry: 'Coba lagi',
  identity: 'Identitas',
  contact: 'Kontak',
  socialMedia: 'Media Sosial',
  socialCount: (count: number) => `Component berulang · ${count} item`,
  companyName: 'Nama Perusahaan',
  shortName: 'Nama Singkat',
  danantaraLogo: 'Logo Danantara Indonesia',
  plnLogo: 'Logo PLN EMI',
  logoHelp: 'PNG, JPG, SVG, atau WebP, maksimal 2 MB.',
  address: 'Alamat Kantor Pusat',
  phone: 'Telepon',
  whatsapp: 'WhatsApp',
  mainEmail: 'Email Utama',
  marketingEmail: 'Email Pemasaran',
  operatingDays: 'Hari Operasional',
  operatingHours: 'Jam Operasional',
  openTime: 'Jam buka',
  closeTime: 'Jam tutup',
  platform: 'Platform',
  url: 'URL / Akun',
  icon: 'Ikon',
  visible: 'Tampil',
  action: 'Aksi',
  emptySocial: 'Belum ada media sosial.',
  addSocial: '+ Tambah Media Sosial',
  noImage: 'Belum ada',
  choose: 'Pilih',
  change: 'Ganti',
  imageInvalid: 'Format file tidak didukung.',
  imageTooLarge: (maxMb: number) => `Ukuran file maksimal ${maxMb} MB.`,
  dragSocial: (index: number) => `Geser media sosial ${index}`,
  deleteSocial: (index: number) => `Hapus media sosial ${index}`,
  toggleSocial: (index: number) => `Tampilkan media sosial ${index}`,
} as const

export const SITE_SETTINGS_LOGO_MAX_SIZE = 2 * 1024 * 1024
export const SITE_SETTINGS_LOGO_TYPES = ['png', 'jpg', 'jpeg', 'svg', 'webp']
export const SITE_SETTINGS_ICON_MAX_SIZE = 1 * 1024 * 1024
export const SITE_SETTINGS_ICON_TYPES = ['svg']

export const SITE_SETTINGS_EMPTY_VALUES: SiteSettingsFormValues = {
  companyName: '',
  shortName: '',
  danantaraLogo: { url: null, file: null },
  plnLogo: { url: null, file: null },
  address: '',
  phone: '',
  whatsapp: '',
  mainEmail: '',
  marketingEmail: '',
  operatingDays: '',
  openTime: '',
  closeTime: '',
  socialLinks: [],
}
