import { DICTIONARIES, type Locale } from './i18n/i18n-context'

const MINUTE = 60_000
const HOUR = 60 * MINUTE

// "baru saja", "5 menit yang lalu", "2 jam yang lalu", "kemarin", "3 hari yang lalu", then a date.
export function formatRelativeTime(
  value: string,
  locale: Locale,
  now = new Date(),
): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const elapsed = now.getTime() - date.getTime()
  const days = calendarDaysBetween(date, now)
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (elapsed < MINUTE) return DICTIONARIES[locale].common.justNow
  if (elapsed < HOUR)
    return relative.format(-Math.floor(elapsed / MINUTE), 'minute')
  if (days === 0) return relative.format(-Math.floor(elapsed / HOUR), 'hour')
  if (days < 7) return relative.format(-days, 'day')

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function calendarDaysBetween(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate())

  return Math.round((end.getTime() - start.getTime()) / (24 * HOUR))
}
