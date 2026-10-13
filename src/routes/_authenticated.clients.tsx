import { CLIENT_LABELS } from '@/module/client/constants/client.constants'
import { ClientsPage } from '@/module/client/pages/clients-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/clients')({
  component: ClientsPage,
  staticData: { title: CLIENT_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: CLIENT_LABELS.documentTitle }],
  }),
})
