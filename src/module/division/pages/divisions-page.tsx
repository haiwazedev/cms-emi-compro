import {
  createDivision,
  createService,
  deleteDivision,
  deleteService,
  reorderDivisions,
  reorderServices,
  updateDivision,
  updateService,
} from '@/module/division/api/division.api'
import type {
  Division,
  DivisionContent,
  DivisionWriteFields,
  Service,
  ServiceContent,
  ServiceWriteFields,
} from '@/module/division/api/division.api'
import { DivisionFormDialog } from '@/module/division/components/division-form-dialog'
import { ServiceFormDialog } from '@/module/division/components/service-form-dialog'
import { SortableDivisionRow } from '@/module/division/components/sortable-division-row'
import { SortableServiceRow } from '@/module/division/components/sortable-service-row'
import { DIVISION_LABELS } from '@/module/division/constants/division.constants'
import type { Language } from '@/module/language/api/language.api'
import { findDefaultLanguage } from '@/module/language/constants/language.constants'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import {
  divisionQueryKeys,
  divisionsQueryOptions,
  serviceQueryKeys,
  servicesQueryOptions,
} from '@/module/division/queries/division.queries'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { toast } from '@/shared/lib/toast'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { LoaderCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'

type DivisionDialogState = { division?: Division }
type ServiceDialogState = { service?: Service; divisionId?: number }
type DeleteTarget =
  { kind: 'division'; record: Division } | { kind: 'service'; record: Service }

function DivisionsPage() {
  const { lang } = useSearch({ from: '/_authenticated/divisions' })
  const navigate = useNavigate({ from: '/divisions' })
  const languagesQuery = useQuery(languagesQueryOptions())
  const languages = languagesQuery.data ?? []
  const urlLanguage = languages.find((item) => item.id === lang)
  const language = urlLanguage ?? findDefaultLanguage(languages)

  useEffect(() => {
    if (urlLanguage || !language) return

    void navigate({
      search: { lang: language.id },
      replace: true,
    })
  }, [language, navigate, urlLanguage])

  if (languagesQuery.isPending) {
    return <PageMessage message={DIVISION_LABELS.languageLoading} />
  }
  if (languagesQuery.isError) {
    return (
      <PageMessage
        message={DIVISION_LABELS.languagesFailed}
        onRetry={() => void languagesQuery.refetch()}
      />
    )
  }
  if (!language) {
    return <PageMessage message={DIVISION_LABELS.noLanguages} />
  }

  return (
    <DivisionsContent
      languages={languages}
      languageId={language.id}
      onLanguageChange={(id) => {
        const nextLanguage = languages.find((item) => item.id === id)
        if (!nextLanguage) return

        void navigate({ search: { lang: nextLanguage.id } })
      }}
    />
  )
}

function DivisionsContent({
  languages,
  languageId,
  onLanguageChange,
}: {
  languages: Language[]
  languageId: string
  onLanguageChange: (languageId: string) => void
}) {
  const queryClient = useQueryClient()
  const divisionsQuery = useQuery(divisionsQueryOptions())
  const servicesQuery = useQuery(servicesQueryOptions())
  const [selectedDivisionId, setSelectedDivisionId] = useState<number>()
  const [divisionDialog, setDivisionDialog] =
    useState<DivisionDialogState | null>(null)
  const [serviceDialog, setServiceDialog] = useState<ServiceDialogState | null>(
    null,
  )
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

  const divisions = divisionsQuery.data ?? []
  const services = servicesQuery.data ?? []
  const selectedDivision =
    divisions.find((division) => division.id === selectedDivisionId) ??
    divisions[0]
  const selectedServices = selectedDivision
    ? services.filter((service) => service.division_id === selectedDivision.id)
    : []
  const serviceCounts = new Map<number, number>()

  for (const service of services) {
    serviceCounts.set(
      service.division_id,
      (serviceCounts.get(service.division_id) ?? 0) + 1,
    )
  }

  const saveDivisionMutation = useMutation({
    mutationFn: ({
      divisionId,
      fields,
    }: {
      divisionId?: number
      fields: DivisionWriteFields
    }) =>
      divisionId ? updateDivision(divisionId, fields) : createDivision(fields),
    onSuccess: async (division, variables) => {
      setDivisionDialog(null)
      if (variables.divisionId === undefined) {
        setSelectedDivisionId(division.id)
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: divisionQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all }),
      ])
      toast.add({
        title: 'Berhasil',
        description:
          variables.divisionId === undefined
            ? DIVISION_LABELS.divisionCreated
            : DIVISION_LABELS.divisionUpdated,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : DIVISION_LABELS.divisionSaveFailed,
        type: 'error',
      })
    },
  })

  const saveServiceMutation = useMutation({
    mutationFn: ({
      serviceId,
      fields,
    }: {
      serviceId?: number
      fields: ServiceWriteFields
    }) =>
      serviceId ? updateService(serviceId, fields) : createService(fields),
    onSuccess: async (_service, variables) => {
      setServiceDialog(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: divisionQueryKeys.all }),
      ])
      toast.add({
        title: 'Berhasil',
        description:
          variables.serviceId === undefined
            ? DIVISION_LABELS.serviceCreated
            : DIVISION_LABELS.serviceUpdated,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : DIVISION_LABELS.serviceSaveFailed,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (target: DeleteTarget) =>
      target.kind === 'division'
        ? deleteDivision(target.record.id)
        : deleteService(target.record.id),
    onSuccess: async (_data, target) => {
      setDeleteTarget(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: divisionQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all }),
      ])
      toast.add({
        title: 'Berhasil',
        description:
          target.kind === 'division'
            ? DIVISION_LABELS.divisionDeleted
            : DIVISION_LABELS.serviceDeleted,
        type: 'success',
      })
    },
    onError: (error, target) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : target.kind === 'division'
              ? DIVISION_LABELS.divisionDeleteFailed
              : DIVISION_LABELS.serviceDeleteFailed,
        type: 'error',
      })
    },
  })

  const reorderDivisionsMutation = useMutation({
    mutationFn: reorderDivisions,
    onSuccess: (updatedDivisions) => {
      queryClient.setQueryData(divisionQueryKeys.list(), updatedDivisions)
    },
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: divisionQueryKeys.list() })
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : DIVISION_LABELS.divisionOrderFailed,
        type: 'error',
      })
    },
  })

  const reorderServicesMutation = useMutation({
    mutationFn: ({
      divisionId,
      serviceIds,
    }: {
      divisionId: number
      serviceIds: number[]
    }) => reorderServices(divisionId, serviceIds),
    onSuccess: (updatedServices, variables) => {
      queryClient.setQueryData<Service[]>(serviceQueryKeys.list(), (current) =>
        mergeDivisionServices(
          current ?? [],
          variables.divisionId,
          updatedServices,
        ),
      )
    },
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: serviceQueryKeys.list() })
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : DIVISION_LABELS.serviceOrderFailed,
        type: 'error',
      })
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return

    const { source, target } = event.operation
    if (!source || !target || !isSortable(source) || !isSortable(target)) return
    if (source.initialGroup !== target.group) return
    if (source.initialIndex === target.index) return

    if (source.initialGroup === 'divisions') {
      const reordered = moveItems(divisions, source.initialIndex, target.index)
      queryClient.setQueryData(divisionQueryKeys.list(), reordered)
      reorderDivisionsMutation.mutate(reordered.map((division) => division.id))
      return
    }

    if (
      selectedDivision &&
      source.initialGroup === `services-${selectedDivision.id}`
    ) {
      const reordered = moveItems(
        selectedServices,
        source.initialIndex,
        target.index,
      ).map((service, index) => ({ ...service, sort_order: index + 1 }))
      const nextServices = mergeDivisionServices(
        services,
        selectedDivision.id,
        reordered,
      )
      queryClient.setQueryData(serviceQueryKeys.list(), nextServices)
      reorderServicesMutation.mutate({
        divisionId: selectedDivision.id,
        serviceIds: reordered.map((service) => service.id),
      })
    }
  }

  const divisionReorderPending = reorderDivisionsMutation.isPending
  const serviceReorderPending = reorderServicesMutation.isPending

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {DIVISION_LABELS.pageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {DIVISION_LABELS.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <Button
              type="button"
              variant="outline"
              disabled={divisionReorderPending}
              onClick={() => setDivisionDialog({})}
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              {DIVISION_LABELS.addDivision}
            </Button>
            <Button
              type="button"
              disabled={
                !selectedDivision ||
                divisionsQuery.isPending ||
                serviceReorderPending
              }
              onClick={() =>
                setServiceDialog({ divisionId: selectedDivision?.id })
              }
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              {DIVISION_LABELS.addService}
            </Button>
          </div>
        </header>

        <Select value={languageId} onValueChange={onLanguageChange}>
          <SelectTrigger
            aria-label={DIVISION_LABELS.language}
            className="w-full lg:w-64"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                <span aria-hidden="true">{item.flag}</span>
                {item.language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Card aria-labelledby="division-list-title">
          <CardHeader>
            <CardTitle id="division-list-title">
              {DIVISION_LABELS.divisions}
            </CardTitle>
            <span className="text-foreground/55 text-xs">
              {divisionsQuery.isSuccess
                ? DIVISION_LABELS.divisionCount(divisions.length)
                : DIVISION_LABELS.loadingDivisions}
            </span>
          </CardHeader>

          {divisionsQuery.isPending ? (
            <SectionMessage message={DIVISION_LABELS.loadingDivisions} />
          ) : divisionsQuery.isError ? (
            <SectionMessage
              message={DIVISION_LABELS.divisionsFailed}
              onRetry={() => void divisionsQuery.refetch()}
            />
          ) : divisions.length === 0 ? (
            <SectionMessage message={DIVISION_LABELS.noDivisions} />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-max">
                <TableHeader className="bg-primary">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 px-2" />
                    <TableHead>{DIVISION_LABELS.icon}</TableHead>
                    <TableHead>{DIVISION_LABELS.divisionName}</TableHead>
                    <TableHead>{DIVISION_LABELS.abbreviation}</TableHead>
                    <TableHead>{DIVISION_LABELS.serviceCount}</TableHead>
                    <TableHead>{DIVISION_LABELS.status}</TableHead>
                    <TableHead className="text-right">
                      {DIVISION_LABELS.actions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {divisions.map((division, index) => (
                    <SortableDivisionRow
                      key={division.id}
                      division={division}
                      content={findDivisionContent(division, languageId)}
                      index={index}
                      serviceCount={
                        servicesQuery.isSuccess
                          ? (serviceCounts.get(division.id) ?? 0)
                          : undefined
                      }
                      selected={division.id === selectedDivision?.id}
                      disabled={divisionReorderPending}
                      onSelect={() => setSelectedDivisionId(division.id)}
                      onEdit={() => setDivisionDialog({ division })}
                      onDelete={() =>
                        setDeleteTarget({ kind: 'division', record: division })
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <Card aria-labelledby="service-list-title">
          <CardHeader className="flex-col items-start lg:flex-row lg:items-center">
            <CardTitle id="service-list-title">
              {selectedDivision
                ? `${DIVISION_LABELS.services} — ${findDivisionContent(selectedDivision, languageId)?.name ?? DIVISION_LABELS.missingTranslation}`
                : DIVISION_LABELS.services}
            </CardTitle>
            {divisions.length > 0 && (
              <Select
                value={selectedDivision ? String(selectedDivision.id) : ''}
                onValueChange={(value) => setSelectedDivisionId(Number(value))}
                disabled={divisionsQuery.isPending || divisionsQuery.isError}
              >
                <SelectTrigger
                  aria-label={DIVISION_LABELS.selectDivision}
                  className="w-full lg:max-w-sm"
                >
                  <SelectValue placeholder={DIVISION_LABELS.selectDivision} />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={String(division.id)}>
                      {divisionSelectLabel(division, languageId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>

          {!selectedDivision ? (
            <SectionMessage message={DIVISION_LABELS.noSelectedDivision} />
          ) : servicesQuery.isPending ? (
            <SectionMessage message={DIVISION_LABELS.loadingServices} />
          ) : servicesQuery.isError ? (
            <SectionMessage
              message={DIVISION_LABELS.servicesFailed}
              onRetry={() => void servicesQuery.refetch()}
            />
          ) : selectedServices.length === 0 ? (
            <SectionMessage message={DIVISION_LABELS.noServices} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-max">
                  <TableHeader className="bg-primary">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 px-2" />
                      <TableHead>{DIVISION_LABELS.serviceName}</TableHead>
                      <TableHead>{DIVISION_LABELS.division}</TableHead>
                      <TableHead className="text-right">
                        {DIVISION_LABELS.actions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedServices.map((service, index) => (
                      <SortableServiceRow
                        key={service.id}
                        service={service}
                        content={findServiceContent(service, languageId)}
                        index={index}
                        divisionAbbreviation={
                          findDivisionContent(selectedDivision, languageId)
                            ?.abbr ?? DIVISION_LABELS.missingTranslation
                        }
                        disabled={serviceReorderPending}
                        onEdit={() =>
                          setServiceDialog({
                            service,
                            divisionId: selectedDivision.id,
                          })
                        }
                        onDelete={() =>
                          setDeleteTarget({ kind: 'service', record: service })
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="border-border/15 p-4">
                <p className="bg-primary text-foreground/65 rounded-lg px-4 py-3 text-sm">
                  {DIVISION_LABELS.serviceInfo}
                </p>
              </div>
            </>
          )}
        </Card>

        {divisionDialog && (
          <DivisionFormDialog
            key={`${divisionDialog.division?.id ?? 'new-division'}-${languageId}`}
            open
            division={divisionDialog.division}
            languageId={languageId}
            pending={saveDivisionMutation.isPending}
            onOpenChange={(open) => {
              if (!open && !saveDivisionMutation.isPending) {
                setDivisionDialog(null)
              }
            }}
            onSubmit={(fields) =>
              saveDivisionMutation.mutate({
                divisionId: divisionDialog.division?.id,
                fields,
              })
            }
          />
        )}

        {serviceDialog && (
          <ServiceFormDialog
            key={`${serviceDialog.service?.id ?? 'new-service'}-${languageId}`}
            open
            divisions={divisions}
            selectedDivisionId={serviceDialog.divisionId}
            service={serviceDialog.service}
            languageId={languageId}
            pending={saveServiceMutation.isPending}
            onOpenChange={(open) => {
              if (!open && !saveServiceMutation.isPending) {
                setServiceDialog(null)
              }
            }}
            onSubmit={(fields) =>
              saveServiceMutation.mutate({
                serviceId: serviceDialog.service?.id,
                fields,
              })
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
            closeLabel={DIVISION_LABELS.closeDeleteDialog}
          >
            <DialogHeader className="border-border/15 border-b">
              <DialogTitle>
                {deleteTarget?.kind === 'division'
                  ? DIVISION_LABELS.deleteDivisionTitle
                  : DIVISION_LABELS.deleteServiceTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 px-5 py-6">
              <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
                <Trash2Icon aria-hidden="true" className="size-5" />
              </span>
              {deleteTarget && (
                <>
                  <p className="text-accent font-semibold break-words">
                    “{deleteTargetName(deleteTarget, languageId)}”
                  </p>
                  <DialogDescription>
                    {deleteTarget.kind === 'division'
                      ? DIVISION_LABELS.deleteDivisionDescription
                      : DIVISION_LABELS.deleteServiceDescription}
                  </DialogDescription>
                </>
              )}
            </div>
            <DialogFooter className="bg-primary">
              <Button
                type="button"
                variant="outline"
                disabled={deleteMutation.isPending}
                onClick={() => setDeleteTarget(null)}
              >
                {DIVISION_LABELS.cancel}
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
                    {DIVISION_LABELS.deleting}
                  </>
                ) : (
                  DIVISION_LABELS.confirmDelete
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
          {DIVISION_LABELS.retry}
        </Button>
      )}
    </div>
  )
}

function PageMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="bg-primary flex min-h-full flex-col justify-center p-4 lg:p-8">
      <SectionMessage message={message} onRetry={onRetry} />
    </div>
  )
}

function findDivisionContent(
  division: Division,
  languageId: string,
): DivisionContent | undefined {
  return division.contents.find((item) => item.language_id === languageId)
}

function findServiceContent(
  service: Service,
  languageId: string,
): ServiceContent | undefined {
  return service.contents.find((item) => item.language_id === languageId)
}

function divisionSelectLabel(division: Division, languageId: string) {
  const content = findDivisionContent(division, languageId)

  return content
    ? `${content.abbr} — ${content.name}`
    : `${DIVISION_LABELS.missingTranslation} (#${division.id})`
}

function deleteTargetName(target: DeleteTarget, languageId: string) {
  const content =
    target.kind === 'division'
      ? findDivisionContent(target.record, languageId)
      : findServiceContent(target.record, languageId)

  return content?.name ?? DIVISION_LABELS.missingTranslation
}

function moveItems<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items
  }

  const reordered = [...items]
  const [movedItem] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, movedItem)
  return reordered
}

function mergeDivisionServices(
  currentServices: Service[],
  divisionId: number,
  divisionServices: Service[],
) {
  let index = 0
  let replaced = false

  const merged = currentServices.map((service) => {
    if (service.division_id !== divisionId) return service
    replaced = true
    const updatedService = divisionServices[index]
    index += 1
    return updatedService ?? service
  })

  return replaced ? merged : [...merged, ...divisionServices]
}

export { DivisionsPage }
