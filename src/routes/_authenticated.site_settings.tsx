import { SiteSettingsPage } from '@/module/site_settings/pages/site-settings-page'
import { siteSettingsSearchSchema } from '@/module/site_settings/schemas/site-settings.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/site_settings')({
  validateSearch: siteSettingsSearchSchema,
  component: SiteSettingsPage,
  staticData: { title: (t) => t.siteSettings.pageTitle },
})
