import { SITE_SETTINGS_LABELS } from '@/module/site_settings/constants/site-settings.constants'
import { SiteSettingsPage } from '@/module/site_settings/pages/site-settings-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/site_settings')({
  component: SiteSettingsPage,
  staticData: { title: SITE_SETTINGS_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: SITE_SETTINGS_LABELS.documentTitle }],
  }),
})
