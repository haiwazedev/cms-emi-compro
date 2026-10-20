import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type { Language } from '@/module/language/api/language.api'
import { findDefaultLanguage } from '@/module/language/constants/language.constants'
import { languagesQueryOptions } from '@/module/language/queries/language.queries'
import {
  saveSiteSettings,
  type SiteSettingsData,
  type SiteSettingsField,
} from '@/module/site_settings/api/site-settings.api'
import { ImageFileField } from '@/module/site_settings/components/image-file-field'
import { SiteSettingsTextField } from '@/module/site_settings/components/site-settings-text-field'
import { SortableSocialLinkRow } from '@/module/site_settings/components/sortable-social-link-row'
import {
  SITE_SETTINGS_LOGO_MAX_SIZE,
  SITE_SETTINGS_LOGO_TYPES,
} from '@/module/site_settings/constants/site-settings.constants'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import {
  siteSettingsQueryKeys,
  siteSettingsQueryOptions,
} from '@/module/site_settings/queries/site-settings.queries'
import {
  createSiteSettingsFormSchema,
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
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/lib/toast'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useBlocker, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckIcon } from 'lucide-react'
import { useEffect } from 'react'
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
  const { t } = useI18n()
  const { lang } = useSearch({ from: '/_authenticated/site_settings' })
  const navigate = useNavigate({ from: '/site_settings' })
  const languagesQuery = useQuery(languagesQueryOptions())
  const languages = languagesQuery.data ?? []
  const urlLanguage = languages.find((item) => item.id === lang)
  const language = urlLanguage ?? findDefaultLanguage(languages)
  const settingsQuery = useQuery({
    ...siteSettingsQueryOptions(language?.id ?? ''),
    enabled: Boolean(language),
  })

  useEffect(() => {
    if (urlLanguage || !language) return

    void navigate({
      search: { lang: language.id },
      replace: true,
    })
  }, [language, navigate, urlLanguage])

  if (languagesQuery.isPending) {
    return <PageMessage message={t.siteSettings.loading} />
  }
  if (languagesQuery.isError) {
    return (
      <PageMessage
        message={t.siteSettings.languagesFailed}
        onRetry={() => void languagesQuery.refetch()}
      />
    )
  }
  if (!language) {
    return <PageMessage message={t.siteSettings.noLanguages} />
  }
  if (settingsQuery.isPending) {
    return <PageMessage message={t.siteSettings.loading} />
  }
  if (settingsQuery.isError) {
    return (
      <PageMessage
        message={`${t.siteSettings.loadFailed}: ${settingsQuery.error.message}`}
        onRetry={() => void settingsQuery.refetch()}
      />
    )
  }

  return (
    <SiteSettingsForm
      // Remount per language: switching discards every unsaved edit.
      key={language.id}
      data={settingsQuery.data}
      languages={languages}
      languageId={language.id}
      onLanguageChange={(id) => {
        const nextLanguage = languages.find((item) => item.id === id)
        if (!nextLanguage) return

        // The form already confirmed discarding changes.
        void navigate({
          search: { lang: nextLanguage.id },
          ignoreBlocker: true,
        })
      }}
    />
  )
}

