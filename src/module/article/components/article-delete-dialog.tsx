import type { ArticleListItem } from '@/module/article/api/article.api'
import { deleteArticle } from '@/module/article/api/article.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { articleQueryKeys } from '@/module/article/queries/article.queries'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { toast } from '@/shared/lib/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2Icon } from 'lucide-react'

interface ArticleDeleteDialogProps {
  article: ArticleListItem | null
  onClose: () => void
  onDeleted?: () => Promise<void> | void
}

function ArticleDeleteDialog({
  article,
  onClose,
  onDeleted,
}: ArticleDeleteDialogProps) {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: async (_data, deletedArticleId) => {
      onClose()
      queryClient.removeQueries({
        queryKey: articleQueryKeys.detail(deletedArticleId),
        exact: true,
      })
      await onDeleted?.()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: articleQueryKeys.counts() }),
      ])
      toast.add({
        title: t.common.success,
        description: t.article.articleDeleted,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.article.articleDeleteFailed,
        type: 'error',
      })
    },
  })

  return (
    <Dialog
      open={article !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="max-w-xl"
        closeLabel={t.article.closeDeleteDialog}
      >
        <DialogHeader className="border-border border-b">
          <DialogTitle>{t.article.deleteArticleTitle}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-5 py-6">
          <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
            <Trash2Icon aria-hidden="true" className="size-5" />
          </span>
          {article && (
            <div className="flex flex-col gap-2">
              <p className="text-accent font-semibold break-words">
                “{article.title ?? '-'}”
              </p>
              <DialogDescription>
                {t.article.deleteArticleDescription}
              </DialogDescription>
            </div>
          )}
        </div>

        <DialogFooter className="bg-primary">
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={onClose}
          >
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-danger/30 text-danger hover:bg-danger/5 hover:text-danger"
            disabled={!article || deleteMutation.isPending}
            onClick={() => {
              if (article) deleteMutation.mutate(article.id)
            }}
          >
            {deleteMutation.isPending
              ? t.article.deletingArticle
              : t.article.confirmDeleteArticle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ArticleDeleteDialog }
