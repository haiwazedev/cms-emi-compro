import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { Button } from '@/shared/components/ui/button'

function ListMessage({ message, role }: { message: string; role?: 'status' }) {
  return (
    <p role={role} className="text-muted px-4 py-12 text-center text-sm">
      {message}
    </p>
  )
}

function ListError({
  error,
  fallback,
  onRetry,
}: {
  error: unknown
  fallback: string
  onRetry: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <p role="alert" className="text-danger text-sm">
        {error instanceof Error ? error.message : fallback}
      </p>
      <Button type="button" variant="outline" onClick={onRetry}>
        {t.common.retry}
      </Button>
    </div>
  )
}

export { ListError, ListMessage }
