import { z } from 'zod'

export const boardMemberTypeFormSchema = z.object({
  type: z
    .string()
    .trim()
    .min(1, 'Nama tipe wajib diisi.')
    .max(100, 'Nama tipe maksimal 100 karakter.'),
})

export type BoardMemberTypeFormValues = z.infer<
  typeof boardMemberTypeFormSchema
>
