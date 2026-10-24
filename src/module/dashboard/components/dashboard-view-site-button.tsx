import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { appConfigsQueryOptions } from '@/module/app_config/queries/app-config.queries'
import { Button } from '@/shared/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { ExternalLinkIcon } from 'lucide-react'

function DashboardViewSiteButton() {
  const { t } = useI18n()
  const { data: siteUrl } = useQuery({
    ...appConfigsQueryOptions(),
    select: (configs) => configs.landing_site_url,
  })

  const content = (
    <>
      <ExternalLinkIcon aria-hidden="true" className="size-4" />
      {t.dashboard.viewSite}
    </>
  )

  // Disabled while loading, on error, or when the setting is missing.
  if (!siteUrl) {
    return (
      <Button type="button" variant="outline" disabled>
        {content}
      </Button>
    )
  }

  return (
    <Button asChild variant="outline">
      <a href={siteUrl} target="_blank" rel="noreferrer">
        {content}
      </a>
    </Button>
  )
}

export { DashboardViewSiteButton }
