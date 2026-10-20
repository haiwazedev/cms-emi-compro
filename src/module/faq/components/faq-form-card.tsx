import { usePermissions } from '@/module/auth/hooks/use-permissions'
import { ArticleRichTextEditor } from '@/module/article/components/article-rich-text-editor'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { FaqStatus, FaqWriteFields } from '@/module/faq/api/faq.api'
import { Button } from '@/shared/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { CheckIcon, LoaderCircleIcon } from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

export type FaqFormFields = Omit<FaqWriteFields, 'language_id'>

interface FaqFormCardProps {
  title: string
  initial?: FaqFormFields
  pending: boolean
  onCancel: () => void
  onSubmit: (fields: FaqFormFields) => void
  onDirtyChange?: (dirty: boolean) => void
}

function FaqFormCard({
  title,
  initial,
  pending,
  onCancel,
  onSubmit,
  onDirtyChange,
}: FaqFormCardProps) {
  const { t } = useI18n()
  const { canPublish } = usePermissions()
  const [question, setQuestion] = useState(initial?.question ?? '')
  const [answer, setAnswer] = useState(initial?.answer ?? '')
  const [status, setStatus] = useState<FaqStatus>(initial?.status ?? 'DRAFT')
  const [formError, setFormError] = useState<string>()
  const dirty =
    question !== (initial?.question ?? '') ||
    answer !== (initial?.answer ?? '') ||
    status !== (initial?.status ?? 'DRAFT')

  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)

    if (!question.trim()) {
      setFormError(t.faq.requiredQuestion)
      return
    }

    if (!answer) {
      setFormError(t.faq.requiredAnswer)
      return
    }

    onSubmit({ question: question.trim(), answer, status })
  }

  return (
    <Card aria-labelledby="faq-form-title">
      <CardHeader>
        <CardTitle id="faq-form-title" className="break-words">
          {title}
        </CardTitle>
      </CardHeader>

      {/* relative: keeps Radix Select's hidden native <select> inside the layout's scroll area. */}
      <form onSubmit={handleSubmit} className="relative flex flex-col">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="faq-question">
              {t.faq.question}{' '}
              <span aria-hidden="true" className="text-danger">
                *
              </span>
            </Label>
            <Input
              id="faq-question"
              required
              maxLength={200}
              disabled={pending}
              value={question}
              onChange={(event) => setQuestion(event.currentTarget.value)}
            />
            <p className="text-muted text-xs">
              {question.length + ' / 200 karakter'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="faq-answer">
              {t.faq.answer}{' '}
              <span aria-hidden="true" className="text-danger">
                *
              </span>
            </Label>
            <div className="border-border rounded-lg border">
              <ArticleRichTextEditor
                id="faq-answer"
                content={answer}
                readOnly={pending}
                onChange={setAnswer}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="faq-status">{t.faq.status}</Label>
            <Select
              value={canPublish ? status : 'DRAFT'}
              disabled={pending || !canPublish}
              onValueChange={(value) => setStatus(value as FaqStatus)}
            >
              <SelectTrigger id="faq-status" className="w-full lg:max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">{t.faq.draft}</SelectItem>
                <SelectItem value="PUBLISHED">{t.faq.published}</SelectItem>
              </SelectContent>
            </Select>
            {!canPublish && (
              <p className="text-muted text-xs">{t.auth.draftOnly}</p>
            )}
          </div>

          {formError && (
            <p role="alert" className="text-danger text-sm">
              {formError}
            </p>
          )}
        </div>

        <div className="bg-primary border-border flex justify-end gap-2 border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onCancel}
          >
            {t.common.cancel}
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="bg-success hover:bg-success/90"
          >
            {pending ? (
              <>
                <LoaderCircleIcon
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
                {t.faq.saving}
              </>
            ) : (
              <>
                <CheckIcon aria-hidden="true" className="size-4" />
                {t.faq.save}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export { FaqFormCard }
