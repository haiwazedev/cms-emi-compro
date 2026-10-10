import { ABOUT_US_LABELS } from '@/module/about-us/constants/about-us.constants'
import { AboutUsPage } from '@/module/about-us/pages/about-us-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/about-us')({
  component: AboutUsPage,
  staticData: { title: ABOUT_US_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: ABOUT_US_LABELS.documentTitle }],
  }),
})
