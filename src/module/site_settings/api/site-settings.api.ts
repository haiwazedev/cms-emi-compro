import { getMediaAssetUrl } from '@/module/media/api/media.api'
import { SITE_SETTINGS_EMPTY_VALUES } from '@/module/site_settings/constants/site-settings.constants'
import type {
  SiteSettingsFormValues,
  SiteSettingsImage,
} from '@/module/site_settings/schemas/site-settings.schema'
import { apiClient } from '@/shared/lib/api-client'

type SiteSocialMediaStatus = 'DRAFT' | 'PUBLISHED'

export interface SiteSocialMedia {
  id: number
  platform_name: string
  platform_url_or_account_name: string
  icon_filepath: string | null
  status: SiteSocialMediaStatus
  sort_order: number
}

// Form field → response key. A `null` response value means the key has no row
// for the language, so its input is disabled.
const SETTING_FIELDS = {
  companyName: 'company_name',
  shortName: 'company_short_name',
  danantaraLogo: 'danantara_logo_filepath',
  plnLogo: 'pln_logo_filepath',
  address: 'company_address',
  phone: 'company_phone_number',
  whatsapp: 'company_whatsapp_number',
  mainEmail: 'main_email',
  marketingEmail: 'marketing_email',
  operatingDays: 'operational_day',
  openTime: 'operational_start_time',
  closeTime: 'operational_end_time',
} as const

export type SiteSettingsField = keyof typeof SETTING_FIELDS

const TEXT_FIELDS = [
  'companyName',
  'shortName',
  'address',
  'phone',
  'whatsapp',
  'mainEmail',
  'marketingEmail',
  'operatingDays',
  'openTime',
  'closeTime',
] as const satisfies SiteSettingsField[]

export type SiteSettings = {
  language_id: string
  company_location_lat: number | null
  company_location_long: number | null
  social_medias: SiteSocialMedia[]
} & Record<(typeof SETTING_FIELDS)[SiteSettingsField], string | null>

interface SiteSettingsResponse {
  site_settings: SiteSettings
}

export interface SiteSettingsData {
  values: SiteSettingsFormValues
  unconfigured: SiteSettingsField[]
}

export async function getSiteSettings(languageId: string) {
  const { data } = await apiClient.get<SiteSettingsResponse>('/site_settings', {
    params: { language_id: languageId },
  })
  return toSettingsData(data.site_settings)
}

export async function saveSiteSettings({
  values,
  unconfigured,
  languageId,
}: {
  values: SiteSettingsFormValues
  unconfigured: SiteSettingsField[]
  languageId: string
}) {
  const { data } = await apiClient.put<SiteSettingsResponse>(
    '/site_settings',
    toFormData(values, unconfigured, languageId),
  )
  return toSettingsData(data.site_settings)
}

function toSettingsData(settings: SiteSettings): SiteSettingsData {
  const unconfigured = (
    Object.keys(SETTING_FIELDS) as SiteSettingsField[]
  ).filter((field) => settings[SETTING_FIELDS[field]] === null)

  return {
    unconfigured,
    values: {
      ...SITE_SETTINGS_EMPTY_VALUES,
      companyName: settings.company_name ?? '',
      shortName: settings.company_short_name ?? '',
      danantaraLogo: toImage(settings.danantara_logo_filepath),
      plnLogo: toImage(settings.pln_logo_filepath),
      address: settings.company_address ?? '',
      locationLat: settings.company_location_lat?.toString() ?? '',
      locationLong: settings.company_location_long?.toString() ?? '',
      phone: settings.company_phone_number ?? '',
      whatsapp: settings.company_whatsapp_number ?? '',
      mainEmail: settings.main_email ?? '',
      marketingEmail: settings.marketing_email ?? '',
      operatingDays: settings.operational_day ?? '',
      openTime: settings.operational_start_time ?? '',
      closeTime: settings.operational_end_time ?? '',
      socialLinks: settings.social_medias.map((socialMedia) => ({
        id: socialMedia.id,
        platform: socialMedia.platform_name,
        url: socialMedia.platform_url_or_account_name,
        visible: socialMedia.status === 'PUBLISHED',
        icon: toImage(socialMedia.icon_filepath),
      })),
    },
  }
}

function toImage(filepath: string | null): SiteSettingsImage {
  return { url: filepath ? getMediaAssetUrl(filepath) : null, file: null }
}

function toFormData(
  values: SiteSettingsFormValues,
  unconfigured: SiteSettingsField[],
  languageId: string,
) {
  const isConfigured = (field: SiteSettingsField) =>
    !unconfigured.includes(field)
  const formData = new FormData()
  const iconFiles: File[] = []

  const socialMedias = values.socialLinks.map((link) => {
    const iconIndex = link.icon.file
      ? iconFiles.push(link.icon.file) - 1
      : undefined

    return {
      id: link.id,
      platform_name: link.platform,
      platform_url_or_account_name: link.url,
      status: (link.visible ? 'PUBLISHED' : 'DRAFT') as SiteSocialMediaStatus,
      icon_index: iconIndex,
    }
  })

  // Unconfigured keys are left out; the API rejects them for this language.
  const textValues = Object.fromEntries(
    TEXT_FIELDS.filter(isConfigured).map((field) => [
      SETTING_FIELDS[field],
      values[field],
    ]),
  )

  formData.append(
    'data',
    JSON.stringify({
      language_id: languageId,
      ...textValues,
      company_location_lat: values.locationLat
        ? Number(values.locationLat)
        : null,
      company_location_long: values.locationLong
        ? Number(values.locationLong)
        : null,
      social_medias: socialMedias,
    }),
  )
  if (values.danantaraLogo.file && isConfigured('danantaraLogo')) {
    formData.append('danantara_logo', values.danantaraLogo.file)
  }
  if (values.plnLogo.file && isConfigured('plnLogo')) {
    formData.append('pln_logo', values.plnLogo.file)
  }
  iconFiles.forEach((file) => formData.append('social_icons', file))

  return formData
}
