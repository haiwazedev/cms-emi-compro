import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface DashboardStatCardProps {
  label: string
  value: ReactNode
  note: ReactNode
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
        <p className="text-muted text-xs font-semibold tracking-wider uppercase">
          {label}
        </p>
        <div className="text-accent text-3xl font-bold">{value}</div>
        <div className="text-muted text-sm">{note}</div>
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
