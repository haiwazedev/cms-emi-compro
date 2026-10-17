import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { slugify } from '@/shared/lib/utils'
import { z } from 'zod'

// Language-dependent fields; the form holds one language at a time.
const articleContentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: ARTICLE_LABELS.titleRequired })
    .max(120, { error: 'Judul maksimal 120 karakter.' }),
  slug: z
    .string()
    .trim()
    .min(1, { error: ARTICLE_LABELS.slugRequired })
    .max(255, { error: 'Slug maksimal 255 karakter.' }),
  summary: z.string().trim().min(1, { error: ARTICLE_LABELS.summaryRequired }),
  content: z.string().min(1, { error: ARTICLE_LABELS.contentRequired }),
})

export const articleFormSchema = articleContentSchema.extend({
  article_category_id: z
    .number()
    .positive({ error: ARTICLE_LABELS.categoryRequired }),
  issue_date: z.string(),
  press_release_number: z
    .string()
    .max(255, { error: 'Nomor siaran pers maksimal 255 karakter.' }),
  cp_name: z.string().max(100, { error: 'Nama maksimal 100 karakter.' }),
  cp_role: z.string().max(100, { error: 'Jabatan maksimal 100 karakter.' }),
  cp_phone_number: z
    .string()
    .max(100, { error: 'Telepon maksimal 100 karakter.' }),
  cp_email: z
    .string()
    .max(100, { error: 'Email maksimal 100 karakter.' })
    .refine(
      (value) => !value || z.email().safeParse(value).success,
      'Format email tidak valid.',
    ),
})

export type ArticleFormValues = z.infer<typeof articleFormSchema>

export const articleCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: ARTICLE_LABELS.categoryNameRequired })
    .max(100, { error: ARTICLE_LABELS.categoryNameTooLong })
    .refine((name) => slugify(name).length > 0, {
      error: ARTICLE_LABELS.categoryNameNoSlug,
    }),
})

export type ArticleCategoryFormValues = z.infer<
  typeof articleCategoryFormSchema
>
