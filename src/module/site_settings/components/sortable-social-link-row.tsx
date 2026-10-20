import { usePermissions } from '@/module/auth/hooks/use-permissions'
import { ImageFileField } from '@/module/site_settings/components/image-file-field'
import {
  SITE_SETTINGS_ICON_MAX_SIZE,
  SITE_SETTINGS_ICON_TYPES,
} from '@/module/site_settings/constants/site-settings.constants'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { SiteSettingsFormValues } from '@/module/site_settings/schemas/site-settings.schema'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon, Trash2Icon } from 'lucide-react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

interface SortableSocialLinkRowProps {
  id: string
  index: number
  onDelete: (index: number) => void
}

function SortableSocialLinkRow({
  id,
  index,
  onDelete,
}: SortableSocialLinkRowProps) {
  const { t } = useI18n()
  const { canPublish } = usePermissions()
  const { ref, handleRef } = useSortable({ id, index, group: 'social-links' })
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SiteSettingsFormValues>()
  const platformValue = useWatch({
    control,
    name: `socialLinks.${index}.platform`,
  })
  const urlValue = useWatch({ control, name: `socialLinks.${index}.url` })
  const rowErrors = errors.socialLinks?.[index]
  const rowNumber = index + 1

  return (
    <TableRow ref={ref}>
      <TableCell className="w-12 px-2">
        <button
          ref={handleRef}
          type="button"
          aria-label={t.siteSettings.dragSocial(rowNumber)}
          className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing"
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>
      </TableCell>
      <TableCell className="w-40">
        <Controller
          control={control}
          name={`socialLinks.${index}.icon`}
          render={({ field }) => (
            <ImageFileField
              id={`social-icon-${id}`}
              label={`${t.siteSettings.icon} ${rowNumber}`}
              value={field.value}
              onChange={field.onChange}
              extensions={SITE_SETTINGS_ICON_TYPES}
              maxSize={SITE_SETTINGS_ICON_MAX_SIZE}
              previewClassName="size-9 p-1.5"
            />
          )}
        />
      </TableCell>
      <TableCell className="w-44">
        <Input
          aria-label={`${t.siteSettings.platform} ${rowNumber}`}
          aria-invalid={Boolean(rowErrors?.platform)}
          maxLength={50}
          {...register(`socialLinks.${index}.platform`)}
        />
        <p className="text-foreground/55 mt-1 text-xs">
          {t.common.characterCount(platformValue.length, 50)}
        </p>
        <RowError message={rowErrors?.platform?.message} />
      </TableCell>
      <TableCell className="min-w-64">
        <Input
          aria-label={`${t.siteSettings.url} ${rowNumber}`}
          aria-invalid={Boolean(rowErrors?.url)}
          maxLength={255}
          {...register(`socialLinks.${index}.url`)}
        />
        <p className="text-foreground/55 mt-1 text-xs">
          {t.common.characterCount(urlValue.length, 255)}
        </p>
        <RowError message={rowErrors?.url?.message} />
      </TableCell>
      <TableCell className="w-20">
        <Controller
          control={control}
          name={`socialLinks.${index}.visible`}
          render={({ field }) => (
            <Switch
              aria-label={t.siteSettings.toggleSocial(rowNumber)}
              checked={field.value}
              onCheckedChange={field.onChange}
              // Without publish the server keeps each link's saved status.
              disabled={!canPublish}
              title={canPublish ? undefined : t.auth.draftOnly}
            />
          )}
        />
      </TableCell>
      <TableCell className="w-16 text-right">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={t.siteSettings.deleteSocial(rowNumber)}
          onClick={() => onDelete(index)}
        >
          <Trash2Icon aria-hidden="true" className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

function RowError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p role="alert" className="text-danger mt-1 text-xs">
      {message}
    </p>
  )
}

export { SortableSocialLinkRow }
