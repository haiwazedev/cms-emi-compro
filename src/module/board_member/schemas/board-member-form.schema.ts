import { z } from 'zod'

export const boardMemberFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi.').max(200),
  role: z.string().trim().min(1, 'Jabatan wajib diisi.').max(100),
  board_member_type_id: z
    .number()
    .int()
    .positive('Tipe pengurus wajib dipilih.'),
})

export type BoardMemberFormValues = z.infer<typeof boardMemberFormSchema>
