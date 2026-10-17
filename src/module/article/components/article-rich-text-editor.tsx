import { ARTICLE_LABELS } from '@/module/article/constants/article.constants'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Redo2Icon,
  UnderlineIcon,
  Undo2Icon,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface ArticleRichTextEditorProps {
  content: string
  onChange?: (content: string) => void
  readOnly?: boolean
  id?: string
  ariaLabel?: string
}

function ArticleRichTextEditor({
  content,
  onChange,
  readOnly = false,
  id,
  ariaLabel,
}: ArticleRichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content,
    editable: !readOnly,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getText().trim() ? currentEditor.getHTML() : '')
    },
  })
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive('bold') ?? false,
      italic: currentEditor?.isActive('italic') ?? false,
      underline: currentEditor?.isActive('underline') ?? false,
      heading2: currentEditor?.isActive('heading', { level: 2 }) ?? false,
      heading3: currentEditor?.isActive('heading', { level: 3 }) ?? false,
      bulletList: currentEditor?.isActive('bulletList') ?? false,
      orderedList: currentEditor?.isActive('orderedList') ?? false,
      link: currentEditor?.isActive('link') ?? false,
    }),
  })

  if (!editor) {
    return (
      <div
        aria-busy="true"
        className="bg-background min-h-64 rounded-b-lg p-4"
      />
    )
  }

  return (
    <div className="bg-background overflow-hidden rounded-b-lg">
      {!readOnly && (
        <div
          aria-label={ARTICLE_LABELS.bodyField}
          className="bg-primary border-border/15 flex flex-wrap items-center gap-1 border-b p-2"
        >
          <ToolbarButton
            label="Tebal"
            active={toolbarState?.bold ?? false}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Miring"
            active={toolbarState?.italic ?? false}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Garis bawah"
            active={toolbarState?.underline ?? false}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="Judul tingkat 2"
            active={toolbarState?.heading2 ?? false}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <span className="text-sm font-semibold">H2</span>
          </ToolbarButton>
          <ToolbarButton
            label="Judul tingkat 3"
            active={toolbarState?.heading3 ?? false}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <span className="text-sm font-semibold">H3</span>
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="Daftar berpoin"
            active={toolbarState?.bulletList ?? false}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListIcon aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Daftar bernomor"
            active={toolbarState?.orderedList ?? false}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="Tautan"
            active={toolbarState?.link ?? false}
            onClick={() => {
              const currentHref = editor.getAttributes('link').href as
                string | undefined
              const href = window
                .prompt(ARTICLE_LABELS.editorLinkPrompt, currentHref ?? '')
                ?.trim()

              if (!href) return

              editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href })
                .run()
            }}
          >
            <LinkIcon aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="Urungkan"
            active={false}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2Icon aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Ulangi"
            active={false}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2Icon aria-hidden="true" className="size-4" />
          </ToolbarButton>
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          'text-foreground [&_a]:text-secondary [&_blockquote]:border-accent/40 [&_h2]:text-accent [&_h3]:text-accent min-h-64 p-4 text-sm leading-7 outline-none [&_.tiptap]:min-h-56 [&_.tiptap]:outline-none [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc',
          // Read-only is the preview: landing page article typography.
          readOnly &&
            'text-foreground/70 [&_blockquote]:border-secondary [&_blockquote]:text-accent min-h-0 p-0 text-base leading-8 [&_.tiptap]:min-h-0 [&_blockquote]:my-6 [&_blockquote]:pl-5 [&_blockquote]:text-xl [&_blockquote]:italic [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:leading-tight [&_h2]:font-bold [&_h3]:font-bold [&_p]:mb-6',
        )}
      />
    </div>
  )
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'size-8',
        active &&
          'bg-accent/10 text-accent hover:bg-accent/10 hover:text-accent',
      )}
    >
      {children}
    </Button>
  )
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="bg-border/40 mx-1 h-6 w-px" />
}

export { ArticleRichTextEditor }
