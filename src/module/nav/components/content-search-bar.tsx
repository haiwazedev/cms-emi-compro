import { Input } from '@/shared/components/ui/input'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { SearchIcon } from 'lucide-react'

function ContentSearchBar() {
  const { t } = useI18n()

  return (
    <div className="relative w-full">
      <SearchIcon
        aria-hidden="true"
        className="text-foreground/50 absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        aria-label={t.nav.searchLabel}
        placeholder={t.nav.searchPlaceholder}
        className="border-border bg-primary h-10 rounded-full pl-10 text-sm"
      />
    </div>
  )
}

export { ContentSearchBar }
