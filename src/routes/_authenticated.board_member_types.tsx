import { BoardMemberTypesPage } from '@/module/board_member/pages/board-member-types-page'
import { BOARD_MEMBER_LABELS } from '@/module/board_member/constants/board-member.constants'
import { boardMemberTypeSearchSchema } from '@/module/board_member/schemas/board-member-search.schema'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/board_member_types')({
  validateSearch: boardMemberTypeSearchSchema,
  component: BoardMemberTypesPage,
  staticData: { title: BOARD_MEMBER_LABELS.typesPageTitle },
  head: () => ({
    meta: [{ title: BOARD_MEMBER_LABELS.typesDocumentTitle }],
  }),
})
