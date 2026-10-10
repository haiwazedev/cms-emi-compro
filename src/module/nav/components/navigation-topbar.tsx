import { MobileNavigationDrawer } from './mobile-navigation-drawer'
import { ContentSearchBar } from './content-search-bar'
import { LanguageSelector } from './language-selector'
import { ProfileAvatar } from './profile-avatar'

type NavigationTopbarProps = {
  title: string
}

function NavigationTopbar({ title }: NavigationTopbarProps) {
  return (
    <header className="bg-background px-4 py-3 lg:flex lg:h-16 lg:items-center lg:justify-between lg:px-8 lg:py-0">
      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNavigationDrawer />
          <p className="text-accent truncate text-sm font-semibold">{title}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:gap-4">
          <div className="hidden w-64 lg:block">
            <ContentSearchBar />
          </div>
          <LanguageSelector />
          <ProfileAvatar />
        </div>
      </div>

      <div className="mt-3 lg:hidden">
        <ContentSearchBar />
      </div>
    </header>
  )
}

export { NavigationTopbar }
