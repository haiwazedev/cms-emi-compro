import { verifyActivationToken } from '@/module/auth/api/auth.api'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/api-client'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearch } from '@tanstack/react-router'
import { LoaderCircleIcon } from 'lucide-react'
import { ActivateForm } from '../components/activate-form'
import { AuthLayout, BackToLoginLink } from '../components/auth-layout'

function ActivatePage() {
  const { t } = useI18n()
  const { token = '' } = useSearch({ from: '/auth/activate' })
  const verifyQuery = useQuery({
    queryKey: ['auth', 'activation-token', token],
    queryFn: () => verifyActivationToken(token),
    enabled: Boolean(token),
    retry: false,
    // Checked once on load; submitting checks the token again.
    staleTime: Infinity,
  })
  const isInvalidLink =
    !token ||
    (verifyQuery.error instanceof ApiError && verifyQuery.error.status === 400)

  if (isInvalidLink) {
    return (
      <AuthLayout
        title={t.auth.invalidLinkTitle}
        description={t.auth.invalidLinkDescription}
      >
        <div className="space-y-6">
          <Button
            asChild
            size="lg"
            className="h-14 w-full rounded-xl text-base"
          >
            <Link to="/auth/forgot-password">{t.auth.requestNewLink}</Link>
          </Button>
          <BackToLoginLink />
        </div>
      </AuthLayout>
    )
  }

  if (verifyQuery.isSuccess) {
    const isInvite = verifyQuery.data === 'INVITE'

    return (
      <AuthLayout
        title={
          isInvite ? t.auth.activateInviteTitle : t.auth.activateResetTitle
        }
        description={
          isInvite
            ? t.auth.activateInviteDescription
            : t.auth.activateResetDescription
        }
      >
        <ActivateForm token={token} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t.auth.activateTitle} description={t.auth.verifyingLink}>
      {verifyQuery.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-danger text-sm">
            {verifyQuery.error.message}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void verifyQuery.refetch()}
          >
            {t.common.retry}
          </Button>
        </div>
      ) : (
        <LoaderCircleIcon
          role="status"
          aria-label={t.common.loading}
          className="text-muted size-6 animate-spin"
        />
      )}
    </AuthLayout>
  )
}

export { ActivatePage }
