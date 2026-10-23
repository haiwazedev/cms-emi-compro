import type { AboutUsDraft } from '@/module/about-us/types/about-us.types'
import { ArticleRichTextEditor } from '@/module/article/components/article-rich-text-editor'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import { PreviewEmpty } from '@/shared/components/preview-empty'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { getLandingCopy } from '@/shared/lib/landing-copy'
import { landingThemeStyle } from '@/shared/lib/landing-theme'
import { ArrowRightIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface AboutUsPreviewDialogProps {
  onOpenChange: (open: boolean) => void
  draft: AboutUsDraft
  languageId: string
}

// Mirrors the landing About Us page (emi-compro `about-page-content.tsx`); management lives in Anggota Direksi.
function AboutUsPreviewDialog({
  onOpenChange,
  draft,
  languageId,
}: AboutUsPreviewDialogProps) {
  const { t } = useI18n()
  const copy = getLandingCopy(languageId)
  // Same filters as the landing page: incomplete items are not shown.
  const missions = draft.missions.filter(
    (mission) => mission.title.trim() && mission.description.trim(),
  )
  const timeline = draft.timeline.filter(
    (entry) =>
      entry.period.trim() && entry.title.trim() && entry.description.trim(),
  )
  const vision = draft.vision.trim()

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t.aboutUs.preview}</DialogTitle>
          <DialogDescription>{t.aboutUs.previewDescription}</DialogDescription>
        </DialogHeader>
        <div
          style={landingThemeStyle}
          className="text-foreground flex min-h-0 flex-col gap-14 overflow-y-auto px-5 pb-8"
        >
          <section className="to-accent text-background flex flex-col gap-5 rounded-2xl bg-linear-to-r from-(color:--accent-2) via-(color:--accent-2)/90 p-6 lg:p-12">
            <p className="text-primary/70 text-xs lg:text-sm">
              {copy.aboutBreadcrumb}
            </p>
            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
              {copy.aboutTitle}{' '}
              <span className="text-sky-deep">{copy.aboutTitleAccent}</span>
            </h1>
            <p className="text-primary/80 max-w-3xl text-sm leading-7 lg:text-base lg:leading-8">
              {copy.aboutDescription}
            </p>
          </section>

          <section className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-16">
            <div className="min-w-0 flex-1">
              <SectionHeading eyebrow={copy.profileEyebrow}>
                {copy.profileTitle}
              </SectionHeading>
              <div className="mt-6">
                {draft.profileContent.trim() ? (
                  <ArticleRichTextEditor
                    content={draft.profileContent}
                    readOnly
                    // Landing company profile typography, not the article one.
                    className="text-sm leading-7 [&_p]:mb-0 [&_p+p]:mt-5"
                  />
                ) : (
                  <PreviewEmpty />
                )}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="bg-secondary/25 text-accent flex h-9 items-center gap-2 rounded-full px-4 text-xs font-bold">
                  {copy.ourServices}
                  <ArrowRightIcon aria-hidden="true" className="size-3.5" />
                </span>
                <span className="border-accent/40 text-accent flex h-9 items-center rounded-full border px-4 text-xs font-bold">
                  {copy.ourCommitment}
                </span>
              </div>
            </div>

            <div className="from-secondary via-accent to-foreground shadow-foreground/15 relative aspect-video w-full min-w-0 flex-1 overflow-hidden rounded-xl bg-linear-to-br shadow-xl">
              {draft.companyPictureFilepath ? (
                <img
                  src={getMediaAssetUrl(draft.companyPictureFilepath)}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center px-4">
                  <p className="text-primary/80 w-full text-center text-sm">
                    {t.aboutUs.noPhoto}
                  </p>
                </div>
              )}
              <div
                aria-hidden="true"
                className="from-background/10 to-foreground/25 absolute inset-0 bg-linear-to-br via-transparent"
              />
              <div className="bg-background text-accent shadow-foreground/20 absolute inset-x-6 bottom-6 rounded-lg px-4 py-3 shadow-lg lg:inset-x-8 lg:bottom-8 lg:max-w-xs">
                <p className="text-secondary text-[0.55rem] font-bold tracking-[0.16em] uppercase">
                  {copy.partOf}
                </p>
                <p className="mt-1 text-xs font-bold lg:text-sm">
                  {copy.partOfValue}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-primary flex flex-col gap-10 rounded-2xl p-6 lg:gap-12 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="shrink-0 lg:basis-1/3">
                <SectionHeading eyebrow={copy.historyEyebrow}>
                  {copy.historyTitle}
                </SectionHeading>
              </div>
              <p className="text-foreground/70 min-w-0 text-sm leading-7 lg:flex-1">
                {copy.historyDescription}
              </p>
            </div>
            {timeline.length > 0 ? (
              <ol className="flex max-w-4xl flex-col gap-1">
                {timeline.map((entry, index) => (
                  <li key={entry.clientKey} className="flex gap-4 lg:gap-5">
                    <div className="relative flex w-4 shrink-0 justify-center">
                      <span className="border-secondary bg-primary relative z-10 mt-1.5 size-6 shrink-0 rounded-full border-4" />
                      {index < timeline.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="bg-secondary/20 absolute top-4 bottom-0 left-1/2 w-px -translate-x-1/2"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-9 lg:pb-10">
                      <p className="text-accent text-lg leading-none font-bold lg:text-xl">
                        {entry.period}
                      </p>
                      <h3 className="text-accent mt-3 text-sm leading-6 font-bold lg:text-base">
                        {entry.title}
                      </h3>
                      <p className="text-foreground/65 mt-1 text-xs leading-6 lg:text-sm">
                        {entry.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <PreviewEmpty />
            )}
          </section>

          <section className="flex flex-col gap-9">
            <SectionHeading eyebrow={copy.directionEyebrow}>
              {copy.vision}{' '}
              <span className="text-secondary">&amp; {copy.mission}</span>
            </SectionHeading>
            {vision || missions.length > 0 ? (
              <div className="flex flex-col gap-4 lg:flex-row">
                <article className="bg-accent text-background flex min-w-0 flex-1 flex-col gap-5 rounded-xl p-6 lg:p-8">
                  <h3 className="text-lg font-bold lg:text-xl">
                    {copy.vision}
                  </h3>
                  {vision ? (
                    <p className="text-primary/75 text-sm leading-7">
                      {vision}
                    </p>
                  ) : (
                    <PreviewEmpty />
                  )}
                </article>
                <article className="text-background flex min-w-0 flex-1 flex-col gap-5 rounded-xl bg-(--accent-2) p-6 lg:p-8">
                  <h3 className="text-lg font-bold lg:text-xl">
                    {copy.mission}
                  </h3>
                  {missions.length > 0 ? (
                    <ol className="text-primary/80 list-decimal space-y-3 pl-5 text-sm leading-7">
                      {missions.map((mission) => (
                        <li key={mission.clientKey}>
                          <span className="font-semibold">{mission.title}</span>{' '}
                          {mission.description}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <PreviewEmpty />
                  )}
                </article>
              </div>
            ) : (
              <PreviewEmpty />
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow: string
  children: ReactNode
}) {
  return (
    <>
      <p className="text-secondary text-xs font-bold tracking-[0.18em] uppercase">
        {eyebrow}
      </p>
      <h2 className="text-accent mt-3 text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
        {children}
      </h2>
    </>
  )
}

export { AboutUsPreviewDialog }
