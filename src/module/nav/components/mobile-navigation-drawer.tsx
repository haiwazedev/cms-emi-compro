import { NavigationSidebar } from './navigation-sidebar'
import { NAVIGATION_LABELS } from '../constants/navigation.constants'
import { Button } from '@/shared/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import { MenuIcon, XIcon } from 'lucide-react'

function MobileNavigationDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={NAVIGATION_LABELS.openNavigation}
          className="shrink-0 lg:hidden"
        >
          <MenuIcon aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        aria-label={NAVIGATION_LABELS.navigation}
        className="w-64 border-0 bg-transparent p-0 text-white shadow-none"
      >
        <SheetTitle className="sr-only">
          {NAVIGATION_LABELS.navigation}
        </SheetTitle>
        <SheetClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={NAVIGATION_LABELS.closeNavigation}
            className="absolute top-3 right-3 z-10 text-white hover:bg-white/10 hover:text-white"
          >
            <XIcon aria-hidden="true" className="size-4" />
          </Button>
        </SheetClose>
        <NavigationSidebar className="w-64" />
      </SheetContent>
    </Sheet>
  )
}

export { MobileNavigationDrawer }
