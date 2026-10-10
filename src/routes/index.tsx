import { Button } from '@/shared/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl space-y-6 text-center">
        <p className="text-muted-foreground text-sm font-medium tracking-wide">
          PLN EMI ADMIN
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Your workspace is ready.
        </h1>
        <p className="text-muted-foreground">
          Start building your application with the configured routes, data
          fetching, forms, and UI components.
        </p>
        <Button>Get started</Button>
      </section>
    </main>
  )
}
