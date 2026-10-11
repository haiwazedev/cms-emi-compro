import { DocumentCommitmentCategoriesPage } from '@/module/document_commitment/pages/document-commitment-categories-page'
import { DOCUMENT_COMMITMENT_LABELS } from '@/module/document_commitment/constants/document-commitment.constants'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/document_commitment_categories',
)({
  component: DocumentCommitmentCategoriesPage,
  staticData: { title: DOCUMENT_COMMITMENT_LABELS.categoryPageTitle },
  head: () => ({
    meta: [{ title: DOCUMENT_COMMITMENT_LABELS.categoryDocumentTitle }],
  }),
})
