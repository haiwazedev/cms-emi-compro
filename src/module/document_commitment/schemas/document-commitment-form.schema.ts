import { DOCUMENT_COMMITMENT_LABELS } from '../constants/document-commitment.constants'
import { z } from 'zod'

export const documentCommitmentFormSchema = z.object({
  document_commitment_category_id: z
    .number()
    .positive({ error: DOCUMENT_COMMITMENT_LABELS.categoryRequired }),
  title: z
    .string()
    .trim()
    .min(1, { error: DOCUMENT_COMMITMENT_LABELS.titleRequired })
    .max(200, { error: 'Judul dokumen maksimal 200 karakter.' }),
  status: z.enum(['DRAFT', 'PUBLISHED']),
})

export type DocumentCommitmentFormValues = z.infer<
  typeof documentCommitmentFormSchema
>

export const documentCommitmentCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: DOCUMENT_COMMITMENT_LABELS.categoryNameRequired })
    .max(100, { error: DOCUMENT_COMMITMENT_LABELS.categoryNameTooLong }),
})

export type DocumentCommitmentCategoryFormValues = z.infer<
  typeof documentCommitmentCategoryFormSchema
>
