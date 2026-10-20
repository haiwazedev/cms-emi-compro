import type { ArticleStatus } from '@/module/article/api/article.api'
import type { Dictionary } from '@/shared/lib/i18n/id'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { cn } from '@/shared/lib/utils'
import type { ComponentProps } from 'react'

type LanguagePillStatus = ArticleStatus | 'MISSING'

const LANGUAGE_PILLS = {
  PUBLISHED: {
    labelKey: 'published',
    className: 'bg-success/10 text-success',
  },
  DRAFT: {
    labelKey: 'draft',
    className: 'bg-warning/15 text-warning',
  },
  MISSING: {
    labelKey: 'translationMissing',
    className: 'bg-foreground/10 text-foreground/50',
  },
} as const satisfies Record<
  LanguagePillStatus,
  { labelKey: keyof Dictionary['article']; className: string }
>

function LanguagePill({
  status,
  className,
  ...props
}: ComponentProps<'span'> & { status: LanguagePillStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        LANGUAGE_PILLS[status].className,
        className,
      )}
      {...props}
    />
  )
}

function ArticleLanguageLegend() {
  const { t } = useI18n()
  return (
    <div className="text-foreground/55 flex flex-wrap items-center gap-2 px-4 pb-4 text-xs">
      <span>{t.article.languageLegend}</span>
      {(Object.keys(LANGUAGE_PILLS) as LanguagePillStatus[]).map((status) => (
        <LanguagePill key={status} status={status}>
          {t.article[LANGUAGE_PILLS[status].labelKey]}
        </LanguagePill>
      ))}
    </div>
  )
}

function ArticleStatusPill({ status }: { status: ArticleStatus | null }) {
  const { t } = useI18n()
  if (!status) return '-'

  return (
    <LanguagePill status={status} className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {t.article[LANGUAGE_PILLS[status].labelKey]}
    </LanguagePill>
  )
}

// One pill per language, colored by that language's content status.
function ArticleLanguagePills({
  languages,
}: {
  languages: { language_id: string; status: ArticleStatus | null }[]
}) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap gap-1">
      {languages.map((language) => {
        const status = language.status ?? 'MISSING'
        const code = language.language_id.toUpperCase()
        const label = t.article.languageStatus(
          code,
          t.article[LANGUAGE_PILLS[status].labelKey],
        )

        return (
          <LanguagePill
            key={language.language_id}
            status={status}
            title={label}
            aria-label={label}
          >
            {code}
          </LanguagePill>
        )
      })}
    </div>
  )
}

export { ArticleLanguageLegend, ArticleLanguagePills, ArticleStatusPill }
