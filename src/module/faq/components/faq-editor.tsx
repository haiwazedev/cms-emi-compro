import type { FaqListItem } from '@/module/faq/api/faq.api'
import { FaqFormCard } from '@/module/faq/components/faq-form-card'
import type { FaqFormFields } from '@/module/faq/components/faq-form-card'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { faqQueryOptions } from '@/module/faq/queries/faq.queries'
import { LanguageSelect } from '@/module/language/components/language-select'
import { findDefaultLanguage } from '@/module/language/constants/language.constants'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import { Button } from '@/shared/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

interface FaqEditorProps {
  faq: FaqListItem
  pending: boolean
  onCancel: () => void
  onSubmit: (languageId: string, fields: FaqFormFields) => void
}

// Edits one language of an existing FAQ; `?lang=` picks the language.
function FaqEditor({ faq, pending, onCancel, onSubmit }: FaqEditorProps) {
  const { t } = useI18n()
  const navigate = useNavigate({ from: '/faqs' })
  const { lang } = useSearch({ from: '/_authenticated/faqs' })
  const languagesQuery = useQuery(languagesQueryOptions())
  const faqQuery = useQuery(faqQueryOptions(faq.id))
  const [dirty, setDirty] = useState(false)

  const languages = languagesQuery.data ?? []
  const language =
    languages.find((item) => item.id === lang) ?? findDefaultLanguage(languages)

  function requestLanguage(id: string) {
    if (id === language?.id) return
    if (dirty && !window.confirm(t.faq.discardChangesConfirm)) return

    setDirty(false)
    void navigate({ search: { lang: id } })
  }

  if (languagesQuery.isError) {
    return (
      <EditorMessage
        message={t.faq.languagesFailed}
        onRetry={() => void languagesQuery.refetch()}
      />
    )
  }
  if (faqQuery.isError) {
    return (
      <EditorMessage
        message={t.faq.faqFailed}
        onRetry={() => void faqQuery.refetch()}
      />
    )
  }
  if (languagesQuery.isPending || faqQuery.isPending) {
    return <EditorMessage message={t.faq.loadingFaq} />
  }
  if (!language) {
    return <EditorMessage message={t.faq.noLanguages} />
  }

  const content = faqQuery.data.contents.find(
    (item) => item.language_id === language.id,
  )

  return (
    <div className="flex flex-col gap-4">
      <LanguageSelect
        label={t.faq.language}
        languages={languages}
        value={language.id}
        onChange={requestLanguage}
      />

      <FaqFormCard
        // Remount per language so the form loads that language's content.
        key={language.id}
        title={t.faq.editTitle(faq.question ?? '')}
        initial={content}
        pending={pending}
        onCancel={onCancel}
        onDirtyChange={setDirty}
        onSubmit={(fields) => onSubmit(language.id, fields)}
      />
    </div>
  )
}

function EditorMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
      <p role={onRetry ? 'alert' : 'status'} className="text-muted text-sm">
        {message}
      </p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  )
}

export { FaqEditor }
