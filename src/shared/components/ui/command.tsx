import { cn } from '@/shared/lib/utils'
import { Command as CommandPrimitive } from 'cmdk'
import { SearchIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

function Command({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn('flex size-full flex-col overflow-hidden', className)}
      {...props}
    />
  )
}

function CommandInput({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="border-border flex items-center gap-2 border-b px-4"
    >
      <SearchIcon aria-hidden="true" className="text-foreground/50 size-4" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'placeholder:text-foreground/50 flex h-12 w-full bg-transparent text-sm outline-none',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn('max-h-96 overflow-y-auto p-2', className)}
      {...props}
    />
  )
}

function CommandEmpty(props: ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="text-foreground/65 py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  heading,
  ...props
}: ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn('p-1', className)}
      heading={
        heading && (
          <span className="text-accent block px-2 py-1.5 text-xs font-semibold">
            {heading}
          </span>
        )
      }
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'data-[selected=true]:bg-primary flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm outline-none',
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
}
