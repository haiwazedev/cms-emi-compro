import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface DashboardStatCardProps {
  label: string
  value: number
  note: string
  icon: LucideIcon
  iconClassName: string
}

function DashboardStatCard({
  label,
  value,
  note,
  icon: Icon,
  iconClassName,
}: DashboardStatCardProps) {
  return (
    <Card className="flex flex-1 items-start justify-between gap-4 p-5">
      <div className="flex flex-col gap-1">
        <p className="text-foreground/60 text-xs font-semibold tracking-wider uppercase">
          {label}
        </p>
        <p className="text-accent text-3xl font-bold">{value}</p>
        <p className="text-foreground/55 text-sm">{note}</p>
      </div>

      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          iconClassName,
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
    </Card>
  )
}

export { DashboardStatCard }
