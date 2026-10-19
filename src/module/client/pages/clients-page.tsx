import { usePermissions } from '@/module/auth/hooks/use-permissions'
import {
  createClient,
  deleteClient,
  reorderClients,
  updateClient,
} from '@/module/client/api/client.api'
import type { Client, ClientWriteFields } from '@/module/client/api/client.api'
import { ClientFormDialog } from '@/module/client/components/client-form-dialog'
import { SortableClientCard } from '@/module/client/components/sortable-client-card'
import { CLIENT_LABELS } from '@/module/client/constants/client.constants'
import {
  clientQueryKeys,
  clientsQueryOptions,
} from '@/module/client/queries/client.queries'
import { Button } from '@/shared/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { toast } from '@/shared/lib/toast'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoaderCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

type FormState = { client?: Client }

function ClientsPage() {
  const { canWrite } = usePermissions()
  const queryClient = useQueryClient()
  const clientsQuery = useQuery(clientsQueryOptions())
  const [form, setForm] = useState<FormState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  const clients = clientsQuery.data ?? []

  function showSuccess(description: string) {
    toast.add({ title: 'Berhasil', description, type: 'success' })
  }

  function showError(error: unknown, fallback: string) {
    toast.add({
      title: 'Gagal',
      description: error instanceof Error ? error.message : fallback,
      type: 'error',
    })
  }

  const saveMutation = useMutation({
    mutationFn: ({
      clientId,
      fields,
    }: {
      clientId?: number
      fields: ClientWriteFields
    }) => (clientId ? updateClient(clientId, fields) : createClient(fields)),
    onSuccess: async (_client, variables) => {
      setForm(null)
      await queryClient.invalidateQueries({ queryKey: clientQueryKeys.all })
      showSuccess(
        variables.clientId === undefined
          ? CLIENT_LABELS.created
          : CLIENT_LABELS.updated,
      )
    },
    onError: (error) => showError(error, CLIENT_LABELS.saveFailed),
  })

  const deleteMutation = useMutation({
    mutationFn: (client: Client) => deleteClient(client.id),
    onSuccess: async () => {
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: clientQueryKeys.all })
      showSuccess(CLIENT_LABELS.deleted)
    },
    onError: (error) => showError(error, CLIENT_LABELS.deleteFailed),
  })

  const reorderMutation = useMutation({
    mutationFn: reorderClients,
    onSuccess: (updatedClients) => {
      queryClient.setQueryData(clientQueryKeys.list(), updatedClients)
    },
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: clientQueryKeys.list() })
      showError(error, CLIENT_LABELS.orderFailed)
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return

    const { source, target } = event.operation
    if (!source || !target || !isSortable(source) || !isSortable(target)) return
    if (source.initialIndex === target.index) return

    const reordered = [...clients]
    const [moved] = reordered.splice(source.initialIndex, 1)
    reordered.splice(target.index, 0, moved)

    queryClient.setQueryData(clientQueryKeys.list(), reordered)
    reorderMutation.mutate(reordered.map((client) => client.id))
  }

  const cardsDisabled = reorderMutation.isPending || deleteMutation.isPending

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {CLIENT_LABELS.pageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {CLIENT_LABELS.description}
            </p>
          </div>
          {canWrite && (
            <Button
              type="button"
              className="self-start lg:self-auto"
              onClick={() => setForm({})}
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              {CLIENT_LABELS.addClient}
            </Button>
          )}
        </header>

        <div className="flex flex-col gap-3">
          <Card aria-label={CLIENT_LABELS.pageTitle}>
            <CardHeader>
              <CardTitle>{CLIENT_LABELS.clientCount(clients.length)}</CardTitle>
              <p className="text-secondary text-xs">{CLIENT_LABELS.dragHint}</p>
            </CardHeader>

            {clientsQuery.isPending ? (
              <SectionMessage message={CLIENT_LABELS.loadingClients} />
            ) : clientsQuery.isError ? (
              <SectionMessage
                message={CLIENT_LABELS.clientsFailed}
                onRetry={() => void clientsQuery.refetch()}
              />
            ) : clients.length === 0 ? (
              <SectionMessage message={CLIENT_LABELS.noClients} />
            ) : (
              <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-5">
                {clients.map((client, index) => (
                  <SortableClientCard
                    key={client.id}
                    client={client}
                    index={index}
                    disabled={cardsDisabled}
                    onEdit={() => setForm({ client })}
                    onDelete={() => setDeleteTarget(client)}
                  />
                ))}
              </div>
            )}
          </Card>

          <p className="text-foreground/55 text-xs italic">
            {CLIENT_LABELS.logoHint}
          </p>
        </div>

        {form && (
          <ClientFormDialog
            key={form.client?.id ?? 'new-client'}
            client={form.client}
            pending={saveMutation.isPending}
            onOpenChange={(open) => {
              if (!open && !saveMutation.isPending) setForm(null)
            }}
            onSubmit={(fields) =>
              saveMutation.mutate({ clientId: form.client?.id, fields })
            }
          />
        )}

        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open && !deleteMutation.isPending) setDeleteTarget(null)
          }}
        >
          <DialogContent
            className="max-w-xl"
            closeLabel={CLIENT_LABELS.closeDeleteDialog}
          >
            <DialogHeader className="border-border border-b">
              <DialogTitle>{CLIENT_LABELS.deleteTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 px-5 py-6">
              <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
                <Trash2Icon aria-hidden="true" className="size-5" />
              </span>
              <p className="text-accent font-semibold break-words">
                {deleteTarget?.name}
              </p>
              <DialogDescription>
                {CLIENT_LABELS.deleteDescription}
              </DialogDescription>
            </div>
            <DialogFooter className="bg-primary">
              <Button
                type="button"
                variant="outline"
                disabled={deleteMutation.isPending}
                onClick={() => setDeleteTarget(null)}
              >
                {CLIENT_LABELS.cancel}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!deleteTarget || deleteMutation.isPending}
                onClick={() => {
                  if (deleteTarget) deleteMutation.mutate(deleteTarget)
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <LoaderCircleIcon
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                    {CLIENT_LABELS.deleting}
                  </>
                ) : (
                  CLIENT_LABELS.confirmDelete
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DragDropProvider>
  )
}

function SectionMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p
        role={onRetry ? 'alert' : 'status'}
        className="text-foreground/55 text-sm"
      >
        {message}
      </p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          {CLIENT_LABELS.retry}
        </Button>
      )}
    </div>
  )
}

export { ClientsPage }