function SiteSettingsForm({
  data,
  languages,
  languageId,
  onLanguageChange,
}: {
  data: SiteSettingsData
  languages: Language[]
  languageId: string
  onLanguageChange: (languageId: string) => void
}) {
  const { t } = useI18n()
  const { canWrite } = usePermissions()
  const queryClient = useQueryClient()
  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(createSiteSettingsFormSchema(t)),
    defaultValues: data.values,
  })
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form
  const addressValue = useWatch({ control, name: 'address' })
  const isMissing = (field: SiteSettingsField) =>
    data.unconfigured.includes(field)
  // Required inputs without a row for this language block saving.
  const isRequiredMissing = isMissing('companyName') || isMissing('address')

  // Native prompts: confirm for in-app navigation, beforeunload for refresh/close.
  useBlocker({
    shouldBlockFn: () =>
      isDirty && !window.confirm(t.siteSettings.discardChangesConfirm),
    enableBeforeUnload: () => isDirty,
  })

  function requestLanguage(id: string) {
    if (id === languageId) return
    if (isDirty && !window.confirm(t.siteSettings.discardChangesConfirm)) {
      return
    }

    onLanguageChange(id)
  }
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
    mutationFn: (values: SiteSettingsFormValues) =>
      saveSiteSettings({
        values,
        unconfigured: data.unconfigured,
        languageId,
      }),
    onSuccess: (saved) => {
      // Social media is shared, so other languages' cached data is stale.
      void queryClient.invalidateQueries({
        queryKey: siteSettingsQueryKeys.all,
        refetchType: 'none',
      })
      queryClient.setQueryData(siteSettingsQueryKeys.detail(languageId), saved)
      // Saved rows now carry server ids and stored image URLs.
      reset(saved.values)
      toast.add({
        title: t.common.success,
        description: t.siteSettings.saveSuccess,
        type: 'success',
      })
    },
    onError: (error) => {
      toast.add({
        title: t.common.error,
        description:
          error instanceof Error ? error.message : t.siteSettings.saveFailed,
        type: 'error',
      })
    },
  })

  const isHoursMissing = isMissing('openTime') || isMissing('closeTime')
  const hoursError = isHoursMissing
    ? t.siteSettings.notConfigured
    : errors.closeTime?.message
  const addressError = isMissing('address')
    ? t.siteSettings.notConfigured
    : errors.address?.message

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
              {t.siteSettings.pageTitle}
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              {t.siteSettings.description}
            </p>
          </div>
          {canWrite && (
            <Button
              type="submit"
              disabled={!isDirty || saveMutation.isPending || isRequiredMissing}
              className="self-start"
            >
              <CheckIcon aria-hidden="true" className="size-4" />
              {t.siteSettings.save}
            </Button>
          )}
        </header>

        {/* Controlled by the URL: a cancelled discard keeps the current language. */}
        <Select
          value={languageId}
          onValueChange={(value) => requestLanguage(value)}
        >
          <SelectTrigger
            aria-label={t.siteSettings.language}
            className="w-full lg:w-64"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                <span aria-hidden="true">{item.flag}</span>
                {item.language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Read-only without write permission. */}
        <fieldset disabled={!canWrite} className="contents">
          <Card aria-labelledby="site-settings-identity-title">
            <CardHeader>
              <CardTitle
                id="site-settings-identity-title"
                className="text-base"
              >
                {t.siteSettings.identity}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 space-y-0">
              <div className="flex flex-col gap-4 lg:flex-row">
                <SiteSettingsTextField
                  name="companyName"
                  label={t.siteSettings.companyName}
                  maxLength={200}
                  required
                  notConfigured={isMissing('companyName')}
                />
                <SiteSettingsTextField
                  name="shortName"
                  label={t.siteSettings.shortName}
                  maxLength={50}
                  notConfigured={isMissing('shortName')}
                />
              </div>
              <div className="flex flex-col gap-4 lg:flex-row">
                <LogoField
                  name="danantaraLogo"
                  label={t.siteSettings.danantaraLogo}
                  notConfigured={isMissing('danantaraLogo')}
                />
                <LogoField
                  name="plnLogo"
                  label={t.siteSettings.plnLogo}
                  notConfigured={isMissing('plnLogo')}
                />
              </div>
            </CardContent>
          </Card>

          <Card aria-labelledby="site-settings-contact-title">
            <CardHeader>
              <CardTitle id="site-settings-contact-title" className="text-base">
                {t.siteSettings.contact}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 space-y-0">
              <div className="flex flex-col gap-2">
                <Label htmlFor="site-settings-address">
                  {t.siteSettings.address}
                  <span className="text-danger">*</span>
                </Label>
                <Textarea
                  id="site-settings-address"
                  maxLength={500}
                  aria-invalid={Boolean(addressError)}
                  {...register('address')}
                  disabled={isMissing('address')}
                />
                <p className="text-foreground/55 text-xs">
                  {t.common.characterCount(addressValue.length, 500)}
                </p>
                {addressError && (
                  <p role="alert" className="text-danger text-sm">
                    {addressError}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-4 lg:flex-row">
                <SiteSettingsTextField
                  name="locationLat"
                  label={t.siteSettings.locationLat}
                  type="number"
                  min={-90}
                  max={90}
                  step="any"
                  helpText={t.siteSettings.locationLatHelp}
                />
                <SiteSettingsTextField
                  name="locationLong"
                  label={t.siteSettings.locationLong}
                  type="number"
                  min={-180}
                  max={180}
                  step="any"
                  helpText={t.siteSettings.locationLongHelp}
                />
              </div>
              <div className="flex flex-col gap-4 lg:flex-row">
                <SiteSettingsTextField
                  name="phone"
                  label={t.siteSettings.phone}
                  type="tel"
                  maxLength={30}
                  notConfigured={isMissing('phone')}
                />
                <SiteSettingsTextField
                  name="whatsapp"
                  label={t.siteSettings.whatsapp}
                  type="tel"
                  maxLength={30}
                  notConfigured={isMissing('whatsapp')}
                />
              </div>
              <div className="flex flex-col gap-4 lg:flex-row">
                <SiteSettingsTextField
                  name="mainEmail"
                  label={t.siteSettings.mainEmail}
                  type="email"
                  maxLength={254}
                  notConfigured={isMissing('mainEmail')}
                />
                <SiteSettingsTextField
                  name="marketingEmail"
                  label={t.siteSettings.marketingEmail}
                  type="email"
                  maxLength={254}
                  notConfigured={isMissing('marketingEmail')}
                />
              </div>
              <div className="flex flex-col gap-4 lg:flex-row">
                <SiteSettingsTextField
                  name="operatingDays"
                  label={t.siteSettings.operatingDays}
                  maxLength={100}
                  notConfigured={isMissing('operatingDays')}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Label htmlFor="site-settings-openTime">
                    {t.siteSettings.operatingHours}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="site-settings-openTime"
                      type="time"
                      aria-label={t.siteSettings.openTime}
                      {...register('openTime')}
                      disabled={isMissing('openTime')}
                    />
                    <span className="text-foreground/55">-</span>
                    <Input
                      type="time"
                      aria-label={t.siteSettings.closeTime}
                      aria-invalid={Boolean(hoursError)}
                      {...register('closeTime')}
                      disabled={isMissing('closeTime')}
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
                {t.siteSettings.socialMedia}
              </CardTitle>
              <span className="text-foreground/55 text-xs">
                {t.siteSettings.socialCount(socialLinks.fields.length)}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              {socialLinks.fields.length === 0 ? (
                <p
                  role="status"
                  className="text-foreground/55 py-6 text-center text-sm"
                >
                  {t.siteSettings.emptySocial}
                </p>
              ) : (
                <DragDropProvider onDragEnd={handleDragEnd}>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary hover:bg-primary">
                        <TableHead className="w-12 px-2" />
                        <TableHead>{t.siteSettings.icon}</TableHead>
                        <TableHead>{t.siteSettings.platform}</TableHead>
                        <TableHead>{t.siteSettings.url}</TableHead>
                        <TableHead>{t.siteSettings.visible}</TableHead>
                        <TableHead className="text-right">
                          {t.siteSettings.action}
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
                {t.siteSettings.addSocial}
              </Button>
            </CardContent>
          </Card>
        </fieldset>
      </form>
    </FormProvider>
  )
}

function LogoField({
  name,
  label,
  notConfigured,
}: {
  name: 'danantaraLogo' | 'plnLogo'
  label: string
  notConfigured: boolean
}) {
  const { t } = useI18n()
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
            disabled={notConfigured}
          />
        )}
      />
      {notConfigured ? (
        <p role="alert" className="text-danger text-sm">
          {t.siteSettings.notConfigured}
        </p>
      ) : (
        <p className="text-foreground/55 text-xs">{t.siteSettings.logoHelp}</p>
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
  const { t } = useI18n()
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
          {t.common.retry}
        </Button>
      )}
    </div>
  )
}

export { SiteSettingsPage }
