import { DICTIONARIES, type Locale } from '@/shared/lib/i18n/i18n-context'
export const USER_LABELS = {
  pageTitle: 'Pengguna & Akses',
  documentTitle: 'Pengguna & Akses | PLN EMI CMS',
} as const

export const ROLE_LABELS = {
  pageTitle: 'Kelola Peran',
  documentTitle: 'Kelola Peran | PLN EMI CMS',
} as const

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
