import { cn } from '@/shared/lib/utils'
import type { ComponentProps } from 'react'

function Checkbox({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      data-slot="checkbox"
      type="checkbox"
      className={cn(
        'accent-accent focus-visible:ring-accent/50 border-border size-4 shrink-0 cursor-pointer rounded border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    />
  )
}

export { Checkbox }
