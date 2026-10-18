const MINUTE = 60_000
const HOUR = 60 * MINUTE

// "baru saja", "5 menit lalu", "2 jam lalu", "Kemarin", "3 hari lalu", then a date.
export function formatRelativeTime(value: string, now = new Date()): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const elapsed = now.getTime() - date.getTime()
  const days = calendarDaysBetween(date, now)

  if (elapsed < MINUTE) return 'baru saja'
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} menit lalu`
  if (days === 0) return `${Math.floor(elapsed / HOUR)} jam lalu`
  if (days === 1) return 'Kemarin'
  if (days < 7) return `${days} hari lalu`

  return new Intl.DateTimeFormat('id-ID', {
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
