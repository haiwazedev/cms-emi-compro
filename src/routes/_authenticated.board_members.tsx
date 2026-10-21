import { BoardMembersPage } from '@/module/board_member/pages/board-members-page'
import { boardMemberSearchSchema } from '@/module/board_member/schemas/board-member-search.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/board_members')({
  validateSearch: boardMemberSearchSchema,
  component: BoardMembersPage,
  staticData: { title: (t) => t.boardMember.pageTitle },
})
