import { BoardMemberTypesPage } from '@/module/board_member/pages/board-member-types-page'
import { boardMemberTypeSearchSchema } from '@/module/board_member/schemas/board-member-search.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/board_member_types')({
  validateSearch: boardMemberTypeSearchSchema,
  component: BoardMemberTypesPage,
  staticData: { title: (t) => t.boardMember.typesPageTitle },
})
