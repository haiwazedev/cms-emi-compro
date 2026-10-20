import type { Dictionary } from '@/shared/lib/i18n/id'
import { z } from 'zod'

const imageSchema = z.object({
  url: z.string().nullable(),
  file: z.instanceof(File).nullable(),
})

export function createSiteSettingsFormSchema(t: Dictionary) {
  const optionalEmailSchema = z
    .email(t.siteSettings.emailInvalid)
    .max(254)
    .or(z.literal(''))

  function optionalCoordinateSchema(min: number, max: number, label: string) {
    return z
      .string()
      .trim()
      .refine(
        (value) => {
          if (!value) return true

          const coordinate = Number(value)
          return (
            Number.isFinite(coordinate) &&
            coordinate >= min &&
            coordinate <= max
          )
        },
        { message: t.siteSettings.coordinateRange(label, min, max) },
      )
  }

  const socialLinkSchema = z.object({
    id: z.number().optional(),
    platform: z.string().trim().min(1, t.siteSettings.platformRequired).max(50),
    url: z.string().trim().min(1, t.siteSettings.urlRequired).max(255),
    visible: z.boolean(),
    icon: imageSchema,
  })

  return z
    .object({
      companyName: z
        .string()
        .trim()
        .min(1, t.siteSettings.companyNameRequired)
        .max(200),
      shortName: z.string().trim().max(50),
      danantaraLogo: imageSchema,
      plnLogo: imageSchema,
      address: z
        .string()
        .trim()
        .min(1, t.siteSettings.addressRequired)
        .max(500),
      locationLat: optionalCoordinateSchema(
        -90,
        90,
        t.siteSettings.locationLat,
      ),
      locationLong: optionalCoordinateSchema(
        -180,
        180,
        t.siteSettings.locationLong,
      ),
      phone: z.string().trim().max(30),
      whatsapp: z.string().trim().max(30),
      mainEmail: optionalEmailSchema,
      marketingEmail: optionalEmailSchema,
      operatingDays: z.string().trim().max(100),
      openTime: z.string(),
      closeTime: z.string(),
      socialLinks: z.array(socialLinkSchema),
    })
    .refine(
      (values) => Boolean(values.openTime) === Boolean(values.closeTime),
      {
        message: t.siteSettings.openCloseTimeRequired,
        path: ['closeTime'],
      },
    )
}

// Language id, e.g. "en" (any case accepted); resolved against active languages on the page.
export const siteSettingsSearchSchema = z.object({
  lang: z.string().toLowerCase().optional().catch(undefined),
})

export type SiteSettingsImage = z.infer<typeof imageSchema>
export type SiteSettingsFormValues = z.infer<
  ReturnType<typeof createSiteSettingsFormSchema>
>
