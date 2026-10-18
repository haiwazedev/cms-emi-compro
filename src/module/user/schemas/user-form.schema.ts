import { z } from 'zod'

export const NO_ROLE = 'NONE'

export const userFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi.').max(100),
  email: z.string().trim().toLowerCase().email('Email tidak valid.'),
  role: z.string(),
  is_active: z.boolean(),
})

export const roleFormSchema = z.object({
  name: z.string().trim().min(1, 'Judul wajib diisi.').max(100),
  description: z.string().trim().max(500),
})

export type UserFormValues = z.infer<typeof userFormSchema>
export type RoleFormValues = z.infer<typeof roleFormSchema>
