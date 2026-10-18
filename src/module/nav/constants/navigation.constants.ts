import type { LucideIcon } from 'lucide-react'
import {
  Building2Icon,
  CircleHelpIcon,
  FileTextIcon,
  HandshakeIcon,
  HouseIcon,
  ImagesIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
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
  dashboard: 'Dashboard',
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
  logout: 'Keluar',
  loggingOut: 'Sedang keluar...',
  logoutSuccess: 'Berhasil keluar.',
  logoutFailed: 'Gagal keluar. Silakan coba lagi.',
} as const

type NavigationItem = {
  label: string
  href?: '#'
  to?:
    | '/dashboard'
    | '/home'
    | '/about-us'
    | '/articles'
    | '/divisions'
    | '/document_commitments'
    | '/faqs'
    | '/clients'
    | '/inbox'
    | '/board_members'
    | '/media'
    | '/site_settings'
    | '/users'
  icon: LucideIcon
}

type NavigationSection = {
  // Sections without a label render no heading.
  label?: string
  items: readonly NavigationItem[]
}

export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  {
    items: [
      {
        label: NAVIGATION_LABELS.dashboard,
        to: '/dashboard',
        icon: LayoutDashboardIcon,
      },
    ],
  },
  {
    label: NAVIGATION_LABELS.contentManager,
    items: [
      {
        label: NAVIGATION_LABELS.home,
        to: '/home',
        icon: HouseIcon,
      },
      {
        label: NAVIGATION_LABELS.aboutUs,
        to: '/about-us',
        icon: Building2Icon,
      },
      {
        label: NAVIGATION_LABELS.articles,
        to: '/articles',
        icon: NewspaperIcon,
      },
      {
        label: NAVIGATION_LABELS.divisionsAndServices,
        to: '/divisions',
        icon: ZapIcon,
      },
      {
        label: NAVIGATION_LABELS.commitmentDocuments,
        to: '/document_commitments',
        icon: FileTextIcon,
      },
      {
        label: NAVIGATION_LABELS.management,
        to: '/board_members',
        icon: UsersIcon,
      },
      {
        label: NAVIGATION_LABELS.faq,
        to: '/faqs',
        icon: CircleHelpIcon,
      },
      {
        label: NAVIGATION_LABELS.clients,
        to: '/clients',
        icon: HandshakeIcon,
      },
      {
        label: NAVIGATION_LABELS.inbox,
        to: '/inbox',
        icon: MailIcon,
      },
    ],
  },
  {
    label: NAVIGATION_LABELS.media,
    items: [
      {
        label: NAVIGATION_LABELS.mediaLibrary,
        to: '/media',
        icon: ImagesIcon,
      },
    ],
  },
  {
    label: NAVIGATION_LABELS.settings,
    items: [
      {
        label: NAVIGATION_LABELS.siteSettings,
        to: '/site_settings',
        icon: SettingsIcon,
      },
      {
        label: NAVIGATION_LABELS.usersAndAccess,
        to: '/users',
        icon: KeyRoundIcon,
      },
    ],
  },
]
