import type { SiteSettingsFormValues } from '@/module/site_settings/schemas/site-settings.schema'

export const SITE_SETTINGS_LABELS = {
  pageTitle: 'Pengaturan Situs',
  documentTitle: 'Pengaturan Situs | CMS PLN EMI',
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
  locationLat: '',
  locationLong: '',
  phone: '',
  whatsapp: '',
  mainEmail: '',
  marketingEmail: '',
  operatingDays: '',
  openTime: '',
  closeTime: '',
  socialLinks: [],
}
