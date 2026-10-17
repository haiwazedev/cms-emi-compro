import { saveSiteSettings } from '@/module/site_settings/api/site-settings.api'
import { ImageFileField } from '@/module/site_settings/components/image-file-field'
import { SiteSettingsTextField } from '@/module/site_settings/components/site-settings-text-field'
import { SortableSocialLinkRow } from '@/module/site_settings/components/sortable-social-link-row'
import {
  SITE_SETTINGS_LABELS,
  SITE_SETTINGS_LOGO_MAX_SIZE,
  SITE_SETTINGS_LOGO_TYPES,
} from '@/module/site_settings/constants/site-settings.constants'
import {
  siteSettingsQueryKeys,
  siteSettingsQueryOptions,
} from '@/module/site_settings/queries/site-settings.queries'
import {
  siteSettingsFormSchema,
  type SiteSettingsFormValues,
} from '@/module/site_settings/schemas/site-settings.schema'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/lib/toast'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckIcon } from 'lucide-react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form'

const emptySocialLink = {
  platform: '',
  url: '',
  visible: true,
  icon: { url: null, file: null },
}

function SiteSettingsPage() {
  const settingsQuery = useQuery(siteSettingsQueryOptions())

  if (settingsQuery.isPending) {
    return <PageMessage message={SITE_SETTINGS_LABELS.loading} />
  }
  if (settingsQuery.isError) {
    return (
      <PageMessage
        message={`${SITE_SETTINGS_LABELS.loadFailed}: ${settingsQuery.error.message}`}
        onRetry={() => void settingsQuery.refetch()}
      />
    )
  }

  return <SiteSettingsForm initialValues={settingsQuery.data} />
}

