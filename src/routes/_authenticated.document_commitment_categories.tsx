import { DocumentCommitmentCategoriesPage } from '@/module/document_commitment/pages/document-commitment-categories-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/document_commitment_categories',
)({
  component: DocumentCommitmentCategoriesPage,
  staticData: { title: (t) => t.documentCommitment.categoryPageTitle },
})
