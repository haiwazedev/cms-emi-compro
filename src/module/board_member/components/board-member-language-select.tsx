import type { Language } from '@/module/language/api/language.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

interface BoardMemberLanguageSelectProps {
  languages: Language[]
  languageId: string
  onLanguageChange: (languageId: string) => void
}

function BoardMemberLanguageSelect({
  languages,
  languageId,
  onLanguageChange,
}: BoardMemberLanguageSelectProps) {
  const { t } = useI18n()
  return (
    <Select value={languageId} onValueChange={onLanguageChange}>
      <SelectTrigger
        aria-label={t.boardMember.language}
        className="w-full lg:w-64"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.id} value={language.id}>
            <span aria-hidden="true">{language.flag}</span>
            {language.language}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { BoardMemberLanguageSelect }
