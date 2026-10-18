import { logout } from '@/module/auth/api/auth.api'
import {
  authQueryKey,
  authQueryOptions,
} from '@/module/auth/queries/auth.queries'
import { Button } from '@/shared/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { toast } from '@/shared/lib/toast'
import { getInitials } from '@/shared/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { LoaderCircleIcon, LogOutIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NAVIGATION_TOPBAR_LABELS } from '../constants/navigation.constants'

function ProfileAvatar() {
  const { data: user } = useQuery(authQueryOptions())
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const isHoverOpenRef = useRef(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.setQueryData(authQueryKey, null)
      toast.add({
        title: 'Success',
        description: NAVIGATION_TOPBAR_LABELS.logoutSuccess,
        type: 'success',
      })
      await navigate({ to: '/auth/login' })
    },
    onError: (error) => {
      toast.add({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : NAVIGATION_TOPBAR_LABELS.logoutFailed,
        type: 'error',
      })
    },
  })

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    },
    [],
  )

  function cancelClose() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  function openOnMouseEnter(pointerType: string) {
    if (pointerType === 'mouse') {
      cancelClose()
      isHoverOpenRef.current = true
      setIsOpen(true)
    }
  }

  function closeOnMouseLeave(pointerType: string) {
    if (pointerType === 'mouse') {
      cancelClose()
      closeTimeoutRef.current = setTimeout(() => {
        isHoverOpenRef.current = false
        setIsOpen(false)
        closeTimeoutRef.current = null
      }, 150)
    }
  }

  function handleOpenChange(open: boolean) {
    cancelClose()
    if (!open) {
      isHoverOpenRef.current = false
    }
    setIsOpen(open)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={NAVIGATION_TOPBAR_LABELS.profile}
          className="bg-secondary focus-visible:ring-accent/50 flex size-10 items-center justify-center rounded-full text-xs font-semibold text-white outline-none focus-visible:ring-2"
          onPointerEnter={(event) => openOnMouseEnter(event.pointerType)}
          onPointerLeave={(event) => closeOnMouseLeave(event.pointerType)}
        >
          {user ? getInitials(user.name) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-64 space-y-3 p-3"
        onOpenAutoFocus={(event) => {
          if (isHoverOpenRef.current) {
            event.preventDefault()
          }
        }}
        onPointerEnter={(event) => openOnMouseEnter(event.pointerType)}
        onPointerLeave={(event) => closeOnMouseLeave(event.pointerType)}
      >
        {user && (
          <div className="min-w-0">
            <p className="text-accent truncate text-sm font-semibold">
              {user.name}
            </p>
            <p className="text-foreground/70 truncate text-sm">{user.email}</p>
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
            ? NAVIGATION_TOPBAR_LABELS.loggingOut
            : NAVIGATION_TOPBAR_LABELS.logout}
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export { ProfileAvatar }
