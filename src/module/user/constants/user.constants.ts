import { DICTIONARIES, type Locale } from '@/shared/lib/i18n/i18n-context'
export const USER_LABELS = {
  pageTitle: 'Pengguna & Akses',
  documentTitle: 'Pengguna & Akses | PLN EMI CMS',
  description: 'Kelola siapa saja yang dapat masuk dan mengubah konten situs.',
  addUser: 'Tambah Pengguna',
  manageRoles: 'Kelola Peran',
  registeredUsers: 'Pengguna Terdaftar',
  accountCount: (count: number) => `${count} akun`,
  searchLabel: 'Cari pengguna',
  searchPlaceholder: 'Cari nama atau email...',
  roleFilterLabel: 'Filter peran',
  allRoles: 'Semua Peran',
  noRole: 'Tanpa Peran',
  nameAndEmail: 'Nama & Email',
  role: 'Peran',
  status: 'Status',
  lastLogin: 'Terakhir Masuk',
  actions: 'Aksi',
  active: 'Aktif',
  inactive: 'Nonaktif',
  neverLoggedIn: '—',
  editUser: (name: string) => `Ubah ${name}`,
  deleteUser: (name: string) => `Hapus ${name}`,
  cannotDeleteSelf: 'Anda tidak dapat menghapus akun sendiri.',
  editUserTitle: 'Ubah Pengguna',
  formDescription: 'Atur data akun, peran, dan status pengguna.',
  name: 'Nama',
  email: 'Email',
  rolePlaceholder: 'Pilih peran',
  cancel: 'Batal',
  save: 'Simpan',
  saving: 'Menyimpan...',
  delete: 'Hapus',
  deleting: 'Menghapus...',
  deleteUserTitle: 'Hapus Pengguna',
  deleteUserDescription: (name: string) =>
    `Akun ${name} akan dihapus permanen. Riwayat aktivitasnya tetap tersimpan.`,
  closeDeleteUserDialog: 'Tutup dialog hapus pengguna',
  userSaved: 'Pengguna berhasil disimpan.',
  userSaveFailed: 'Pengguna gagal disimpan.',
  userDeleted: 'Pengguna berhasil dihapus.',
  userDeleteFailed: 'Pengguna gagal dihapus.',
  usersFailed: 'Pengguna gagal dimuat.',
  noUsers: 'Pengguna tidak ditemukan.',
  loading: 'Memuat...',
  retry: 'Coba lagi',
  showingEntries: (start: number, end: number, total: number) =>
    `Menampilkan ${start}–${end} dari ${total} akun`,
  previousPage: 'Halaman sebelumnya',
  nextPage: 'Halaman berikutnya',
  rolesAndPermissions: 'Peran & Hak Akses',
  permissionsFailed: 'Hak akses gagal dimuat.',
  noRoles: 'Belum ada peran.',
  permissionToggle: (role: string, permission: string) =>
    `${permission} untuk ${role}`,
  permissionSaveFailed: 'Hak akses gagal disimpan.',
} as const

export const ROLE_LABELS = {
  pageTitle: 'Kelola Peran',
  documentTitle: 'Kelola Peran | PLN EMI CMS',
  description: 'Atur peran yang dapat diberikan kepada pengguna.',
  backToUsers: 'Kembali ke Pengguna & Akses',
  addRole: 'Tambah Peran',
  editRoleTitle: 'Ubah Peran',
  formDescription: 'Atur judul dan deskripsi peran.',
  title: 'Judul',
  roleDescription: 'Deskripsi',
  userCount: (count: number) => `${count} pengguna`,
  editRole: (title: string) => `Ubah ${title}`,
  deleteRole: (title: string) => `Hapus ${title}`,
  cannotDeleteOwnRole: 'Anda tidak dapat menghapus peran Anda sendiri.',
  deleteRoleTitle: 'Hapus Peran',
  deleteRoleDescription: (title: string, userCount: number) =>
    userCount > 0
      ? `Peran ${title} akan dihapus beserta ${userCount} pengguna yang memilikinya. Tindakan ini tidak dapat dibatalkan.`
      : `Peran ${title} akan dihapus. Tindakan ini tidak dapat dibatalkan.`,
  closeDeleteRoleDialog: 'Tutup dialog hapus peran',
  roleSaved: 'Peran berhasil disimpan.',
  roleSaveFailed: 'Peran gagal disimpan.',
  roleDeleted: 'Peran berhasil dihapus.',
  roleDeleteFailed: 'Peran gagal dihapus.',
  rolesFailed: 'Peran gagal dimuat.',
  noRoles: 'Belum ada peran.',
} as const

// Backend sends permission keys; the CMS owns the labels.
export const PERMISSION_LABELS: Record<string, string> = {
  write: 'Tulis',
  publish: 'Terbitkan',
  delete: 'Hapus',
  manage_users: 'Kelola Pengguna',
}

export const USER_DEFAULT_PAGE_SIZE = 20

const RELATIVE_TIME_UNITS = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
] as const

// "kemarin", "3 hari yang lalu", "baru saja" for under a minute.
export function formatRelativeTime(
  value: string,
  locale: Locale,
  now = Date.now(),
) {
  const seconds = (new Date(value).getTime() - now) / 1000
  const relativeTimeFormat = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
  })

  for (const [unit, unitSeconds] of RELATIVE_TIME_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeTimeFormat.format(Math.round(seconds / unitSeconds), unit)
    }
  }

  return DICTIONARIES[locale].common.justNow
}

export function formatDateTime(value: string, locale: Locale) {
  return new Date(value).toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
