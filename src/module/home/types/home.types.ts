export interface HomeSlideDraft {
  clientKey: string
  title1: string
  title2: string
  subtitle: string
  mediaFilepath: string | null
}

export interface HomeStatisticDraft {
  clientKey: string
  label: string
  number: string
  description: string
}

export interface HomeDraft {
  slides: HomeSlideDraft[]
  statistics: HomeStatisticDraft[]
  teaserTitle: string
  ctaTitle: string
  teaserContent: string
}
