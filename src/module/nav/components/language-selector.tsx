import { NAVIGATION_TOPBAR_LABELS } from '../constants/navigation.constants'

function LanguageSelector() {
  return (
    <div
      role="group"
      aria-label={NAVIGATION_TOPBAR_LABELS.languageSelector}
      className="border-border/20 flex shrink-0 items-center overflow-hidden rounded-full border text-xs font-semibold"
    >
      {NAVIGATION_TOPBAR_LABELS.languages.map((language) => {
        const isActive = language === NAVIGATION_TOPBAR_LABELS.activeLanguage

        return (
          <span
            key={language}
            aria-current={isActive ? 'true' : undefined}
            className={
              isActive
                ? 'bg-accent px-3 py-2 text-white'
                : 'text-accent px-3 py-2'
            }
          >
            {language}
          </span>
        )
      })}
    </div>
  )
}

export { LanguageSelector }
