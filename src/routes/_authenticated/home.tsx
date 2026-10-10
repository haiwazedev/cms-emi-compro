import { HOME_LABELS } from '@/module/home/constants/home.constants'
import { HomePage } from '@/module/home/pages/home-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/home')({
  component: HomePage,
  staticData: { title: HOME_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: HOME_LABELS.documentTitle }],
  }),
})
