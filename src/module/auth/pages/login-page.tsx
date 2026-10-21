import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { LoginForm } from '../components/login-form'

const brandBackground = {
  background:
    'linear-gradient(115.69deg, #17564D 0%, #204A66 55%, #16324C 100%)',
}

// Thin diagonal lines: 0.07% stroke repeated every ~0.985% (from the design).
const brandLines = {
  background:
    'repeating-linear-gradient(119.04deg, rgb(255 255 255 / 0.5) 0 0.07%, transparent 0.07% 0.985%)',
}

const brandHeading = { fontFamily: "'Playfair Display', serif" }

function LoginPage() {
  const { t } = useI18n()

  return (
    <main className="flex min-h-screen flex-col p-4 lg:flex-row lg:p-12">
      <section
        aria-labelledby="brand-heading"
        className="relative flex min-h-72 flex-col overflow-hidden px-8 py-8 text-white lg:w-1/2 lg:px-14 lg:py-12"
        style={brandBackground}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10"
          style={brandLines}
        />
        <div className="relative z-10 flex items-center gap-4">
          <img
            src="/danantara-logo.png"
            alt="Danantara Indonesia"
            className="h-8 w-auto"
          />
          <img
            src="/pln-logo.png"
            alt="PLN Energy Management Indonesia"
            className="h-8 w-auto"
          />
        </div>
        <div className="relative z-10 flex flex-1 flex-col justify-center py-8 lg:py-0">
          <h2
            id="brand-heading"
            className="max-w-xl text-4xl leading-tight font-medium lg:text-5xl"
            style={brandHeading}
          >
            {t.auth.brandTitle}
            <br />
            <span className="text-sky-deep font-normal italic">
              {t.auth.brandTitleAccent}
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 lg:text-base">
            {t.auth.brandDescription}
          </p>
        </div>
        <footer className="relative z-10 text-xs text-white/60">
          {t.auth.copyright(new Date().getFullYear())}
        </footer>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16 lg:py-0">
        <div className="w-full max-w-xl">
          <header className="mb-10 space-y-4">
            <p className="text-secondary text-sm font-semibold tracking-widest uppercase">
              {t.auth.eyebrow}
            </p>
            <h1 className="text-accent text-4xl font-bold tracking-tight">
              {t.auth.title}
            </h1>
            <p className="text-foreground/60 text-lg">{t.auth.description}</p>
          </header>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}

export { LoginPage }
