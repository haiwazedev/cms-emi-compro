import { InboxPage } from '@/module/inbox/pages/inbox-page'
import { inboxSearchSchema } from '@/module/inbox/schemas/inbox-search.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/inbox')({
  validateSearch: inboxSearchSchema,
  component: InboxPage,
  staticData: { title: (t) => t.inbox.pageTitle },
})
