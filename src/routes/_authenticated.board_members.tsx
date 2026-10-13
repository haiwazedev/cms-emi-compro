import { BoardMembersPage } from '@/module/board_member/pages/board-members-page'
import { BOARD_MEMBER_LABELS } from '@/module/board_member/constants/board-member.constants'
import { boardMemberSearchSchema } from '@/module/board_member/schemas/board-member-search.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/board_members')({
  validateSearch: boardMemberSearchSchema,
  component: BoardMembersPage,
  staticData: { title: BOARD_MEMBER_LABELS.pageTitle },
  head: () => ({
    meta: [{ title: BOARD_MEMBER_LABELS.documentTitle }],
  }),
})
