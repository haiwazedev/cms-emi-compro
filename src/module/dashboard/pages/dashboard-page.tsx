import { DashboardViewSiteButton } from '@/module/dashboard/components/dashboard-view-site-button'
import { DashboardRecentActivity } from '@/module/dashboard/components/dashboard-recent-activity'
import { DashboardLatestArticles } from '@/module/dashboard/components/dashboard-latest-articles'
import { DashboardArticleStatCard } from '@/module/dashboard/components/dashboard-article-stat-card'
import {
  DashboardDocumentStatCard,
  DashboardInboxStatCard,
  DashboardServiceStatCard,
} from '@/module/dashboard/components/dashboard-count-stat-cards'
import {
  DASHBOARD_LABELS,
  DASHBOARD_QUICK_LINKS,
  DASHBOARD_USER_NAME,
} from '@/module/dashboard/constants/dashboard.constants'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Link } from '@tanstack/react-router'
import {
  FileTextIcon,
  HouseIcon,
  MailIcon,
  NewspaperIcon,
  PlusIcon,
  type LucideIcon,
} from 'lucide-react'

const QUICK_LINK_ICONS: Record<
  (typeof DASHBOARD_QUICK_LINKS)[number]['key'],
  LucideIcon
> = {
  article: NewspaperIcon,
  document: FileTextIcon,
  home: HouseIcon,
  inbox: MailIcon,
}

function DashboardPage() {
  return (
    <div className="bg-primary flex min-h-full flex-col gap-6 p-4 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-accent text-2xl font-bold lg:text-3xl">
            {DASHBOARD_LABELS.greeting(DASHBOARD_USER_NAME)}
          </h1>
          <p className="text-foreground/60 text-sm lg:text-base">
            {DASHBOARD_LABELS.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <DashboardViewSiteButton />
          <Button asChild>
            <Link to="/articles/create">
              <PlusIcon aria-hidden="true" className="size-4" />
              {DASHBOARD_LABELS.newArticle}
            </Link>
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <DashboardArticleStatCard />
        <DashboardDocumentStatCard />
        <DashboardServiceStatCard />
        <DashboardInboxStatCard />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Latest articles */}
          <DashboardLatestArticles />
        </div>

        <aside className="flex flex-col gap-6 lg:w-80">
          {/* Recent activity */}
          <DashboardRecentActivity />

          {/* Quick access */}
          <Card>
            <CardContent className="flex flex-col gap-3 space-y-0">
              <h2 className="text-foreground/60 text-xs font-semibold tracking-wider uppercase">
                {DASHBOARD_LABELS.quickAccess}
              </h2>
              {DASHBOARD_QUICK_LINKS.map((link) => {
                const Icon = QUICK_LINK_ICONS[link.key]

                return (
                  <Button
                    key={link.key}
                    asChild
                    variant="outline"
                    className="justify-start"
                  >
                    <Link to={link.to}>
                      <Icon aria-hidden="true" className="size-4" />
                      {link.label}
                    </Link>
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

export { DashboardPage }
