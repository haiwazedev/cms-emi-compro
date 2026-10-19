import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { ArticleRichTextEditor } from '@/module/article/components/article-rich-text-editor'
import { Badge } from '@/shared/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { CalendarDaysIcon, Clock3Icon, PenLineIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface ArticlePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  photoUrl?: string
  content: string
  categoryName?: string
  issueDate?: string
  author?: string
}

// Mirrors the landing page article detail (emi-compro `article-detail.tsx`).
function ArticlePreviewDialog({
  open,
  onOpenChange,
  title,
  photoUrl,
  content,
  categoryName,
  issueDate,
  author,
}: ArticlePreviewDialogProps) {
  const formattedDate = formatPreviewDate(issueDate)
  // Parse only while open; the form re-renders on every keystroke.
  const readTime = open ? calculateReadTime(content) : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{ARTICLE_LABELS.preview}</DialogTitle>
          <DialogDescription>
            Tampilan artikel berdasarkan perubahan yang belum disimpan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-col gap-8 overflow-y-auto px-5 pb-8">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="aspect-[4/5] w-full rounded-2xl object-cover lg:aspect-[5/2]"
            />
          ) : (
            <div className="bg-primary text-foreground/55 flex aspect-[4/5] w-full items-center justify-center rounded-2xl text-sm lg:aspect-[5/2]">
              Foto utama belum dipilih
            </div>
          )}
          <article className="mx-auto flex w-full max-w-3xl flex-col">
            {categoryName && (
              <Badge className="bg-primary text-accent px-3 py-1 font-semibold">
                {categoryName}
              </Badge>
            )}
            <h1 className="text-accent mt-4 text-3xl leading-tight font-bold tracking-tight lg:text-5xl">
              {title || 'Judul artikel'}
            </h1>
            <div className="text-foreground/60 border-border mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-5 text-xs">
              {formattedDate && (
                <PreviewMeta icon={CalendarDaysIcon}>
                  {formattedDate}
                </PreviewMeta>
              )}
              {author && <PreviewMeta icon={PenLineIcon}>{author}</PreviewMeta>}
              {readTime !== undefined && (
                // shortcut: English label for every language, translate when the landing page does.
                <PreviewMeta icon={Clock3Icon}>{readTime} min read</PreviewMeta>
              )}
            </div>
            <div className="mt-7">
              {content ? (
                <ArticleRichTextEditor content={content} readOnly />
              ) : (
                <p className="text-foreground/55 text-sm">
                  Isi artikel akan ditampilkan di sini.
                </p>
              )}
            </div>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PreviewMeta({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDaysIcon
  children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon aria-hidden="true" className="size-3.5" />
      {children}
    </span>
  )
}

// shortcut: mirrors backend calculateReadTime (article.service.ts), keep the rate in sync.
const READ_CHARACTERS_PER_MINUTE = 1000

function calculateReadTime(html: string) {
  const text =
    new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
  const length = text.replace(/\s+/g, ' ').trim().length

  return Math.max(1, Math.ceil(length / READ_CHARACTERS_PER_MINUTE))
}

// "2026-07-12" → "12 Jul 2026", as on the landing page.
function formatPreviewDate(value?: string) {
  if (!value) return undefined

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return undefined

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export { ArticlePreviewDialog }
