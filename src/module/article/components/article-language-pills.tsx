import type { ArticleStatus } from '@/module/article/api/article.api'
import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { cn } from '@/shared/lib/utils'
import type { ComponentProps } from 'react'

type LanguagePillStatus = ArticleStatus | 'MISSING'

const LANGUAGE_PILLS: Record<
  LanguagePillStatus,
  { label: string; className: string }
> = {
  PUBLISHED: {
    label: ARTICLE_LABELS.published,
    className: 'bg-success/10 text-success',
  },
  DRAFT: {
    label: ARTICLE_LABELS.draft,
    className: 'bg-warning/15 text-warning',
  },
  MISSING: {
    label: ARTICLE_LABELS.translationMissing,
    className: 'bg-foreground/10 text-foreground/50',
  },
}

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
  return (
    <div className="text-foreground/55 flex flex-wrap items-center gap-2 px-4 pb-4 text-xs">
      <span>{ARTICLE_LABELS.languageLegend}</span>
      {(Object.keys(LANGUAGE_PILLS) as LanguagePillStatus[]).map((status) => (
        <LanguagePill key={status} status={status}>
          {LANGUAGE_PILLS[status].label}
        </LanguagePill>
      ))}
    </div>
  )
}

// One pill per language, colored by that language's content status.
function ArticleLanguagePills({
  languages,
}: {
  languages: { language_id: string; status: ArticleStatus | null }[]
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {languages.map((language) => {
        const status = language.status ?? 'MISSING'
        const code = language.language_id.toUpperCase()
        const label = ARTICLE_LABELS.languageStatus(
          code,
          LANGUAGE_PILLS[status].label,
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

export { ArticleLanguageLegend, ArticleLanguagePills }
