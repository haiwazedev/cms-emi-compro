import { queryOptions } from '@tanstack/react-query'
import { getBoardMemberTypes, getBoardMembers } from '../api/board-member.api'
import type { BoardMemberListParams } from '../api/board-member.api'

export const boardMemberQueryKeys = {
  all: ['boardMembers'] as const,
  members: () => [...boardMemberQueryKeys.all, 'list'] as const,
  memberList: (params: BoardMemberListParams) =>
    [...boardMemberQueryKeys.members(), params] as const,
  types: () => [...boardMemberQueryKeys.all, 'types'] as const,
}

export function boardMembersQueryOptions(params: BoardMemberListParams) {
  return queryOptions({
    queryKey: boardMemberQueryKeys.memberList(params),
    queryFn: () => getBoardMembers(params),
    staleTime: 30_000,
  })
}

export function boardMemberTypesQueryOptions() {
  return queryOptions({
    queryKey: boardMemberQueryKeys.types(),
    queryFn: getBoardMemberTypes,
    staleTime: 5 * 60_000,
  })
}
