import { articlesQueryOptions } from '@/module/article/queries/article.queries'
import { boardMembersQueryOptions } from '@/module/board_member/queries/board-member.queries'
import { clientsQueryOptions } from '@/module/client/queries/client.queries'
import {
  divisionsQueryOptions,
  servicesQueryOptions,
} from '@/module/division/queries/division.queries'
import { documentCommitmentsQueryOptions } from '@/module/document_commitment/queries/document-commitment.queries'
import { faqsQueryOptions } from '@/module/faq/queries/faq.queries'
import { inboxCountsQueryOptions } from '@/module/inbox/queries/inbox.queries'
import { usePermissions } from '@/module/auth/hooks/use-permissions'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import { useQuery } from '@tanstack/react-query'
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
  const { data: inboxCounts } = useQuery(inboxCountsQueryOptions())
  // Show unread messages first; once all are read, show the inbox total.
  const inboxCount = inboxCounts?.unreadCount || inboxCounts?.readCount
  const counts = useNavigationCounts()
  const { canManageUsers } = usePermissions()

  return (
    <aside
      aria-label={NAVIGATION_LABELS.navigation}
      className={cn(
        'bg-accent flex h-screen w-64 shrink-0 flex-col overflow-y-auto px-4 py-5 text-white',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/15 px-1 pb-4">
        <div className="flex min-w-0 items-center">
          <img src="/pln-logo.png" alt="" />
        </div>
        <div className="shrink-0">
          <p className="text-xs font-semibold tracking-widest text-white/65">
            {NAVIGATION_LABELS.cmsMark}
          </p>
          <p className="text-sm font-bold">{NAVIGATION_LABELS.cmsName}</p>
        </div>
      </header>

      <nav className="flex-1 space-y-6 py-6">
        {NAVIGATION_SECTIONS.map((section) => (
          <section
            key={section.label ?? section.items[0]?.label}
            aria-label={section.label}
          >
            {section.label && (
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-widest text-white/50">
                {section.label}
              </h2>
            )}
            <ul className="space-y-1">
              {section.items
                .filter((item) => item.to !== '/users' || canManageUsers)
                .map((item) => (
                  <li key={item.label}>
                    <NavigationItemLink
                      item={item}
                      count={
                        item.to === '/inbox'
                          ? inboxCount
                            ? String(inboxCount)
                            : undefined
                          : item.to && counts[item.to]
                      }
                      highlighted={
                        item.to === '/inbox' &&
                        Boolean(inboxCounts?.unreadCount)
                      }
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

// Same query keys as the list pages, so their invalidations refresh these counts.
function useNavigationCounts(): Partial<Record<string, string>> {
  const articles = useQuery(
    articlesQueryOptions({
      page: 1,
      limit: 1,
      sort_by: 'created_at',
      sort_order: 'desc',
    }),
  ).data
  const divisions = useQuery(divisionsQueryOptions()).data
  const services = useQuery(servicesQueryOptions()).data
  const documentCommitments = useQuery(
    documentCommitmentsQueryOptions({ page: 1, limit: 1 }),
  ).data
  const boardMembers = useQuery(boardMembersQueryOptions({})).data
  const faqs = useQuery(faqsQueryOptions()).data
  const clients = useQuery(clientsQueryOptions()).data

  return {
    '/articles': toCount(articles?.pagination.totalItems),
    '/divisions':
      divisions && services
        ? toCount(divisions.length + services.length)
        : undefined,
    '/document_commitments': toCount(
      documentCommitments?.pagination.totalItems,
    ),
    '/board_members': toCount(boardMembers?.length),
    '/faqs': toCount(faqs?.length),
    '/clients': toCount(clients?.length),
  }
}

function toCount(value: number | undefined) {
  return value === undefined ? undefined : String(value)
}

function NavigationItemLink({
  item,
  count,
  highlighted,
  isCurrent,
}: {
  item: (typeof NAVIGATION_SECTIONS)[number]['items'][number]
  count?: string
  highlighted: boolean
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
      {count && (
        <Badge
          variant="secondary"
          className={cn(
            'border-0 bg-transparent px-1 text-xs text-white/50',
            highlighted && 'bg-danger px-2 text-white',
          )}
        >
          {count}
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
