import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { z } from 'zod'

export const articleFormSchema = z.object({
  article_category_id: z
    .number()
    .positive({ error: ARTICLE_LABELS.categoryRequired }),
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
