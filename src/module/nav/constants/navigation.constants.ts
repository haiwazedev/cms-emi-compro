import type { Dictionary } from '@/shared/lib/i18n/id'
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

// Brand marks are not translated.
export const NAVIGATION_BRAND = {
  cmsMark: 'CMS',
  cmsName: 'PLN EMI',
} as const

type NavigationLabelKey = keyof Dictionary['nav']

type NavigationItem = {
  labelKey: NavigationLabelKey
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
  labelKey?: NavigationLabelKey
  items: readonly NavigationItem[]
}

export const NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  {
    items: [
      {
        labelKey: 'dashboard',
        to: '/dashboard',
        icon: LayoutDashboardIcon,
      },
    ],
  },
  {
    labelKey: 'contentManager',
    items: [
      {
        labelKey: 'home',
        to: '/home',
        icon: HouseIcon,
      },
      {
        labelKey: 'aboutUs',
        to: '/about-us',
        icon: Building2Icon,
      },
      {
        labelKey: 'articles',
        to: '/articles',
        icon: NewspaperIcon,
      },
      {
        labelKey: 'divisionsAndServices',
        to: '/divisions',
        icon: ZapIcon,
      },
      {
        labelKey: 'commitmentDocuments',
        to: '/document_commitments',
        icon: FileTextIcon,
      },
      {
        labelKey: 'management',
        to: '/board_members',
        icon: UsersIcon,
      },
      {
        labelKey: 'faq',
        to: '/faqs',
        icon: CircleHelpIcon,
      },
      {
        labelKey: 'clients',
        to: '/clients',
        icon: HandshakeIcon,
      },
      {
        labelKey: 'inbox',
        to: '/inbox',
        icon: MailIcon,
      },
    ],
  },
  {
    labelKey: 'media',
    items: [
      {
        labelKey: 'mediaLibrary',
        to: '/media',
        icon: ImagesIcon,
      },
    ],
  },
  {
    labelKey: 'settings',
    items: [
      {
        labelKey: 'siteSettings',
        to: '/site_settings',
        icon: SettingsIcon,
      },
      {
        labelKey: 'usersAndAccess',
        to: '/users',
        icon: KeyRoundIcon,
      },
    ],
  },
]
