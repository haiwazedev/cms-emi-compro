import { DocumentCommitmentCategoriesPage } from '@/module/document_commitment/pages/document-commitment-categories-page'
import { documentCommitmentCategorySearchSchema } from '@/module/document_commitment/schemas/document-commitment-search.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/document_commitment_categories',
)({
  validateSearch: documentCommitmentCategorySearchSchema,
  component: DocumentCommitmentCategoriesPage,
  staticData: { title: (t) => t.documentCommitment.categoryPageTitle },
})
