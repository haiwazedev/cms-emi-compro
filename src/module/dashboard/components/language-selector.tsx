import { DASHBOARD_LABELS } from '../constants/dashboard.constants'

function LanguageSelector() {
  return (
    <div
      role="group"
      aria-label={DASHBOARD_LABELS.languageSelector}
      className="border-border/20 flex shrink-0 items-center overflow-hidden rounded-full border text-xs font-semibold"
    >
      {DASHBOARD_LABELS.languages.map((language) => {
        const isActive = language === DASHBOARD_LABELS.activeLanguage

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
