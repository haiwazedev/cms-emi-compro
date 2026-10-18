import { DashboardStatCard } from '@/module/dashboard/components/dashboard-stat-card'
import {
  DASHBOARD_ACTION_ITEMS,
  DASHBOARD_ACTIVITIES,
  DASHBOARD_ARTICLES,
  DASHBOARD_LABELS,
  DASHBOARD_QUICK_LINKS,
  DASHBOARD_SITE_URL,
  DASHBOARD_STATS,
  DASHBOARD_USER_NAME,
  type DashboardStatKey,
} from '@/module/dashboard/constants/dashboard.constants'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HouseIcon,
  ImageIcon,
  MailIcon,
  NewspaperIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react'

const STAT_ICONS: Record<
  DashboardStatKey,
  { icon: LucideIcon; className: string }
> = {
  articles: {
    icon: NewspaperIcon,
    className: 'bg-secondary/10 text-secondary',
  },
  documents: { icon: FileTextIcon, className: 'bg-success/10 text-success' },
  services: { icon: ZapIcon, className: 'bg-warning/10 text-warning' },
  inbox: { icon: MailIcon, className: 'bg-danger/10 text-danger' },
}

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
          <Button asChild variant="outline">
            <a href={DASHBOARD_SITE_URL} target="_blank" rel="noreferrer">
              <ExternalLinkIcon aria-hidden="true" className="size-4" />
              {DASHBOARD_LABELS.viewSite}
            </a>
          </Button>
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
        {DASHBOARD_STATS.map((stat) => (
          <DashboardStatCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            note={stat.note}
            icon={STAT_ICONS[stat.key].icon}
            iconClassName={STAT_ICONS[stat.key].className}
          />
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Latest articles */}
          <Card>
            <CardHeader>
              <CardTitle>{DASHBOARD_LABELS.latestArticles}</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/articles">
                  {DASHBOARD_LABELS.viewAll}
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </CardHeader>

            <Table className="min-w-max">
              <TableHeader className="bg-primary">
                <TableRow className="hover:bg-transparent">
                  <TableHead>{DASHBOARD_LABELS.photo}</TableHead>
                  <TableHead>{DASHBOARD_LABELS.title}</TableHead>
                  <TableHead>{DASHBOARD_LABELS.date}</TableHead>
                  <TableHead>{DASHBOARD_LABELS.status}</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">{DASHBOARD_LABELS.actions}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DASHBOARD_ARTICLES.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <span className="bg-primary text-foreground/40 flex size-11 items-center justify-center rounded-md">
                        <ImageIcon aria-hidden="true" className="size-5" />
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-64 flex-col gap-1 whitespace-normal">
                        <span className="text-accent font-semibold">
                          {article.title}
                        </span>
                        <span className="text-foreground/55 text-sm">
                          {article.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground/70 whitespace-nowrap">
                      {article.date}
                    </TableCell>
                    <TableCell>
                      <span className="bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                        <span className="bg-success size-1.5 rounded-full" />
                        {DASHBOARD_LABELS.published}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`${DASHBOARD_LABELS.edit} ${article.title}`}
                        >
                          <PencilIcon aria-hidden="true" className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`${DASHBOARD_LABELS.delete} ${article.title}`}
                        >
                          <Trash2Icon aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Action needed */}
          <Card>
            <CardHeader>
              <CardTitle>{DASHBOARD_LABELS.actionNeeded}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 space-y-0">
              {DASHBOARD_ACTION_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="bg-secondary/10 border-secondary/20 flex gap-3 rounded-lg border p-4"
                >
                  <TriangleAlertIcon
                    aria-hidden="true"
                    className="text-warning size-4 shrink-0"
                  />
                  <div className="flex flex-col gap-1 text-sm">
                    <p className="text-accent font-semibold">{item.title}</p>
                    <p className="text-foreground/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-6 lg:w-80">
          {/* Recent activity */}
          <Card>
            <CardContent className="flex flex-col gap-4 space-y-0">
              <h2 className="text-foreground/60 text-xs font-semibold tracking-wider uppercase">
                {DASHBOARD_LABELS.recentActivity}
              </h2>
              <ul className="flex flex-col gap-4">
                {DASHBOARD_ACTIVITIES.map((activity) => (
                  <li
                    key={`${activity.actor}-${activity.target}`}
                    className="flex gap-3"
                  >
                    <span className="bg-secondary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                      {activity.initials}
                    </span>
                    <div className="flex flex-col gap-0.5 text-sm">
                      <p className="text-foreground/70">
                        <span className="text-accent font-semibold">
                          {activity.actor}
                        </span>{' '}
                        {activity.action}{' '}
                        <span className="text-accent font-semibold">
                          {activity.target}
                        </span>
                      </p>
                      <p className="text-foreground/55 text-xs">
                        {activity.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

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
