import { usePermissions } from '@/module/auth/hooks/use-permissions'
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
import { useI18n } from '@/shared/lib/i18n/i18n-context'
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
import { InfoIcon, LoaderCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'

type DivisionDialogState = { division?: Division }
type ServiceDialogState = { service?: Service; divisionId?: number }
type DeleteTarget =
  { kind: 'division'; record: Division } | { kind: 'service'; record: Service }

function DivisionsPage() {
  const { t } = useI18n()
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
    return <PageMessage message={t.division.languageLoading} />
  }
  if (languagesQuery.isError) {
    return (
      <PageMessage
        message={t.division.languagesFailed}
        onRetry={() => void languagesQuery.refetch()}
      />
    )
  }
  if (!language) {
    return <PageMessage message={t.division.noLanguages} />
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
  const { t } = useI18n()
  const { canWrite } = usePermissions()
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

  function openDivisionDialog(dialog: DivisionDialogState) {
    saveDivisionMutation.reset()
    setDivisionDialog(dialog)
  }

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
        title: t.common.success,
        description:
          variables.divisionId === undefined
            ? t.division.divisionCreated
            : t.division.divisionUpdated,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.division.divisionSaveFailed,
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
        title: t.common.success,
        description:
          variables.serviceId === undefined
            ? t.division.serviceCreated
            : t.division.serviceUpdated,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error ? error.message : t.division.serviceSaveFailed,
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
        title: t.common.success,
        description:
          target.kind === 'division'
            ? t.division.divisionDeleted
            : t.division.serviceDeleted,
        type: 'success',
      })
    },
    onError: (error, target) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : target.kind === 'division'
              ? t.division.divisionDeleteFailed
              : t.division.serviceDeleteFailed,
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
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.division.divisionOrderFailed,
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
        title: t.common.error,
        description:
          error instanceof Error
            ? error.message
            : t.division.serviceOrderFailed,
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
              {t.division.pageTitle}
            </h1>
            <p className="text-muted text-sm lg:text-base">
              {t.division.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {canWrite && (
              <Button
                type="button"
                variant="outline"
                disabled={divisionReorderPending}
                onClick={() => openDivisionDialog({})}
              >
                <PlusIcon aria-hidden="true" className="size-4" />
                {t.division.addDivision}
              </Button>
            )}
            {canWrite && (
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
                {t.division.addService}
              </Button>
            )}
          </div>
        </header>

        <Select value={languageId} onValueChange={onLanguageChange}>
          <SelectTrigger
            aria-label={t.division.language}
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
              {t.division.divisions}
            </CardTitle>
            <span className="text-muted text-xs">
              {divisionsQuery.isSuccess
                ? t.division.divisionCount(divisions.length)
                : t.division.loadingDivisions}
            </span>
          </CardHeader>

          {divisionsQuery.isPending ? (
            <SectionMessage message={t.division.loadingDivisions} />
          ) : divisionsQuery.isError ? (
            <SectionMessage
              message={t.division.divisionsFailed}
              onRetry={() => void divisionsQuery.refetch()}
            />
          ) : divisions.length === 0 ? (
            <SectionMessage message={t.division.noDivisions} />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-max">
                <TableHeader className="bg-primary">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 px-2" />
                    <TableHead className="text-muted font-bold uppercase">
                      {t.division.icon}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.division.divisionName}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.division.abbreviation}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.division.serviceCount}
                    </TableHead>
                    <TableHead className="text-muted font-bold uppercase">
                      {t.division.status}
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">{t.division.actions}</span>
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
                      onEdit={() => openDivisionDialog({ division })}
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
                ? `${t.division.services} — ${findDivisionContent(selectedDivision, languageId)?.name ?? t.division.missingTranslation}`
                : t.division.services}
            </CardTitle>
            {divisions.length > 0 && (
              <Select
                value={selectedDivision ? String(selectedDivision.id) : ''}
                onValueChange={(value) => setSelectedDivisionId(Number(value))}
                disabled={divisionsQuery.isPending || divisionsQuery.isError}
              >
                <SelectTrigger
                  aria-label={t.division.selectDivision}
                  className="w-full lg:max-w-sm"
                >
                  <SelectValue placeholder={t.division.selectDivision} />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={String(division.id)}>
                      {divisionSelectLabel(
                        division,
                        languageId,
                        t.division.missingTranslation,
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>

          {!selectedDivision ? (
            <SectionMessage message={t.division.noSelectedDivision} />
          ) : servicesQuery.isPending ? (
            <SectionMessage message={t.division.loadingServices} />
          ) : servicesQuery.isError ? (
            <SectionMessage
              message={t.division.servicesFailed}
              onRetry={() => void servicesQuery.refetch()}
            />
          ) : selectedServices.length === 0 ? (
            <SectionMessage message={t.division.noServices} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-max">
                  <TableHeader className="bg-primary">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 px-2" />
                      <TableHead className="text-muted font-bold uppercase">
                        {t.division.serviceName}
                      </TableHead>
                      <TableHead className="text-muted font-bold uppercase">
                        {t.division.division}
                      </TableHead>
                      <TableHead className="text-muted font-bold uppercase">
                        {t.division.order}
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">{t.division.actions}</span>
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
                            ?.abbr ?? t.division.missingTranslation
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
              <div className="border-border p-4">
                <div className="bg-secondary/10 text-accent border-secondary/20 flex items-start gap-2 rounded-lg border p-3 text-xs">
                  <InfoIcon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <p>
                    {t.division.serviceInfoBefore}
                    <strong>{t.division.serviceInfoTag}</strong>
                    {t.division.serviceInfoAfter}
                  </p>
                </div>
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
            slugError={getConflictMessage(saveDivisionMutation.error)}
            onOpenChange={(open) => {
              if (!open && !saveDivisionMutation.isPending) {
                saveDivisionMutation.reset()
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
            closeLabel={t.division.closeDeleteDialog}
          >
            <DialogHeader className="border-border border-b">
              <DialogTitle>
                {deleteTarget?.kind === 'division'
                  ? t.division.deleteDivisionTitle
                  : t.division.deleteServiceTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 px-5 py-6">
              <span className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full">
                <Trash2Icon aria-hidden="true" className="size-5" />
              </span>
              {deleteTarget && (
                <>
                  <p className="text-accent font-semibold break-words">
                    “
                    {deleteTargetName(
                      deleteTarget,
                      languageId,
                      t.division.missingTranslation,
                    )}
                    ”
                  </p>
                  <DialogDescription>
                    {deleteTarget.kind === 'division'
                      ? t.division.deleteDivisionDescription
                      : t.division.deleteServiceDescription}
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
                {t.common.cancel}
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
                    {t.division.deleting}
                  </>
                ) : (
                  t.division.confirmDelete
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DragDropProvider>
  )
}

function getConflictMessage(error: unknown): string | undefined {
  return error instanceof Error && 'status' in error && error.status === 409
    ? error.message
    : undefined
}

function SectionMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p role={onRetry ? 'alert' : 'status'} className="text-muted text-sm">
        {message}
      </p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          {t.common.retry}
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

function divisionSelectLabel(
  division: Division,
  languageId: string,
  missingTranslation: string,
) {
  const content = findDivisionContent(division, languageId)

  return content
    ? `${content.abbr} — ${content.name}`
    : `${missingTranslation} (#${division.id})`
}

function deleteTargetName(
  target: DeleteTarget,
  languageId: string,
  missingTranslation: string,
) {
  const content =
    target.kind === 'division'
      ? findDivisionContent(target.record, languageId)
      : findServiceContent(target.record, languageId)

  return content?.name ?? missingTranslation
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
