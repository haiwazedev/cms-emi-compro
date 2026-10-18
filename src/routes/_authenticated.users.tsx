import {
  USER_DEFAULT_PAGE_SIZE,
  USER_LABELS,
} from '@/module/user/constants/user.constants'
import { UsersPage } from '@/module/user/pages/users-page'
import { userSearchSchema } from '@/module/user/schemas/user-search.schema'
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/users')({
  validateSearch: userSearchSchema,
  search: {
    middlewares: [
      stripSearchParams({ page: 1, limit: USER_DEFAULT_PAGE_SIZE }),
    ],
  },
  component: UsersPage,
  staticData: { title: USER_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: USER_LABELS.documentTitle }],
  }),
})
