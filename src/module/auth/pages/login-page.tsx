import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { LoginForm } from '../components/login-form'

function LoginPage() {
  const { t } = useI18n()

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section
        aria-labelledby="brand-heading"
        className="from-secondary to-accent relative flex min-h-72 flex-col overflow-hidden bg-linear-to-br px-8 py-8 text-white lg:min-h-screen lg:w-1/2 lg:px-14 lg:py-12"
      >
        <div className="relative z-10 flex flex-1 flex-col justify-center py-8 lg:py-0">
          <h2
            id="brand-heading"
            className="max-w-xl text-4xl leading-tight font-semibold tracking-tight lg:text-5xl"
          >
            {t.auth.brandTitle}
            <br />
            <span className="font-serif font-normal text-white/75 italic">
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
