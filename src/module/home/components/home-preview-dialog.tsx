import type { HomeDraft } from '@/module/home/types/home.types'
import { DEFAULT_LANGUAGE_ID } from '@/module/language/constants/language.constants'
import { getMediaAssetUrl } from '@/module/media/api/media.api'
import { PreviewEmpty } from '@/shared/components/preview-empty'
import { Button } from '@/shared/components/ui/button'
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
import { cn } from '@/shared/lib/utils'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface HomePreviewDialogProps {
  onOpenChange: (open: boolean) => void
  draft: HomeDraft
  languageId: string
}

// Mirrors the landing home hero + "Sekilas EMI" section (emi-compro `home-hero.tsx`, `about-us-section.tsx`).
function HomePreviewDialog({
  onOpenChange,
  draft,
  languageId,
}: HomePreviewDialogProps) {
  const { t } = useI18n()
  const copy = getLandingCopy(languageId)
  // Same filters as the landing page: incomplete items are not shown.
  const slides = draft.slides.filter(
    (slide) =>
      slide.title1.trim() && slide.title2.trim() && slide.subtitle.trim(),
  )
  const statistics = draft.statistics.filter(
    (statistic) =>
      statistic.label.trim() &&
      statistic.number.trim() &&
      statistic.description.trim(),
  )
  const hasTeaser = Boolean(
    draft.teaserTitle.trim() &&
    draft.ctaTitle.trim() &&
    draft.teaserContent.trim(),
  )
  const numberFormatter = new Intl.NumberFormat(
    languageId === DEFAULT_LANGUAGE_ID ? 'id-ID' : 'en-US',
  )

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t.home.preview}</DialogTitle>
          <DialogDescription>{t.home.previewDescription}</DialogDescription>
        </DialogHeader>
        <div
          style={landingThemeStyle}
          className="text-foreground flex min-h-0 flex-col gap-14 overflow-y-auto px-5 pb-8"
        >
          {slides.length > 0 ? (
            <PreviewHero slides={slides} languageId={languageId} />
          ) : (
            <PreviewEmpty />
          )}

          <section className="flex flex-col gap-14">
            {hasTeaser ? (
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                <div className="shrink-0 lg:basis-1/3">
                  <p className="text-secondary text-xs font-bold tracking-[0.18em] uppercase">
                    {copy.aboutEyebrow}
                  </p>
                  <h2 className="text-accent mt-3 text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
                    {draft.teaserTitle}
                  </h2>
                </div>
                <p className="text-secondary min-w-0 text-sm leading-7 lg:flex-1">
                  {draft.teaserContent}
                </p>
                <span className="border-accent text-accent flex h-10 w-fit shrink-0 items-center gap-2 rounded-full border px-5 text-xs font-semibold">
                  {draft.ctaTitle}
                  <ArrowRightIcon aria-hidden="true" className="size-3.5" />
                </span>
              </div>
            ) : (
              <PreviewEmpty />
            )}

            <ul className="flex flex-wrap gap-2">
              {copy.badges.map((badge) => (
                <li
                  key={badge.label}
                  className="bg-primary text-accent flex min-h-10 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold lg:px-5 lg:text-sm"
                >
                  <span aria-hidden="true">{badge.emoji}</span>
                  {badge.label}
                </li>
              ))}
            </ul>

            <div className="border-foreground/20 border-t pt-16 lg:pt-24">
              {statistics.length > 0 ? (
                <ul className="flex flex-col gap-14 lg:flex-row lg:gap-16">
                  {statistics.map((statistic) => (
                    <li
                      key={statistic.clientKey}
                      className="lg:min-w-0 lg:flex-1"
                    >
                      <p className="text-secondary text-xs font-bold tracking-widest uppercase lg:text-sm">
                        {statistic.label}
                      </p>
                      <p className="text-accent mt-6 text-5xl leading-none font-bold tracking-tight lg:text-7xl">
                        {/^\d+$/.test(statistic.number)
                          ? numberFormatter.format(Number(statistic.number))
                          : statistic.number}
                      </p>
                      <p className="text-foreground/70 mt-5 max-w-xl text-sm leading-6 lg:leading-8">
                        {statistic.description}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <PreviewEmpty />
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PreviewHero({
  slides,
  languageId,
}: {
  slides: HomeDraft['slides']
  languageId: string
}) {
  const { t } = useI18n()
  const copy = getLandingCopy(languageId)
  const [activeIndex, setActiveIndex] = useState(0)
  const slide = slides[activeIndex]

  function showSlide(index: number) {
    setActiveIndex((index + slides.length) % slides.length)
  }

  return (
    <section className="bg-accent relative isolate flex min-h-128 overflow-hidden rounded-2xl">
      {slide.mediaFilepath && (
        <img
          src={getMediaAssetUrl(slide.mediaFilepath)}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="via-foreground/50 to-accent/20 absolute inset-0 bg-linear-to-r from-(color:--accent-2)/80"
      />
      <div
        aria-hidden="true"
        className="from-accent/35 absolute inset-x-0 top-0 h-36 bg-linear-to-b to-transparent"
      />
      <div className="relative flex flex-1 flex-col justify-center gap-8 p-6 pb-28 lg:p-12 lg:pb-28">
        <span className="border-background/20 bg-background/10 text-primary flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[0.68rem] font-bold tracking-[0.18em] uppercase backdrop-blur-md">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-(--accent-2)"
          />
          {copy.heroBadge}
        </span>
        <div className="flex max-w-4xl flex-col gap-6">
          <h1 className="font-(family-name:--font-display) text-6xl leading-none text-balance lg:text-7xl">
            <span className="text-background block">{slide.title1}</span>
            <span className="from-secondary via-primary to-background block bg-linear-to-r bg-clip-text pb-2 text-transparent italic">
              {slide.title2}
            </span>
          </h1>
          <p className="text-primary/80 max-w-2xl text-sm leading-8 lg:text-lg">
            {slide.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="bg-primary text-accent flex h-12 items-center gap-2 rounded-full px-6 text-sm font-bold">
            {copy.exploreServices}
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </span>
          <span className="border-background/70 bg-background/5 text-background flex h-12 items-center rounded-full border px-6 text-sm font-bold">
            {copy.learnMore}
          </span>
        </div>
      </div>
      {/* Landing `hero-indicators.tsx`: dots left, looping arrows right. */}
      <div className="absolute inset-x-6 bottom-6 flex items-center justify-between gap-4 lg:inset-x-12 lg:bottom-8">
        <div className="flex items-center gap-2">
          {slides.map((item, index) => (
            <button
              key={item.clientKey}
              type="button"
              aria-current={index === activeIndex || undefined}
              aria-label={t.home.previewShowSlide(index + 1)}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'h-2.5 rounded-full transition-all',
                index === activeIndex
                  ? 'bg-primary w-8'
                  : 'bg-background/55 hover:bg-background w-2.5',
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <HeroArrowButton
            label={t.home.previewPreviousSlide}
            onClick={() => showSlide(activeIndex - 1)}
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
          </HeroArrowButton>
          <HeroArrowButton
            label={t.home.previewNextSlide}
            onClick={() => showSlide(activeIndex + 1)}
          >
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </HeroArrowButton>
        </div>
      </div>
    </section>
  )
}

function HeroArrowButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      onClick={onClick}
      className="border-background/60 bg-background/10 text-background hover:bg-background/20 hover:text-background size-12 rounded-xl"
    >
      {children}
    </Button>
  )
}

export { HomePreviewDialog }
