import { z } from 'zod'
import type { Dictionary } from '@/shared/lib/i18n/id'

export function createBoardMemberFormSchema(t: Dictionary) {
  return z.object({
    name: z.string().trim().min(1, t.boardMember.requiredName).max(200),
    company_name: z.string().trim().max(100, t.boardMember.max100Chars),
    role: z.string().trim().min(1, t.boardMember.requiredRole).max(100),
    description: z.string().trim(),
    board_member_type_id: z.number().int().positive(t.boardMember.requiredType),
  })
}

export type BoardMemberFormValues = z.infer<
  ReturnType<typeof createBoardMemberFormSchema>
>
