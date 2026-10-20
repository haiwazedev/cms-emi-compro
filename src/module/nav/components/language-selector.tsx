import { LOCALES, useI18n } from '@/shared/lib/i18n/i18n-context'

function LanguageSelector() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t.nav.languageSelector}
      className="border-border flex shrink-0 items-center overflow-hidden rounded-full border text-xs font-semibold"
    >
      {LOCALES.map((option) => {
        const isActive = option === locale

        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => setLocale(option)}
            className={
              isActive
                ? 'bg-accent px-3 py-2 text-white'
                : 'text-accent px-3 py-2'
            }
          >
            {option.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}

export { LanguageSelector }
