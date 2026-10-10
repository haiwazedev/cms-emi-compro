import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { Toast } from '@base-ui/react/toast'
import { CircleCheckIcon, CircleXIcon, XIcon } from 'lucide-react'

function ToastList() {
  const { toasts } = Toast.useToastManager()

  return toasts.map((toastItem) => {
    const isSuccess = toastItem.type === 'success'
    const isError = toastItem.type === 'error'
    const titleColor = isSuccess
      ? 'text-success'
      : isError
        ? 'text-danger'
        : 'text-accent'

    return (
      <Toast.Root key={toastItem.id} toast={toastItem}>
        <Toast.Content
          className={cn(
            'bg-background text-foreground focus-visible:ring-accent/50 pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200 ease-out outline-none focus-visible:ring-2 data-[ending-style]:-translate-y-2 data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-2 data-[starting-style]:opacity-0',
            isSuccess && 'border-success/40',
            isError && 'border-danger/40',
            !isSuccess && !isError && 'border-border/20',
          )}
        >
          {isSuccess && (
            <CircleCheckIcon
              aria-hidden="true"
              className="text-success size-8 shrink-0"
            />
          )}
          {isError && (
            <CircleXIcon
              aria-hidden="true"
              className="text-danger size-8 shrink-0"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Toast.Title className={cn('text-base font-bold', titleColor)} />
            {toastItem.description && (
              <Toast.Description className="text-foreground/70 text-sm" />
            )}
          </div>
          <Toast.Close
            aria-label="Tutup notifikasi"
            className="text-foreground/60 hover:text-foreground focus-visible:outline-none"
          >
            <XIcon aria-hidden="true" className="size-4" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    )
  })
}

function Toaster() {
  return (
    <Toast.Provider toastManager={toast}>
      <Toast.Portal>
        <Toast.Viewport className="pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto flex w-auto max-w-sm flex-col gap-3 outline-none lg:right-4 lg:left-auto lg:mx-0 lg:w-full">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}

export { Toaster }
