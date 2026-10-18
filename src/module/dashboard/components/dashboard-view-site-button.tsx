import { DASHBOARD_LABELS } from '@/module/dashboard/constants/dashboard.constants'
import { DEFAULT_LANGUAGE_ID } from '@/module/language/constants/language.constants'
import { siteSettingsQueryOptions } from '@/module/site_settings/queries/site-settings.queries'
import { Button } from '@/shared/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { ExternalLinkIcon } from 'lucide-react'

function DashboardViewSiteButton() {
  const { data: siteUrl } = useQuery({
    ...siteSettingsQueryOptions(DEFAULT_LANGUAGE_ID),
    select: (settings) => settings.landingSiteUrl,
  })

  const content = (
    <>
      <ExternalLinkIcon aria-hidden="true" className="size-4" />
      {DASHBOARD_LABELS.viewSite}
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
