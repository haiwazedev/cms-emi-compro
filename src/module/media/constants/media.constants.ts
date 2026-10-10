export const MEDIA_LABELS = {
  pageTitle: 'Media Library',
  documentTitle: 'Media Library | PLN EMI Admin',
  description: 'Kelola foto dan dokumen yang digunakan di situs.',
  upload: 'Unggah Berkas',
  uploading: 'Mengunggah...',
  deleteSelected: (count: number) => `Hapus (${count})`,
  searchLabel: 'Cari berkas',
  searchPlaceholder: 'Cari berkas...',
  typeFilterLabel: 'Filter tipe media',
  allTypes: 'Semua tipe',
  pictures: 'Gambar',
  documents: 'Dokumen',
  newest: 'Terbaru diunggah',
  oldest: 'Terlama diunggah',
  sortLabel: 'Urutkan media',
  gridView: 'Tampilan grid',
  listView: 'Tampilan daftar',
  loading: 'Memuat media...',
  loadFailed: 'Media gagal dimuat.',
  retry: 'Coba lagi',
  empty: 'Belum ada berkas media.',
  noSearchResults: 'Tidak ada berkas yang cocok dengan pencarian.',
  fileCount: (count: number) => `${count} berkas`,
  summary: (count: number, size: string) =>
    `Total ${count} berkas · ${size} terpakai`,
  uploadSuccess: 'Berkas berhasil diunggah.',
  uploadFailed: 'Berkas gagal diunggah.',
  unsupportedFile: 'Format berkas harus PNG, JPG, JPEG, atau PDF.',
  fileTooLarge: (type: 'PICTURE' | 'DOCUMENT') =>
    type === 'PICTURE'
      ? 'Ukuran gambar maksimal 2 MiB.'
      : 'Ukuran dokumen maksimal 5 MiB.',
  deleteTitle: 'Hapus berkas terpilih?',
  deleteDescription: (count: number) =>
    `${count} berkas akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
  cancel: 'Batal',
  confirmDelete: (count: number) => `Ya, hapus ${count} berkas`,
  deleting: 'Menghapus...',
  deleteSuccess: (count: number) => `${count} berkas berhasil dihapus.`,
  deleteFailed: 'Berkas gagal dihapus.',
  closeDeleteDialog: 'Tutup dialog hapus berkas',
  selectFile: (filename: string) => `Pilih ${filename}`,
  pictureType: 'GAMBAR',
  documentType: 'DOKUMEN',
} as const

export const MEDIA_PICKER_LABELS = {
  title: 'Pilih dari Media Library',
  description: 'Pilih satu gambar untuk digunakan sebagai foto utama.',
  searchLabel: 'Cari gambar',
  searchPlaceholder: 'Cari berkas...',
  upload: 'Unggah berkas baru',
  uploading: 'Mengunggah...',
  noPictures: 'Belum ada gambar di Media Library.',
  noSearchResults: 'Tidak ada gambar yang cocok dengan pencarian.',
  selectedCount: (count: number) => `${count} berkas dipilih`,
  cancel: 'Batal',
  useFile: 'Gunakan berkas',
  close: 'Tutup dialog pilih media',
  unsupportedFile: 'Pilih gambar PNG, JPG, atau JPEG.',
} as const

export const MEDIA_ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.pdf'
export const MEDIA_PICTURE_MAX_SIZE = 2 * 1024 * 1024
export const MEDIA_DOCUMENT_MAX_SIZE = 5 * 1024 * 1024
