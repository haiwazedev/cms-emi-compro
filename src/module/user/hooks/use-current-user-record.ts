import { authQueryOptions } from '@/module/auth/queries/auth.queries'
import { usersQueryOptions } from '@/module/user/queries/user.queries'
import { useQuery } from '@tanstack/react-query'

// /auth/me has no id or role, so find the signed-in user's row by their unique email.
export function useCurrentUserRecord() {
  const { data: me } = useQuery(authQueryOptions())
  const { data } = useQuery({
    ...usersQueryOptions({ page: 1, limit: 100, search: me?.email }),
    enabled: Boolean(me),
  })

  return data?.users.find((user) => user.email === me?.email)
}
