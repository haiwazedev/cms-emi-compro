import type { LucideIcon } from 'lucide-react'
import {
  Building2Icon,
  CircleHelpIcon,
  FileTextIcon,
  HandshakeIcon,
  HouseIcon,
  ImagesIcon,
  KeyRoundIcon,
  MailIcon,
  NewspaperIcon,
  SettingsIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react'

export const NAVIGATION_LABELS = {
  navigation: 'Navigasi utama',
  mainContent: 'Konten utama',
  openNavigation: 'Buka navigasi',
  closeNavigation: 'Tutup navigasi',
  contentManager: 'CONTENT MANAGER',
  home: 'Beranda',
  aboutUs: 'Tentang Kami',
  articles: 'Artikel',
  divisionsAndServices: 'Divisi & Layanan',
  commitmentDocuments: 'Dokumen Komitmen',
  management: 'Pengurus',
  faq: 'FAQ',
  clients: 'Klien',
  inbox: 'Pesan Masuk',
  media: 'MEDIA',
  mediaLibrary: 'Media Library',
  settings: 'PENGATURAN',
  siteSettings: 'Pengaturan Situs',
  usersAndAccess: 'Pengguna & Akses',
  single: 'SINGLE',
  companyName: 'Energy Management Indonesia',
  companyMark: 'PLN',
} as const

export const NAVIGATION_TOPBAR_LABELS = {
  searchPlaceholder: 'Cari konten...',
  searchLabel: 'Cari konten',
  languageSelector: 'Pilihan bahasa',
  activeLanguage: 'ID',
  languages: ['ID', 'EN'],
  profile: 'Profil pengguna',
  profileInitials: 'NA',
  logout: 'Keluar',
  loggingOut: 'Sedang keluar...',
  logoutSuccess: 'Berhasil keluar.',
  logoutFailed: 'Gagal keluar. Silakan coba lagi.',
} as const

type NavigationItem = {
  label: string
  href?: '#'
  to?: '/articles'
  icon: LucideIcon
  count?: string
}

type NavigationSection = {
  label: string
  items: readonly NavigationItem[]
}

export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  {
    label: NAVIGATION_LABELS.contentManager,
    items: [
      {
        label: NAVIGATION_LABELS.home,
        href: '#',
        icon: HouseIcon,
        count: NAVIGATION_LABELS.single,
      },
      {
        label: NAVIGATION_LABELS.aboutUs,
        href: '#',
        icon: Building2Icon,
        count: NAVIGATION_LABELS.single,
      },
      {
        label: NAVIGATION_LABELS.articles,
        to: '/articles',
        icon: NewspaperIcon,
        count: '5',
      },
      {
        label: NAVIGATION_LABELS.divisionsAndServices,
        href: '#',
        icon: ZapIcon,
        count: '5',
      },
      {
        label: NAVIGATION_LABELS.commitmentDocuments,
        href: '#',
        icon: FileTextIcon,
        count: '12',
      },
      {
        label: NAVIGATION_LABELS.management,
        href: '#',
        icon: UsersIcon,
        count: '6',
      },
      {
        label: NAVIGATION_LABELS.faq,
        href: '#',
        icon: CircleHelpIcon,
        count: '4',
      },
      {
        label: NAVIGATION_LABELS.clients,
        href: '#',
        icon: HandshakeIcon,
        count: '8',
      },
      {
        label: NAVIGATION_LABELS.inbox,
        href: '#',
        icon: MailIcon,
        count: '3',
      },
    ],
  },
  {
    label: NAVIGATION_LABELS.media,
    items: [
      {
        label: NAVIGATION_LABELS.mediaLibrary,
        href: '#',
        icon: ImagesIcon,
      },
    ],
  },
  {
    label: NAVIGATION_LABELS.settings,
    items: [
      {
        label: NAVIGATION_LABELS.siteSettings,
        href: '#',
        icon: SettingsIcon,
      },
      {
        label: NAVIGATION_LABELS.usersAndAccess,
        href: '#',
        icon: KeyRoundIcon,
      },
    ],
  },
]
