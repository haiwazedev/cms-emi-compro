import {
  USER_DEFAULT_PAGE_SIZE,
  USER_LABELS,
} from '@/module/user/constants/user.constants'
import { UsersPage } from '@/module/user/pages/users-page'
import { userSearchSchema } from '@/module/user/schemas/user-search.schema'
import { authQueryOptions } from '@/module/auth/queries/auth.queries'
import { getPermissions } from '@/module/auth/hooks/use-permissions'
import {
  createFileRoute,
  redirect,
  stripSearchParams,
} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/users')({
  validateSearch: userSearchSchema,
  search: {
    middlewares: [
      stripSearchParams({ page: 1, limit: USER_DEFAULT_PAGE_SIZE }),
    ],
  },
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(authQueryOptions())

    if (!getPermissions(user).canManageUsers) {
      throw redirect({ to: '/home' })
    }
  },
  component: UsersPage,
  staticData: { title: USER_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: USER_LABELS.documentTitle }],
  }),
})
