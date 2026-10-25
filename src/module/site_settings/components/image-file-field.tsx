import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { SiteSettingsImage } from '@/module/site_settings/schemas/site-settings.schema'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { UploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'

interface ImageFileFieldProps {
  id: string
  label: string
  value: SiteSettingsImage
  onChange: (value: SiteSettingsImage) => void
  extensions: string[]
  maxSize: number
  hint?: string
  previewClassName?: string
  disabled?: boolean
}

function ImageFileField({
  id,
  label,
  value,
  onChange,
  extensions,
  maxSize,
  hint,
  previewClassName,
  disabled = false,
}: ImageFileFieldProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()

  function handleFile(file: File | undefined) {
    setError(undefined)
    if (!file) return

    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!extensions.includes(extension)) {
      setError(t.siteSettings.imageInvalid)
      return
    }

    if (file.size > maxSize) {
      setError(t.siteSettings.imageTooLarge(maxSize / 1024 / 1024))
      return
    }

    if (value.file && value.url) URL.revokeObjectURL(value.url)
    onChange({ url: URL.createObjectURL(file), file })
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={extensions.map((extension) => `.${extension}`).join(',')}
        className="hidden"
        aria-label={label}
        onChange={(event) => {
          handleFile(event.currentTarget.files?.[0])
          event.currentTarget.value = ''
        }}
      />
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'bg-primary flex shrink-0 items-center justify-center overflow-hidden rounded-md',
            previewClassName,
          )}
        >
          {value.url ? (
            <img
              src={value.url}
              alt={label}
              className="size-full object-contain"
            />
          ) : (
            <span className="text-foreground/55 text-xs">
              {t.siteSettings.noImage}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon aria-hidden="true" className="size-4" />
          {value.url ? t.siteSettings.change : t.siteSettings.choose}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
      {hint && <p className="text-foreground/55 text-xs">{hint}</p>}
    </div>
  )
}

export { ImageFileField }
