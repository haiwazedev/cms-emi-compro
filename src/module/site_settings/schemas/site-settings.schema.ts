import { z } from 'zod'

const imageSchema = z.object({
  url: z.string().nullable(),
  file: z.instanceof(File).nullable(),
})

const optionalEmailSchema = z
  .email('Format email tidak valid.')
  .max(254)
  .or(z.literal(''))

const socialLinkSchema = z.object({
  id: z.number().optional(),
  platform: z.string().trim().min(1, 'Platform wajib diisi.').max(50),
  url: z.string().trim().min(1, 'URL / akun wajib diisi.').max(255),
  visible: z.boolean(),
  icon: imageSchema,
})

export const siteSettingsFormSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .min(1, 'Nama perusahaan wajib diisi.')
      .max(200),
    shortName: z.string().trim().max(50),
    danantaraLogo: imageSchema,
    plnLogo: imageSchema,
    address: z.string().trim().min(1, 'Alamat wajib diisi.').max(500),
    phone: z.string().trim().max(30),
    whatsapp: z.string().trim().max(30),
    mainEmail: optionalEmailSchema,
    marketingEmail: optionalEmailSchema,
    operatingDays: z.string().trim().max(100),
    openTime: z.string(),
    closeTime: z.string(),
    socialLinks: z.array(socialLinkSchema),
  })
  .refine((values) => Boolean(values.openTime) === Boolean(values.closeTime), {
    message: 'Isi jam buka dan jam tutup.',
    path: ['closeTime'],
  })

// Language abbreviation, e.g. "EN"; resolved against active languages on the page.
export const siteSettingsSearchSchema = z.object({
  lang: z.string().optional().catch(undefined),
})

export type SiteSettingsImage = z.infer<typeof imageSchema>
export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>
