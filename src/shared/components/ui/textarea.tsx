import { cn } from '@/shared/lib/utils'
import type { ComponentProps } from 'react'

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-border/20 bg-background text-foreground focus-visible:border-accent focus-visible:ring-accent/30 flex min-h-28 w-full min-w-0 rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
