import type { Language } from '@/module/language/api/language.api'
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
  return (
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
  )
}

export { LanguageSelect }
