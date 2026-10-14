export type InboxMessage = {
  id: number
  name: string
  email: string
  phone: string
  company: string
  subject: string
  title: string
  message: string
  createdAt: string
  read: boolean
}

export type InboxReadFilter = 'all' | 'unread' | 'read'

export const INBOX_LABELS = {
  pageTitle: 'Pesan Masuk',
  documentTitle: 'Pesan Masuk | PLN EMI CMS',
  description: (unread: number) =>
    `Pesan dari formulir kontak situs · ${unread} belum dibaca`,
  markAllRead: 'Tandai semua dibaca',
  exportCsv: 'Ekspor CSV',
  searchPlaceholder: 'Cari nama atau subjek...',
  searchLabel: 'Cari pesan',
  readFilterLabel: 'Filter status pesan',
  subjectFilterLabel: 'Filter subjek',
  allSubjects: 'Semua subjek',
  company: 'Perusahaan',
  subject: 'Subjek',
  unread: 'Belum dibaca',
  replyViaEmail: 'Balas via Email',
  markRead: 'Tandai dibaca',
  markUnread: 'Tandai belum dibaca',
  delete: 'Hapus',
  noMessages: 'Tidak ada pesan yang cocok.',
  noSelection: 'Pilih pesan untuk melihat detail.',
  deleteTitle: 'Hapus pesan?',
  deleteDescription:
    'Pesan ini akan dihapus. Tindakan ini tidak dapat dibatalkan.',
  confirmDelete: 'Ya, hapus',
  cancel: 'Batal',
  closeDeleteDialog: 'Tutup dialog hapus',
  csvFileName: 'pesan-masuk.csv',
  replyPrefix: 'Re: ',
} as const

export const INBOX_READ_FILTERS: readonly {
  value: InboxReadFilter
  label: string
}[] = [
  { value: 'all', label: 'Semua pesan' },
  { value: 'unread', label: 'Belum dibaca' },
  { value: 'read', label: 'Sudah dibaca' },
]

export const INBOX_ALL_SUBJECTS = 'all'

// shortcut: mock data until the contact_messages API exists.
export const INBOX_MOCK_MESSAGES: readonly InboxMessage[] = [
  {
    id: 1,
    name: 'Budi Santoso',
    email: 'budi.santoso@nusantaradc.co.id',
    phone: '+62 812 3456 7890',
    company: 'PT Nusantara Data Center',
    subject: 'Decarbonization Strategy (REC / SPE-GRK)',
    title: 'Konsultasi REC untuk data center',
    message:
      'Selamat pagi,\n\nKami ingin menanyakan skema pembelian REC untuk kebutuhan operasional data center kami di Cikarang dengan konsumsi listrik sekitar 850 MWh per bulan.\n\nApakah tersedia skema kontrak tahunan? Mohon informasi mengenai mekanisme dan estimasi biayanya.\n\nTerima kasih.',
    createdAt: '2026-08-12T09:14:00+07:00',
    read: false,
  },
  {
    id: 2,
    name: 'Rina Kusuma',
    email: 'rina.kusuma@grandhotel.co.id',
    phone: '+62 813 2222 1100',
    company: 'Grand Hotel Bandung',
    subject: 'Energy Audit',
    title: 'Permintaan audit energi gedung',
    message:
      'Kami tertarik dengan layanan audit energi untuk gedung hotel kami yang berlokasi di Bandung. Mohon informasi mengenai jadwal dan ruang lingkup audit.',
    createdAt: '2026-08-11T16:02:00+07:00',
    read: false,
  },
  {
    id: 3,
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@industri.co.id',
    phone: '+62 811 7654 3210',
    company: 'PT Industri Maju',
    subject: 'Waste Management',
    title: 'Pengelolaan limbah B3',
    message:
      'Mohon informasi mengenai layanan pengurusan persetujuan teknis limbah B3 beserta estimasi waktunya.',
    createdAt: '2026-08-11T10:45:00+07:00',
    read: false,
  },
  {
    id: 4,
    name: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@energi.co.id',
    phone: '+62 821 9876 5432',
    company: 'PT Energi Hijau',
    subject: 'Decarbonization Strategy (REC / SPE-GRK)',
    title: 'Tindak lanjut kerja sama REC',
    message:
      'Menindaklanjuti pertemuan minggu lalu, berikut kami sampaikan data konsumsi listrik tahunan perusahaan kami.',
    createdAt: '2026-08-08T14:20:00+07:00',
    read: true,
  },
  {
    id: 5,
    name: 'Dedi Prasetyo',
    email: 'dedi.prasetyo@semen.co.id',
    phone: '+62 822 1234 5678',
    company: 'PT Semen Nusantara',
    subject: 'Waste Management',
    title: 'Pemanfaatan FABA',
    message:
      'Perusahaan kami memiliki stok FABA yang cukup besar dan ingin mengetahui opsi pemanfaatannya.',
    createdAt: '2026-08-05T11:30:00+07:00',
    read: true,
  },
]
