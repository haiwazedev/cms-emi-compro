import { ImageFileField } from '@/module/site_settings/components/image-file-field'
import {
  SITE_SETTINGS_ICON_MAX_SIZE,
  SITE_SETTINGS_ICON_TYPES,
  SITE_SETTINGS_LABELS,
} from '@/module/site_settings/constants/site-settings.constants'
import type { SiteSettingsFormValues } from '@/module/site_settings/schemas/site-settings.schema'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon, Trash2Icon } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'

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
  const { ref, handleRef } = useSortable({ id, index, group: 'social-links' })
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SiteSettingsFormValues>()
  const rowErrors = errors.socialLinks?.[index]
  const rowNumber = index + 1

  return (
    <TableRow ref={ref}>
      <TableCell className="w-12 px-2">
        <button
          ref={handleRef}
          type="button"
          aria-label={SITE_SETTINGS_LABELS.dragSocial(rowNumber)}
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
              label={`${SITE_SETTINGS_LABELS.icon} ${rowNumber}`}
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
          aria-label={`${SITE_SETTINGS_LABELS.platform} ${rowNumber}`}
          aria-invalid={Boolean(rowErrors?.platform)}
          {...register(`socialLinks.${index}.platform`)}
        />
        <RowError message={rowErrors?.platform?.message} />
      </TableCell>
      <TableCell className="min-w-64">
        <Input
          aria-label={`${SITE_SETTINGS_LABELS.url} ${rowNumber}`}
          aria-invalid={Boolean(rowErrors?.url)}
          {...register(`socialLinks.${index}.url`)}
        />
        <RowError message={rowErrors?.url?.message} />
      </TableCell>
      <TableCell className="w-20">
        <Controller
          control={control}
          name={`socialLinks.${index}.visible`}
          render={({ field }) => (
            <Switch
              aria-label={SITE_SETTINGS_LABELS.toggleSocial(rowNumber)}
              checked={field.value}
              onCheckedChange={field.onChange}
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
          aria-label={SITE_SETTINGS_LABELS.deleteSocial(rowNumber)}
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
