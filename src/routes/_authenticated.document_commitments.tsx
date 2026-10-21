import { DocumentCommitmentsPage } from '@/module/document_commitment/pages/document-commitments-page'
import { documentCommitmentSearchSchema } from '@/module/document_commitment/schemas/document-commitment-search.schema'
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/document_commitments')({
  validateSearch: documentCommitmentSearchSchema,
  search: {
    middlewares: [
      stripSearchParams({
        page: 1,
        limit: 7,
      }),
    ],
  },
  component: DocumentCommitmentsPage,
  staticData: { title: (t) => t.documentCommitment.pageTitle },
})
