import { cn } from '@/shared/lib/utils'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { id } from 'react-day-picker/locale'
import type { ComponentProps } from 'react'

function Calendar({
  className,
  classNames,
  components,
  locale,
  ...props
}: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      {...props}
      locale={locale ?? id}
      className={cn('p-3', className)}
      classNames={{
        root: 'relative w-fit',
        months: 'flex flex-col gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex h-8 items-center justify-center px-8',
        caption_label: 'text-sm font-medium capitalize',
        nav: 'absolute inset-x-3 top-3 z-10 flex items-center justify-between',
        button_previous:
          'text-accent hover:bg-primary inline-flex size-8 items-center justify-center rounded-md disabled:pointer-events-none disabled:opacity-50',
        button_next:
          'text-accent hover:bg-primary inline-flex size-8 items-center justify-center rounded-md disabled:pointer-events-none disabled:opacity-50',
        chevron: 'size-4',
        month_grid: 'w-full border-collapse',
        weekdays: 'grid grid-cols-7',
        weekday:
          'text-foreground/55 flex size-8 items-center justify-center text-xs font-normal',
        weeks: 'flex flex-col gap-1',
        week: 'grid grid-cols-7 gap-1',
        day: 'flex size-8 items-center justify-center',
        day_button:
          'inline-flex size-8 items-center justify-center rounded-md text-sm font-normal outline-none transition-colors hover:bg-primary focus-visible:ring-2 focus-visible:ring-accent/40',
        selected: 'bg-accent text-white hover:bg-accent/90 focus:bg-accent',
        today: 'border border-accent text-accent',
        outside: 'text-foreground/35',
        disabled: 'pointer-events-none text-foreground/35',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        ...components,
        Chevron: ({ orientation, className: iconClassName }) => {
          const Icon =
            orientation === 'left'
              ? ChevronLeftIcon
              : orientation === 'right'
                ? ChevronRightIcon
                : orientation === 'up'
                  ? ChevronUpIcon
                  : ChevronDownIcon

          return (
            <Icon aria-hidden="true" className={cn('size-4', iconClassName)} />
          )
        },
      }}
    />
  )
}

export { Calendar }
