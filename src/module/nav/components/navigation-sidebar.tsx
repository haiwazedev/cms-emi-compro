import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import { Link, useRouterState } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import {
  NAVIGATION_LABELS,
  NAVIGATION_SECTIONS,
} from '../constants/navigation.constants'

type NavigationSidebarProps = Pick<ComponentProps<'aside'>, 'className'>

function NavigationSidebar({ className }: NavigationSidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <aside
      aria-label={NAVIGATION_LABELS.navigation}
      className={cn(
        'bg-accent flex h-screen w-64 shrink-0 flex-col overflow-y-auto px-4 py-5 text-white',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/15 px-1 pb-4">
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-widest">
            {NAVIGATION_LABELS.companyMark}
          </p>
          <p className="text-xs leading-tight text-white/65">
            {NAVIGATION_LABELS.companyName}
          </p>
        </div>
      </header>

      <nav className="flex-1 space-y-6 py-6">
        {NAVIGATION_SECTIONS.map((section) => (
          <section key={section.label} aria-label={section.label}>
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-widest text-white/50">
              {section.label}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.label}>
                  <NavigationItemLink
                    item={item}
                    isCurrent={item.to === pathname}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  )
}

function NavigationItemLink({
  item,
  isCurrent,
}: {
  item: (typeof NAVIGATION_SECTIONS)[number]['items'][number]
  isCurrent: boolean
}) {
  const Icon = item.icon
  const linkClassName = cn(
    'flex min-h-9 items-center gap-3 rounded-md px-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white',
    isCurrent && 'bg-white/10 text-white',
  )
  const content = (
    <>
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.count && (
        <Badge
          variant="secondary"
          className={cn(
            'border-0 bg-transparent px-1 text-xs text-white/50',
            item.label === NAVIGATION_LABELS.inbox &&
              'bg-danger px-2 text-white',
          )}
        >
          {item.count}
        </Badge>
      )}
    </>
  )

  if (item.to) {
    return (
      <Link
        to={item.to}
        search={{}}
        aria-current={isCurrent ? 'page' : undefined}
        className={linkClassName}
      >
        {content}
      </Link>
    )
  }

  return (
    <a
      href={item.href ?? '#'}
      aria-current={isCurrent ? 'page' : undefined}
      className={linkClassName}
    >
      {content}
    </a>
  )
}

export { NavigationSidebar }
