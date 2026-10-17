import {
  ARTICLE_DEFAULT_PAGE_SIZE,
  ARTICLE_PAGE_SIZES,
} from '@/module/article/constants/article.constants'
import { z } from 'zod'

export const articleSearchSchema = z.object({
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
    .refine((value) =>
      ARTICLE_PAGE_SIZES.includes(value as (typeof ARTICLE_PAGE_SIZES)[number]),
    )
    .catch(ARTICLE_DEFAULT_PAGE_SIZE)
    .optional()
    .transform((value) => value ?? ARTICLE_DEFAULT_PAGE_SIZE),
  search: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined),
  article_category_id: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .catch(undefined),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().catch(undefined),
  sort_order: z
    .enum(['asc', 'desc'])
    .catch('desc')
    .optional()
    .transform((value) => value ?? 'desc'),
})

export type ArticleSearch = z.infer<typeof articleSearchSchema>

// Language id, e.g. "en" (any case accepted); resolved against active languages on the page.
export const articleEditSearchSchema = z.object({
  lang: z.string().toLowerCase().optional().catch(undefined),
})
