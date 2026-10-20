# CMS UI i18n Checklist

Scope: translate the CMS interface (labels, buttons, messages). Content
translation (`language_id`) already exists and is out of scope.

Locales: `id` (default, source of truth) and `en`.

Each step = one commit. Verify with `pnpm lint` and `pnpm build`, run prettier.

## Steps

- [x] **1. Foundation**
  - `src/shared/lib/i18n/id.ts`: source dictionary, exports `Dictionary` type, starts with `common` keys
  - `src/shared/lib/i18n/en.ts`: typed `Dictionary`, so missing or extra keys fail `tsc`
  - `I18nProvider` + `useI18n()` hook (`{ t, locale, setLocale }`); locale persisted in `localStorage`, fallback `id`
  - Wrap app in `src/main.tsx`; sync `<html lang>`
- [ ] **2. Locale switcher**: wire existing `LanguageSelector` (`src/module/nav/components/language-selector.tsx`) to `useI18n()`
  - Static `<span>`s become `<button>`s calling `setLocale`; active state from current locale
  - Drop `activeLanguage` from `NAVIGATION_TOPBAR_LABELS`
- [ ] **3. Shared components**: `src/shared/components`, `src/shared/layouts`, table empty states, confirm dialogs, toasts
- [ ] **4. Dates & formatting**: `format-relative-time.ts`, `Intl.DateTimeFormat(locale)`, `react-day-picker` locale
- [ ] **5. Validation pattern**: convert Zod schemas to receive `t` (pilot on one module, then reuse)
- [ ] **6. Module: nav**
- [ ] **7. Module: auth** (login)
- [ ] **8. Module: dashboard**
- [ ] **9. Module: faq**
- [ ] **10. Module: client**
- [ ] **11. Module: division**
- [ ] **12. Module: board_member** (incl. types)
- [ ] **13. Module: document_commitment** (incl. categories, upload dialog)
- [ ] **14. Module: article** (incl. categories)
- [ ] **15. Module: home**
- [ ] **16. Module: about-us**
- [ ] **17. Module: media**
- [ ] **18. Module: inbox**
- [ ] **19. Module: site_settings**
- [ ] **20. Module: user** (users & roles)
- [ ] **21. Module: activity_log**
- [ ] **22. Module: language**
- [ ] **23. Route titles** in `src/routes/*`
- [ ] **24. Sweep**: grep for leftover hardcoded Indonesian strings; decide on API error messages (show as-is or map by code)

## Per-module definition of done

- No hardcoded UI strings left in the module
- Keys grouped under the module name (`t.faq.*`); shared words reuse `t.common.*`
- `en` translations filled in
- Form validation messages follow the active locale
