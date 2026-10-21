import type { FaqListItem } from '@/module/faq/api/faq.api'
import { FaqFormCard } from '@/module/faq/components/faq-form-card'
import type { FaqFormFields } from '@/module/faq/components/faq-form-card'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { faqQueryOptions } from '@/module/faq/queries/faq.queries'
import type { Language } from '@/module/language/api/language.api'
import { Button } from '@/shared/components/ui/button'
import { useQuery } from '@tanstack/react-query'

interface FaqEditorProps {
  faq: FaqListItem
  language: Language
  pending: boolean
  onCancel: () => void
  onDirtyChange: (dirty: boolean) => void
  onSubmit: (fields: FaqFormFields) => void
}

// Edits the page's selected language of an existing FAQ.
function FaqEditor({
  faq,
  language,
  pending,
  onCancel,
  onDirtyChange,
  onSubmit,
}: FaqEditorProps) {
  const { t } = useI18n()
  const faqQuery = useQuery(faqQueryOptions(faq.id))

  if (faqQuery.isError) {
    return (
      <EditorMessage
        message={t.faq.faqFailed}
        onRetry={() => void faqQuery.refetch()}
      />
    )
  }
  if (faqQuery.isPending) {
    return <EditorMessage message={t.faq.loadingFaq} />
  }

  const content = faqQuery.data.contents.find(
    (item) => item.language_id === language.id,
  )

  return (
    <FaqFormCard
      // Remount per language so the form loads that language's content.
      key={language.id}
      title={t.faq.editTitle(faq.question ?? '')}
      initial={content}
      pending={pending}
      onCancel={onCancel}
      onDirtyChange={onDirtyChange}
      onSubmit={onSubmit}
    />
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
