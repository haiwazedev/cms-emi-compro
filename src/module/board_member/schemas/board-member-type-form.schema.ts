import { z } from 'zod'
import type { Dictionary } from '@/shared/lib/i18n/id'

export function createBoardMemberTypeFormSchema(t: Dictionary) {
  return z.object({
    type: z
      .string()
      .trim()
      .min(1, t.boardMember.requiredTypeName)
      .max(100, t.boardMember.typeNameMax),
  })
}

export type BoardMemberTypeFormValues = z.infer<
  ReturnType<typeof createBoardMemberTypeFormSchema>
>
