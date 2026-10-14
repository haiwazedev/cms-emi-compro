import { cn } from '@/shared/lib/utils'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

function Tooltip({
  delayDuration = 0,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Root> &
  Pick<ComponentProps<typeof TooltipPrimitive.Provider>, 'delayDuration'>) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipPrimitive.Provider>
  )
}

function TooltipTrigger(
  props: ComponentProps<typeof TooltipPrimitive.Trigger>,
) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-accent z-50 rounded-md px-3 py-1.5 text-xs text-white',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent }
