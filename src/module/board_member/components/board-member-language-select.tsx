import type { Language } from '@/module/language/api/language.api'
import { BOARD_MEMBER_LABELS } from '@/module/board_member/constants/board-member.constants'
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
  return (
    <Select value={languageId} onValueChange={onLanguageChange}>
      <SelectTrigger
        aria-label={BOARD_MEMBER_LABELS.language}
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
