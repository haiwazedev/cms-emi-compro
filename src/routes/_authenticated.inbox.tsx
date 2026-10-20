import { InboxPage } from '@/module/inbox/pages/inbox-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/inbox')({
  component: InboxPage,
  staticData: { title: (t) => t.inbox.pageTitle },
})
