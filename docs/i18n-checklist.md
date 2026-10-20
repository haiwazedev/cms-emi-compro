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
- [x] **2. Locale switcher**: wire existing `LanguageSelector` (`src/module/nav/components/language-selector.tsx`) to `useI18n()`
  - Static `<span>`s become `<button>`s calling `setLocale`; active state from current locale
  - Drop `activeLanguage` and `languages` from `NAVIGATION_TOPBAR_LABELS`
- [x] **3. Shared components**: close labels in `src/shared/components/ui` (`dialog`, `sheet`, `toast`). Empty states, confirm dialogs and toast messages live in module constants, so they move with each module step
- [x] **4. Dates & formatting**: `formatRelativeTime` (shared + `user.constants`) and `formatDateTime` take `locale`; `Calendar` follows the UI locale
  - Module-specific `Intl`/`toLocale*('id-ID')` calls move with their module step (inbox, dashboard, document_commitment, article)
- [x] **5. Validation pattern**: piloted on `auth/schemas/login.schema.ts`
  - Schema becomes a factory `createXSchema(t: Dictionary)`; form type is `z.infer<ReturnType<typeof createXSchema>>`
  - Component: `const { t } = useI18n()` then `zodResolver(createXSchema(t))`
  - Messages move from module constants to `t.<module>.*`
- [x] **6. Module: nav** (sidebar, topbar, drawer, profile, search); page title comes from route `staticData.title`, so it moves with step 23
- [x] **7. Module: auth** (login), done together with step 5; route `pageTitle` stays for step 23
- [x] **8. Module: dashboard**
- [x] **9. Module: faq**
- [x] **10. Module: client**
- [x] **11. Module: division**
- [x] **12. Module: board_member** (incl. types)
- [x] **13. Module: document_commitment** (incl. categories, upload dialog)
- [x] **14. Module: article** (incl. categories)
- [x] **15. Module: home**
- [ ] **16. Module: about-us**
- [ ] **17. Module: media**
- [ ] **18. Module: inbox**
- [ ] **19. Module: site_settings**
- [ ] **20. Module: user** (users & roles)
- [ ] **21. Module: activity_log**
- [ ] **22. Module: language**
- [ ] **23. Route titles** in `src/routes/*`
- [ ] **24. Sweep**: grep for leftover hardcoded Indonesian strings; decide on API error messages (show as-is or map by code); remove `PERMISSION_HINTS` once every user reads `t.auth.draftOnly`

## Per-module definition of done

- No hardcoded UI strings left in the module
- Keys grouped under the module name (`t.faq.*`); shared words reuse `t.common.*`
- `en` translations filled in
- Form validation messages follow the active locale
- Toast titles use `t.common.success` / `t.common.error` instead of hardcoded `'Success'` / `'Error'`
- Dates and numbers use `locale` from `useI18n()` instead of `'id-ID'`
