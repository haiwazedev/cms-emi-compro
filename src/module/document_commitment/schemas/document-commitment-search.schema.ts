import { DOCUMENT_COMMITMENT_DEFAULT_PAGE_SIZE } from '../constants/document-commitment.constants'
import { z } from 'zod'

export const documentCommitmentSearchSchema = z.object({
  lang: z.string().toLowerCase().optional().catch(undefined),
  page: z.coerce
    .number()
    .int()
    .positive()
    .catch(1)
    .optional()
    .transform((value) => value ?? 1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .catch(DOCUMENT_COMMITMENT_DEFAULT_PAGE_SIZE)
    .optional()
    .transform((value) => value ?? DOCUMENT_COMMITMENT_DEFAULT_PAGE_SIZE),
  search: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined),
  document_commitment_category_id: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .catch(undefined),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().catch(undefined),
})

export const documentCommitmentCategorySearchSchema = z.object({
  lang: z.string().toLowerCase().optional().catch(undefined),
})

export type DocumentCommitmentSearch = z.infer<
  typeof documentCommitmentSearchSchema
>
