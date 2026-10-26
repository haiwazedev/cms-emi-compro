import { z } from 'zod'
import type { Dictionary } from '@/shared/lib/i18n/id'

export function createDocumentCommitmentFormSchema(t: Dictionary) {
  return z.object({
    document_commitment_category_id: z
      .number()
      .positive({ error: t.documentCommitment.categoryRequired }),
    title: z
      .string()
      .trim()
      .min(1, { error: t.documentCommitment.titleRequired })
      .max(200, { error: t.documentCommitment.titleTooLong }),
    status: z.enum(['DRAFT', 'PUBLISHED']),
  })
}

export type DocumentCommitmentFormValues = z.infer<
  ReturnType<typeof createDocumentCommitmentFormSchema>
>

export function createDocumentCommitmentCategoryFormSchema(t: Dictionary) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { error: t.documentCommitment.categoryNameRequired })
      .max(100, { error: t.documentCommitment.categoryNameTooLong }),
    slug: z
      .string()
      .trim()
      .min(1, { error: t.documentCommitment.categorySlugRequired })
      .max(100, { error: t.documentCommitment.categorySlugTooLong }),
  })
}

export type DocumentCommitmentCategoryFormValues = z.infer<
  ReturnType<typeof createDocumentCommitmentCategoryFormSchema>
>
