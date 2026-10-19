import { Input } from '@/shared/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { NAVIGATION_TOPBAR_LABELS } from '../constants/navigation.constants'

function ContentSearchBar() {
  return (
    <div className="relative w-full">
      <SearchIcon
        aria-hidden="true"
        className="text-foreground/50 absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        aria-label={NAVIGATION_TOPBAR_LABELS.searchLabel}
        placeholder={NAVIGATION_TOPBAR_LABELS.searchPlaceholder}
        className="border-border bg-primary h-10 rounded-full pl-10 text-sm"
      />
    </div>
  )
}

export { ContentSearchBar }
