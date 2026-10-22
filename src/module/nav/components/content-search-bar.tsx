import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { SearchIcon } from 'lucide-react'

type ContentSearchBarProps = {
  onClick: () => void
}

// Looks like an input but only opens the search dialog, where typing happens.
function ContentSearchBar({ onClick }: ContentSearchBarProps) {
  const { t } = useI18n()

  return (
    <button
      type="button"
      aria-label={t.nav.searchLabel}
      onClick={onClick}
      className="border-border bg-primary text-foreground/50 focus-visible:ring-accent/30 flex h-10 w-full items-center gap-2 rounded-full border px-3 text-sm outline-none focus-visible:ring-2"
    >
      <SearchIcon aria-hidden="true" className="size-4" />
      {t.nav.searchPlaceholder}
    </button>
  )
}

export { ContentSearchBar }
