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

export interface SiteSettings {
  id: number
  company_name: string
  company_short_name: string | null
  danantara_logo_filepath: string | null
  pln_logo_filepath: string | null
  company_address: string
  company_phone_number: string | null
  company_whatsapp_number: string | null
  main_email: string | null
  marketing_email: string | null
  operational_day: string | null
  operational_start_time: string | null
  operational_end_time: string | null
  social_medias: SiteSocialMedia[]
}

interface SiteSettingsResponse {
  site_settings: SiteSettings | null
}

export async function getSiteSettings() {
  const { data } = await apiClient.get<SiteSettingsResponse>('/site_settings')
  return toFormValues(data.site_settings)
}

export async function saveSiteSettings(values: SiteSettingsFormValues) {
  const { data } = await apiClient.put<SiteSettingsResponse>(
    '/site_settings',
    toFormData(values),
  )
  return toFormValues(data.site_settings)
}

function toFormValues(settings: SiteSettings | null): SiteSettingsFormValues {
  if (!settings) return SITE_SETTINGS_EMPTY_VALUES

  return {
    companyName: settings.company_name,
    shortName: settings.company_short_name ?? '',
    danantaraLogo: toImage(settings.danantara_logo_filepath),
    plnLogo: toImage(settings.pln_logo_filepath),
    address: settings.company_address,
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
  }
}

function toImage(filepath: string | null): SiteSettingsImage {
  return { url: filepath && getMediaAssetUrl(filepath), file: null }
}

function toFormData(values: SiteSettingsFormValues) {
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

  formData.append(
    'data',
    JSON.stringify({
      company_name: values.companyName,
      company_short_name: values.shortName,
      company_address: values.address,
      company_phone_number: values.phone,
      company_whatsapp_number: values.whatsapp,
      main_email: values.mainEmail,
      marketing_email: values.marketingEmail,
      operational_day: values.operatingDays,
      operational_start_time: values.openTime,
      operational_end_time: values.closeTime,
      social_medias: socialMedias,
    }),
  )
  if (values.danantaraLogo.file) {
    formData.append('danantara_logo', values.danantaraLogo.file)
  }
  if (values.plnLogo.file) formData.append('pln_logo', values.plnLogo.file)
  iconFiles.forEach((file) => formData.append('social_icons', file))

  return formData
}
