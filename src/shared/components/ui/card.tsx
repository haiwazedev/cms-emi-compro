import { cn } from '@/shared/lib/utils'
import type { ComponentProps } from 'react'

function Card({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      data-slot="card"
      className={cn(
        'bg-background border-border overflow-hidden rounded-xl border shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'border-border flex items-center justify-between gap-4 border-b px-5 py-4',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="card-title"
      className={cn('text-accent font-semibold', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('space-y-5 p-5', className)}
      {...props}
    />
  )
}

export { Card, CardContent, CardHeader, CardTitle }
