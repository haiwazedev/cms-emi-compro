import type { Language } from '@/module/language/api/language.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

function LanguageSelect({
  label,
  languages,
  value,
  onChange,
}: {
  label: string
  languages: Language[]
  value: string
  onChange: (languageId: string) => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-sm font-medium">
        {t.common.contentLabel}
      </span>
      <Select value={value} onValueChange={(next) => onChange(String(next))}>
        <SelectTrigger aria-label={label} className="w-full lg:w-64">
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
    </div>
  )
}

export { LanguageSelect }
