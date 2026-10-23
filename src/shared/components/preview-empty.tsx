import { useI18n } from '@/shared/lib/i18n/i18n-context'

// Stands in for a landing section that hides itself without complete content.
function PreviewEmpty() {
  const { t } = useI18n()

  return (
    <p className="border-border text-foreground/55 rounded-xl border border-dashed p-6 text-center text-sm">
      {t.common.previewEmpty}
    </p>
  )
}

export { PreviewEmpty }
