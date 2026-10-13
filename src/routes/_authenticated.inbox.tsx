import { INBOX_LABELS } from '@/module/inbox/constants/inbox.constants'
import { InboxPage } from '@/module/inbox/pages/inbox-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/inbox')({
  component: InboxPage,
  staticData: { title: INBOX_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: INBOX_LABELS.documentTitle }],
  }),
})
