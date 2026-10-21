import { ClientsPage } from '@/module/client/pages/clients-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/clients')({
  component: ClientsPage,
  staticData: { title: (t) => t.client.pageTitle },
})
