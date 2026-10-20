import { usePermissions } from '@/module/auth/hooks/use-permissions'
import {
  createFaq,
  deleteFaq,
  reorderFaqs,
  updateFaq,
} from '@/module/faq/api/faq.api'
import type { FaqListItem, FaqWriteFields } from '@/module/faq/api/faq.api'
import { ArticleLanguageLegend } from '@/module/article/components/article-language-pills'
import { FaqEditor } from '@/module/faq/components/faq-editor'
import { FaqFormCard } from '@/module/faq/components/faq-form-card'
import { SortableFaqRow } from '@/module/faq/components/sortable-faq-row'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import {
  faqQueryKeys,
  faqsQueryOptions,
} from '@/module/faq/queries/faq.queries'
import { DEFAULT_LANGUAGE_ID } from '@/module/language/constants/language.constants'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { toast } from '@/shared/lib/toast'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoaderCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

type FormState = { faq?: FaqListItem }

function FaqsPage() {
  const { t } = useI18n()
  const { canWrite } = usePermissions()
  const queryClient = useQueryClient()
  const faqsQuery = useQuery(faqsQueryOptions())
  const [form, setForm] = useState<FormState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FaqListItem | null>(null)

  const faqs = faqsQuery.data ?? []

  function showSuccess(description: string) {
    toast.add({ title: t.common.success, description, type: 'success' })
  }

  function showError(error: unknown, fallback: string) {
    toast.add({
      title: t.common.error,
      description: error instanceof Error ? error.message : fallback,
      type: 'error',
    })
  }

  const saveMutation = useMutation({
    mutationFn: ({
      faqId,
      fields,
    }: {
      faqId?: number
      fields: FaqWriteFields
    }) => (faqId ? updateFaq(faqId, fields) : createFaq(fields)),
    onSuccess: async (_faq, variables) => {
      setForm(null)
      await queryClient.invalidateQueries({ queryKey: faqQueryKeys.all })
      showSuccess(variables.faqId === undefined ? t.faq.created : t.faq.updated)
    },
    onError: (error) => showError(error, t.faq.saveFailed),
  })

  const deleteMutation = useMutation({
    mutationFn: (faq: FaqListItem) => deleteFaq(faq.id),
    onSuccess: async (_data, faq) => {
      if (form?.faq?.id === faq.id) setForm(null)
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: faqQueryKeys.all })
      showSuccess(t.faq.deleted)
    },
    onError: (error) => showError(error, t.faq.deleteFailed),
  })

  const reorderMutation = useMutation({
    mutationFn: reorderFaqs,
    onSuccess: (updatedFaqs) => {
      queryClient.setQueryData(faqQueryKeys.list(), updatedFaqs)
    },
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: faqQueryKeys.list() })
      showError(error, t.faq.orderFailed)
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return

    const { source, target } = event.operation
    if (!source || !target || !isSortable(source) || !isSortable(target)) return
    if (source.initialIndex === target.index) return

    const reordered = [...faqs]
    const [moved] = reordered.splice(source.initialIndex, 1)
    reordered.splice(target.index, 0, moved)

    queryClient.setQueryData(faqQueryKeys.list(), reordered)
    reorderMutation.mutate(reordered.map((faq) => faq.id))
  }

  const rowsDisabled = reorderMutation.isPending || deleteMutation.isPending

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        {/* Page Header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Page Title */}
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {t.faq.pageTitle}
            </h1>
            <p className="text-muted text-sm lg:text-base">
              {t.faq.description}
            </p>
          </div>

          {/* Add FAQ Button */}
          {canWrite && (
            <Button
              type="button"
              className="self-start lg:self-auto"
              disabled={saveMutation.isPending}
              onClick={() => setForm({})}
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              {t.faq.addQuestion}
            </Button>
          )}
        </header>

        {/* Content */}
        <Card aria-label={t.faq.pageTitle}>
          {faqsQuery.isPending ? (
            <SectionMessage message={t.faq.loadingFaqs} />
          ) : faqsQuery.isError ? (
            <SectionMessage
              message={t.faq.faqsFailed}
              onRetry={() => void faqsQuery.refetch()}
            />
          ) : faqs.length === 0 ? (
            <SectionMessage message={t.faq.noFaqs} />
          ) : (
            <div className="overflow-x-auto pt-4">
              {/* Language Status Legend */}
              <ArticleLanguageLegend />

              <Table className="min-w-max">
                <TableHeader className="bg-primary">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 px-2" />
                    <TableHead className="text-muted font-bold uppercase">
                      {t.faq.order}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.faq.question}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.faq.status}
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">{t.faq.actions}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq, index) => (
                    <SortableFaqRow
                      key={faq.id}
                      faq={faq}
                      index={index}
                      selected={faq.id === form?.faq?.id}
                      disabled={rowsDisabled}
                      onEdit={() => setForm({ faq })}
                      onDelete={() => setDeleteTarget(faq)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {form?.faq ? (
          <FaqEditor
            key={form.faq.id}
            faq={form.faq}
            pending={saveMutation.isPending}
            onCancel={() => setForm(null)}
            onSubmit={(languageId, fields) =>
              saveMutation.mutate({
                faqId: form.faq?.id,
                fields: { ...fields, language_id: languageId },
              })
            }
          />
        ) : (
          form && (
            // New FAQs start with Bahasa Indonesia content.
            <FaqFormCard
              title={t.faq.createTitle}
              pending={saveMutation.isPending}
              onCancel={() => setForm(null)}
              onSubmit={(fields) =>
                saveMutation.mutate({
                  fields: { ...fields, language_id: DEFAULT_LANGUAGE_ID },
                })
              }
            />
          )
        )}

        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open && !deleteMutation.isPending) setDeleteTarget(null)
          }}
        >
          <DialogContent
            className="max-w-xl"
            closeLabel={t.faq.closeDeleteDialog}
          >
            <DialogHeader className="border-border border-b">
              <DialogTitle>{t.faq.deleteTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 px-5 py-6">
              <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
                <Trash2Icon aria-hidden="true" className="size-5" />
              </span>
              <p className="text-accent wrap-break-words font-semibold">
                “{deleteTarget?.question}”
              </p>
              <DialogDescription>{t.faq.deleteDescription}</DialogDescription>
            </div>
            <DialogFooter className="bg-primary">
              <Button
                type="button"
                variant="outline"
                disabled={deleteMutation.isPending}
                onClick={() => setDeleteTarget(null)}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!deleteTarget || deleteMutation.isPending}
                onClick={() => {
                  if (deleteTarget) deleteMutation.mutate(deleteTarget)
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <LoaderCircleIcon
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                    {t.faq.deleting}
                  </>
                ) : (
                  t.faq.confirmDelete
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DragDropProvider>
  )
}

function SectionMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
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

export { FaqsPage }
