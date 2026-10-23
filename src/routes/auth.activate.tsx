import { ActivatePage } from '@/module/auth/pages/activate-page'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

// No signed-in redirect: a signed-in user may still open a reset link.
export const Route = createFileRoute('/auth/activate')({
  validateSearch: z.object({
    token: z.string().optional().catch(undefined),
  }),
  component: ActivatePage,
})
