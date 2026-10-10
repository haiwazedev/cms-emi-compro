import { logout } from '@/module/auth/api/auth.api'
import {
  authQueryKey,
  authQueryOptions,
} from '@/module/auth/queries/auth.queries'
import { Button } from '@/shared/components/ui/button'
import { toast } from '@/shared/lib/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { LoaderCircleIcon, LogOutIcon } from 'lucide-react'
import { useId } from 'react'
import { DASHBOARD_LABELS } from '../constants/dashboard.constants'

function ProfileAvatar() {
  const { data: user } = useQuery(authQueryOptions())
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userInfoId = useId()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.setQueryData(authQueryKey, null)
      toast.add({ title: DASHBOARD_LABELS.logoutSuccess, type: 'success' })
      await navigate({ to: '/auth/login' })
    },
    onError: (error) => {
      toast.add({
        title:
          error instanceof Error
            ? error.message
            : DASHBOARD_LABELS.logoutFailed,
        type: 'error',
      })
    },
  })

  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        aria-label={DASHBOARD_LABELS.profile}
        aria-describedby={user ? userInfoId : undefined}
        className="bg-secondary focus-visible:ring-accent/50 flex size-10 items-center justify-center rounded-full text-xs font-semibold text-white outline-none focus-visible:ring-2"
      >
        {DASHBOARD_LABELS.profileInitials}
      </button>

      <div className="invisible absolute top-full right-0 z-50 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="border-border/20 bg-background w-64 space-y-3 rounded-md border p-3 shadow-md">
          {user && (
            <div id={userInfoId} className="min-w-0">
              <p className="text-accent truncate text-sm font-semibold">
                {user.name}
              </p>
              <p className="text-foreground/70 truncate text-sm">
                {user.email}
              </p>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            className="text-danger hover:bg-danger/10 hover:text-danger w-full justify-start"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            {logoutMutation.isPending ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <LogOutIcon aria-hidden="true" className="size-4" />
            )}
            {logoutMutation.isPending
              ? DASHBOARD_LABELS.loggingOut
              : DASHBOARD_LABELS.logout}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ProfileAvatar }
