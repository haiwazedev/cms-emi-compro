import { DEFAULT_LANGUAGE_ID } from '@/module/language/constants/language.constants'

// Static landing page copy for previews, keyed by content language (not the CMS UI locale).
// shortcut: copied from emi-compro `src/i18n/messages.ts`, keep in sync when the landing copy changes.
const id = {
  heroBadge: 'Mendorong Masa Depan Berkelanjutan Indonesia',
  exploreServices: 'Jelajahi Layanan',
  learnMore: 'Pelajari Lebih Lanjut',
  aboutEyebrow: 'SEKILAS EMI',
  badges: [
    { label: 'Keberlanjutan', emoji: '🌿' },
    { label: 'Kepatuhan', emoji: '🛡️' },
    { label: 'Efisiensi Energi', emoji: '⚡' },
    { label: 'Aksi Iklim', emoji: '🌐' },
  ],
  aboutBreadcrumb: 'Beranda / Tentang Kami',
  aboutTitle: 'Tentang',
  aboutTitleAccent: 'Kami',
  aboutDescription:
    'Sejak 1987 mendukung program efisiensi energi nasional Indonesia, dan sejak 2021 mengelola Instrumen Hijau serta Nilai Ekonomi Karbon di lingkungan PLN Group.',
  profileEyebrow: 'PROFIL PERUSAHAAN',
  profileTitle: 'Profil Perusahaan',
  ourServices: 'Layanan Kami',
  ourCommitment: 'Komitmen Kami',
  partOf: 'BAGIAN DARI',
  partOfValue: 'PLN Group · Danantara Indonesia',
  historyEyebrow: 'SEJARAH KAMI',
  historyTitle: 'Sejarah Kami',
  historyDescription:
    'Dari Koneba hingga PLN EMI — tonggak perjalanan kami sebagai pelopor konservasi energi di Indonesia.',
  directionEyebrow: 'ARAH PERUSAHAAN',
  vision: 'Visi',
  mission: 'Misi',
}

type LandingCopy = typeof id

const en: LandingCopy = {
  heroBadge: "Powering Indonesia's Sustainable Future",
  exploreServices: 'Explore Services',
  learnMore: 'Learn More',
  aboutEyebrow: 'ABOUT EMI',
  badges: [
    { label: 'Sustainability', emoji: '🌿' },
    { label: 'Compliance', emoji: '🛡️' },
    { label: 'Energy Efficiency', emoji: '⚡' },
    { label: 'Climate Action', emoji: '🌐' },
  ],
  aboutBreadcrumb: 'Home / About Us',
  aboutTitle: 'About',
  aboutTitleAccent: 'Us',
  aboutDescription:
    "Since 1987, supporting Indonesia's national energy efficiency program — and since 2021, managing Green Instruments and Carbon Economic Values across the PLN Group.",
  profileEyebrow: 'COMPANY PROFILE',
  profileTitle: 'Company Profile',
  ourServices: 'Our Services',
  ourCommitment: 'Our Commitment',
  partOf: 'PART OF',
  partOfValue: 'PLN Group · Danantara Indonesia',
  historyEyebrow: 'OUR HISTORY',
  historyTitle: 'Our History',
  historyDescription:
    "From Koneba to PLN EMI — the milestones that shaped our journey as Indonesia's energy conservation pioneer.",
  directionEyebrow: 'DIRECTION',
  vision: 'Vision',
  mission: 'Mission',
}

const LANDING_COPY: Record<string, LandingCopy> = { id, en }

// Unknown languages fall back to the landing default locale.
function getLandingCopy(languageId: string) {
  return LANDING_COPY[languageId] ?? LANDING_COPY[DEFAULT_LANGUAGE_ID]
}

export { getLandingCopy }
