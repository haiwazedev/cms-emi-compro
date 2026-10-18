export interface AboutUsMissionDraft {
  clientKey: string
  title: string
  description: string
}

export interface AboutUsTimelineDraft {
  clientKey: string
  period: string
  description: string
}

export interface AboutUsDraft {
  profileContent: string
  companyPictureFilepath: string | null
  vision: string
  missions: AboutUsMissionDraft[]
  timeline: AboutUsTimelineDraft[]
}
