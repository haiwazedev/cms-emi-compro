import type { Dictionary } from '@/shared/lib/i18n/id'
import { slugify } from '@/shared/lib/utils'
import { z } from 'zod'

export function createArticleFormSchema(t: Dictionary) {
  // Language-dependent fields; the form holds one language at a time.
  const articleContentSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1, { error: t.article.titleRequired })
      .max(120, { error: t.article.titleTooLong }),
    slug: z
      .string()
      .trim()
      .min(1, { error: t.article.slugRequired })
      .max(255, { error: t.article.slugTooLong }),
    summary: z.string().trim().min(1, { error: t.article.summaryRequired }),
    content: z.string().min(1, { error: t.article.contentRequired }),
  })

  return articleContentSchema.extend({
    article_category_id: z
      .number()
      .positive({ error: t.article.categoryRequired }),
    issue_date: z.string(),
    press_release_number: z
      .string()
      .max(255, { error: t.article.pressReleaseNumberTooLong }),
    cp_name: z.string().max(100, { error: t.article.contactNameTooLong }),
    cp_role: z.string().max(100, { error: t.article.contactRoleTooLong }),
    cp_phone_number: z
      .string()
      .max(100, { error: t.article.contactPhoneTooLong }),
    cp_email: z
      .string()
      .max(100, { error: t.article.contactEmailTooLong })
      .refine(
        (value) => !value || z.email().safeParse(value).success,
        t.article.contactEmailInvalid,
      ),
  })
}

export type ArticleFormValues = z.infer<
  ReturnType<typeof createArticleFormSchema>
>

export function createArticleCategoryFormSchema(t: Dictionary) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { error: t.article.categoryNameRequired })
      .max(100, { error: t.article.categoryNameTooLong })
      .refine((name) => slugify(name).length > 0, {
        error: t.article.categoryNameNoSlug,
      }),
  })
}

export type ArticleCategoryFormValues = z.infer<
  ReturnType<typeof createArticleCategoryFormSchema>
>
