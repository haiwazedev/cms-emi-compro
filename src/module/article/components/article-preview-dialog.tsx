import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { ArticleRichTextEditor } from '@/module/article/components/article-rich-text-editor'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface ArticlePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  photoUrl?: string
  content: string
}

function ArticlePreviewDialog({
  open,
  onOpenChange,
  title,
  photoUrl,
  content,
}: ArticlePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{ARTICLE_LABELS.preview}</DialogTitle>
          <DialogDescription>
            Tampilan artikel berdasarkan perubahan yang belum disimpan.
          </DialogDescription>
        </DialogHeader>
        <article className="flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pb-6">
          <h1 className="text-accent text-2xl font-bold lg:text-3xl">
            {title || 'Judul artikel'}
          </h1>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="max-h-96 w-full rounded-lg object-cover"
            />
          ) : (
            <div className="bg-primary text-foreground/55 flex aspect-video items-center justify-center rounded-lg text-sm">
              Foto utama belum dipilih
            </div>
          )}
          {content ? (
            <ArticleRichTextEditor content={content} readOnly />
          ) : (
            <p className="text-foreground/55 text-sm">
              Isi artikel akan ditampilkan di sini.
            </p>
          )}
        </article>
      </DialogContent>
    </Dialog>
  )
}

export { ArticlePreviewDialog }
