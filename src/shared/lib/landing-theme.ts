import type { CSSProperties } from 'react'

// Landing page tokens, scoped to a preview subtree so the CMS theme stays untouched.
// Works because index.css uses `@theme inline`: utilities read these variables directly.
// shortcut: copied from emi-compro `src/app/globals.css` :root, keep in sync when the landing theme changes.
const landingThemeStyle = {
  '--foreground': '#1e2f40',
  '--primary': '#e9eff4',
  '--accent-2': '#1d5c55',
  '--font-display': "'Instrument Serif', serif",
} as CSSProperties

export { landingThemeStyle }