function SiteSettingsForm({
  initialValues,
}: {
  initialValues: SiteSettingsFormValues
}) {
  const queryClient = useQueryClient()
  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: initialValues,
  })
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  const addressValue = useWatch({ control, name: 'address' })
  const socialLinks = useFieldArray({
    control,
    name: 'socialLinks',
    // Rows keep their server `id`, so the generated row key needs another name.
    keyName: 'key',
  })

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return

    const { source, target } = event.operation
    if (!source || !target || !isSortable(source) || !isSortable(target)) return
    socialLinks.move(source.initialIndex, target.index)
  }

  const saveMutation = useMutation({
    mutationFn: saveSiteSettings,
    onSuccess: (savedValues) => {
      queryClient.setQueryData(siteSettingsQueryKeys.all, savedValues)
      // Saved rows now carry server ids and stored image URLs.
      reset(savedValues)
      toast.add({
        title: 'Berhasil',
        description: SITE_SETTINGS_LABELS.saveSuccess,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Gagal',
        description:
          error instanceof Error
            ? error.message
            : SITE_SETTINGS_LABELS.saveFailed,
        type: 'error',
      })
    },
  })

  const hoursError = errors.closeTime?.message

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
        className="bg-primary flex min-h-full flex-col gap-4 p-4 lg:gap-6 lg:p-8"
      >
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-accent text-2xl font-bold lg:text-3xl">
              {SITE_SETTINGS_LABELS.pageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {SITE_SETTINGS_LABELS.description}
            </p>
          </div>
          <Button
            type="submit"
            disabled={!isDirty || saveMutation.isPending}
            className="self-start"
          >
            <CheckIcon aria-hidden="true" className="size-4" />
            {SITE_SETTINGS_LABELS.save}
          </Button>
        </header>

        <Card aria-labelledby="site-settings-identity-title">
          <CardHeader>
            <CardTitle id="site-settings-identity-title" className="text-base">
              {SITE_SETTINGS_LABELS.identity}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 space-y-0">
            <div className="flex flex-col gap-4 lg:flex-row">
              <SiteSettingsTextField
                name="companyName"
                label={SITE_SETTINGS_LABELS.companyName}
                maxLength={200}
                required
              />
              <SiteSettingsTextField
                name="shortName"
                label={SITE_SETTINGS_LABELS.shortName}
                maxLength={50}
              />
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
              <LogoField
                name="danantaraLogo"
                label={SITE_SETTINGS_LABELS.danantaraLogo}
              />
              <LogoField name="plnLogo" label={SITE_SETTINGS_LABELS.plnLogo} />
            </div>
          </CardContent>
        </Card>

        <Card aria-labelledby="site-settings-contact-title">
          <CardHeader>
            <CardTitle id="site-settings-contact-title" className="text-base">
              {SITE_SETTINGS_LABELS.contact}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 space-y-0">
            <div className="flex flex-col gap-2">
              <Label htmlFor="site-settings-address">
                {SITE_SETTINGS_LABELS.address}
                <span className="text-danger">*</span>
              </Label>
              <Textarea
                id="site-settings-address"
                maxLength={500}
                aria-invalid={Boolean(errors.address)}
                {...register('address')}
              />
              <p className="text-foreground/55 text-xs">
                {addressValue.length + ' / 500 karakter'}
              </p>
              {errors.address?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
              <SiteSettingsTextField
                name="phone"
                label={SITE_SETTINGS_LABELS.phone}
                type="tel"
                maxLength={30}
              />
              <SiteSettingsTextField
                name="whatsapp"
                label={SITE_SETTINGS_LABELS.whatsapp}
                type="tel"
                maxLength={30}
              />
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
              <SiteSettingsTextField
                name="mainEmail"
                label={SITE_SETTINGS_LABELS.mainEmail}
                type="email"
                maxLength={254}
              />
              <SiteSettingsTextField
                name="marketingEmail"
                label={SITE_SETTINGS_LABELS.marketingEmail}
                type="email"
                maxLength={254}
              />
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
              <SiteSettingsTextField
                name="operatingDays"
                label={SITE_SETTINGS_LABELS.operatingDays}
                maxLength={100}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Label htmlFor="site-settings-openTime">
                  {SITE_SETTINGS_LABELS.operatingHours}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="site-settings-openTime"
                    type="time"
                    aria-label={SITE_SETTINGS_LABELS.openTime}
                    {...register('openTime')}
                  />
                  <span className="text-foreground/55">-</span>
                  <Input
                    type="time"
                    aria-label={SITE_SETTINGS_LABELS.closeTime}
                    aria-invalid={Boolean(hoursError)}
                    {...register('closeTime')}
                  />
                </div>
                {hoursError && (
                  <p role="alert" className="text-danger text-sm">
                    {hoursError}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card aria-labelledby="site-settings-social-title">
          <CardHeader>
            <CardTitle id="site-settings-social-title" className="text-base">
              {SITE_SETTINGS_LABELS.socialMedia}
            </CardTitle>
            <span className="text-foreground/55 text-xs">
              {SITE_SETTINGS_LABELS.socialCount(socialLinks.fields.length)}
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            {socialLinks.fields.length === 0 ? (
              <p
                role="status"
                className="text-foreground/55 py-6 text-center text-sm"
              >
                {SITE_SETTINGS_LABELS.emptySocial}
              </p>
            ) : (
              <DragDropProvider onDragEnd={handleDragEnd}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary hover:bg-primary">
                      <TableHead className="w-12 px-2" />
                      <TableHead>{SITE_SETTINGS_LABELS.icon}</TableHead>
                      <TableHead>{SITE_SETTINGS_LABELS.platform}</TableHead>
                      <TableHead>{SITE_SETTINGS_LABELS.url}</TableHead>
                      <TableHead>{SITE_SETTINGS_LABELS.visible}</TableHead>
                      <TableHead className="text-right">
                        {SITE_SETTINGS_LABELS.action}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socialLinks.fields.map((field, index) => (
                      <SortableSocialLinkRow
                        key={field.key}
                        id={field.key}
                        index={index}
                        onDelete={socialLinks.remove}
                      />
                    ))}
                  </TableBody>
                </Table>
              </DragDropProvider>
            )}
            <Button
              type="button"
              variant="outline"
              className="bg-primary text-secondary hover:bg-primary/80 w-full border-dashed"
              onClick={() => socialLinks.append(emptySocialLink)}
            >
              {SITE_SETTINGS_LABELS.addSocial}
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  )
}

function LogoField({
  name,
  label,
}: {
  name: 'danantaraLogo' | 'plnLogo'
  label: string
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Label htmlFor={`site-settings-${name}`}>{label}</Label>
      <Controller<SiteSettingsFormValues, typeof name>
        name={name}
        render={({ field }) => (
          <ImageFileField
            id={`site-settings-${name}`}
            label={label}
            value={field.value}
            onChange={field.onChange}
            extensions={SITE_SETTINGS_LOGO_TYPES}
            maxSize={SITE_SETTINGS_LOGO_MAX_SIZE}
            previewClassName="h-14 w-40 p-2"
          />
        )}
      />
      <p className="text-foreground/55 text-xs">
        {SITE_SETTINGS_LABELS.logoHelp}
      </p>
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
    <div className="bg-primary flex min-h-full flex-col items-center justify-center gap-3 p-4 text-center">
      <p
        role={onRetry ? 'alert' : 'status'}
        className="text-foreground/55 text-sm"
      >
        {message}
      </p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          {SITE_SETTINGS_LABELS.retry}
        </Button>
      )}
    </div>
  )
}

export { SiteSettingsPage }
