const id = {
  common: {
    success: 'Berhasil',
    error: 'Gagal',
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Edit',
    close: 'Tutup',
    closeNotification: 'Tutup notifikasi',
    loading: 'Memuat...',
    justNow: 'baru saja',
  },
  auth: {
    brandTitle: 'Content',
    brandTitleAccent: 'Management System',
    brandDescription:
      'Kelola berita, dokumen komitmen, layanan, dan profil perusahaan PT Energy Management Indonesia (Persero) dalam satu tempat.',
    copyright: (year: number) =>
      `© ${year} PT Energy Management Indonesia (Persero)`,
    eyebrow: 'Panel Administrator',
    title: 'Masuk ke CMS',
    description: 'Gunakan akun yang telah didaftarkan oleh administrator.',
    email: 'Email',
    emailRequired: 'Email wajib diisi.',
    emailInvalid: 'Format email tidak valid.',
    password: 'Kata Sandi',
    passwordRequired: 'Kata sandi wajib diisi.',
    forgotPassword: 'Lupa kata sandi?',
    submit: 'Masuk',
    submitting: 'Memproses...',
    loginSuccess: 'Berhasil masuk.',
    loginFailed: 'Gagal masuk. Silakan coba lagi.',
  },
}

type Dictionary = typeof id

export { id, type Dictionary }
