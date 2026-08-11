import { HeroSection } from '@/features/public/home/components/HeroSection'
import { LogoDrawSection } from '@/features/public/home/components/LogoDrawSection'
import { AboutUsSection } from '@/features/public/home/components/AboutUsSection'
import { ExpertiseSection } from '@/features/public/home/components/ExpertiseSection'
import { ApproachSection } from '@/features/public/home/components/ApproachSection'
import { TrustedOrganizationsSection } from '@/features/public/home/components/TrustedOrganizationsSection'
import { FounderSection } from '@/features/public/home/components/FounderSection'
import { WhyPrPerHourSection } from '@/features/public/home/components/WhyPrPerHourSection'
import { FinalCtaSection } from '@/features/public/home/components/FinalCtaSection'
import { ContactSection } from '@/features/public/home/components/ContactSection'
import { useHomeHashScroll } from '@/features/public/home/hooks/useHomeHashScroll'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { useTranslation } from 'react-i18next'
import '@/features/public/home/styles/home.css'
import '@/features/public/home/styles/home-scroll-story.css'
import '@/features/public/home/styles/home-sections.css'

/**
 * Public homepage — scroll narrative (Phase 4B sections below Hero):
 * Hero → Logo draw (signature pin/scrub) → About → Expertise → Approach →
 * Trusted → Founder (mark replay) → Why → Final CTA → Contact preview
 */
export function HomePage() {
  const { t } = useTranslation('home')
  useHomeHashScroll()

  useDocumentMeta({
    title: t('metaTitle'),
    description: t('metaDescription'),
    canonicalPath: '/',
    robots: 'index, follow',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'PR Per Hour',
        alternateName: [
          'PRPerHour',
          'PR PerHour',
          'PRPERHOUR',
          'prperhour',
          'prperhour.com',
          'بي آر بير أور',
          'بي ار بير اور',
        ],
        url: 'https://prperhour.com/',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'PR Per Hour',
        alternateName: [
          'PRPerHour',
          'PRPERHOUR',
          'prperhour',
          'بي آر بير أور',
          'بي ار بير اور',
        ],
        url: 'https://prperhour.com/',
      },
    ],
    syncThemeColor: true,
  })

  return (
    <div className="home-page">
      <HeroSection />
      <LogoDrawSection />
      <AboutUsSection />
      <ExpertiseSection />
      <ApproachSection />
      <TrustedOrganizationsSection />
      <FounderSection />
      <WhyPrPerHourSection />
      <FinalCtaSection />
      <ContactSection />
    </div>
  )
}
