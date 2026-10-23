import { Button } from '@/shared/components/ui/button'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { ArrowRightIcon, LoaderCircleIcon } from 'lucide-react'

interface AuthSubmitButtonProps {
  label: string
  pending: boolean
}

function AuthSubmitButton({ label, pending }: AuthSubmitButtonProps) {
  const { t } = useI18n()

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="h-14 w-full rounded-xl text-base"
    >
      {pending ? (
        <>
          {t.auth.submitting}
          <LoaderCircleIcon
            aria-hidden="true"
            className="size-4 animate-spin"
          />
        </>
      ) : (
        <>
          {label}
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </>
      )}
    </Button>
  )
}

export { AuthSubmitButton }
