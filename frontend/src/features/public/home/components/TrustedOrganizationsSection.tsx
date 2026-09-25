import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHomeSectionScrub } from '@/features/public/home/hooks/useHomeSectionScrub'

import qouLogo from '@/assets/clients/al-quds-open-university.jpg'
import nablusMunicipalityLogo from '@/assets/clients/nablus-municipality.jpg'
import reformLogo from '@/assets/clients/reform.jpg'
import rwdsLogo from '@/assets/clients/rwds.jpg'
import palestinianBusinessForumLogo from '@/assets/clients/palestinian-business-forum.jpg'
import kotonLogo from '@/assets/clients/koton.png'
import dyarnaLogo from '@/assets/clients/dyarna.png'
import alQaserHotelLogo from '@/assets/clients/al-qaser-hotel.jpg'
import karawanStudioLogo from '@/assets/clients/karawan-studio.png'
import tajerLogo from '@/assets/clients/tajer.png'
import mohandamLogo from '@/assets/clients/mohandam.jpeg'

const ORGANIZATIONS = [
  {
    src: qouLogo,
    nameAr: 'جامعة القدس المفتوحة',
    nameEn: 'Al-Quds Open University',
    typeAr: 'جامعة عامة • تعليم مدمج',
    typeEn: 'Public University • Blended Learning',
  },
  {
    src: nablusMunicipalityLogo,
    nameAr: 'بلدية نابلس',
    nameEn: 'Nablus Municipality',
    typeAr: 'هيئة محلية • خدمات عامة',
    typeEn: 'Municipality • Public Services',
  },
  {
    src: reformLogo,
    nameAr: 'المؤسسة الفلسطينية للتمكين والتنمية المحلية - REFORM',
    nameEn: 'REFORM',
    typeAr: 'منظمة أهلية مستقلة غير ربحية',
    typeEn: 'Independent Nonprofit Organization',
  },
  {
    src: rwdsLogo,
    nameAr: 'جمعية تنمية المرأة الريفية',
    nameEn: "Rural Women's Development Society",
    typeAr: 'مؤسسة أهلية فلسطينية غير ربحية',
    typeEn: 'Palestinian Nonprofit Organization',
  },
  {
    src: palestinianBusinessForumLogo,
    nameAr: 'ملتقى رجال الأعمال الفلسطيني',
    nameEn: 'Palestinian Business Forum',
    typeAr: 'مؤسسة أهلية مستقلة غير ربحية',
    typeEn: 'Independent Nonprofit Organization',
  },
  {
    src: kotonLogo,
    nameAr: 'Koton',
    nameEn: 'Koton',
    typeAr: 'أزياء وتجزئة عالمية',
    typeEn: 'Global Fashion & Retail',
  },
  {
    src: dyarnaLogo,
    nameAr: 'شركة ديارنا للتطوير العقاري والاستثمار',
    nameEn: 'Dyarna',
    typeAr: 'تطوير عقاري • استثمار',
    typeEn: 'Real Estate • Investment',
  },
  {
    src: alQaserHotelLogo,
    nameAr: 'فندق القصر',
    nameEn: 'Al Qaser Hotel',
    typeAr: 'فندق • ضيافة',
    typeEn: 'Hotel • Hospitality',
  },
  {
    src: karawanStudioLogo,
    nameAr: 'ستوديو الكروان ديجيتال',
    nameEn: 'Karawan Studio',
    typeAr: 'تصوير • إنتاج رقمي',
    typeEn: 'Photography • Digital Production',
  },
  {
    src: tajerLogo,
    nameAr: 'Tajer',
    nameEn: 'Tajer',
    typeAr: 'شركة',
    typeEn: 'Company',
  },
  {
    src: mohandamLogo,
    nameAr: 'مهندم',
    nameEn: 'Mohandam',
    typeAr: 'أزياء رجالية',
    typeEn: "Men's Fashion",
  },
] as const

const FIRST_ROW = ORGANIZATIONS.slice(0, 6)
const SECOND_ROW = ORGANIZATIONS.slice(6)

type Organization = (typeof ORGANIZATIONS)[number]

function OrganizationCard({
  organization,
  isArabic,
}: {
  organization: Organization
  isArabic: boolean
}) {
  const name = isArabic
    ? organization.nameAr
    : organization.nameEn

  const type = isArabic
    ? organization.typeAr
    : organization.typeEn

  return (
    <article
      className="home-trusted__card"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="home-trusted__logo-frame">
        <img
          src={organization.src}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="home-trusted__card-copy">
        <strong>{name}</strong>
        <span>{type}</span>
      </div>
    </article>
  )
}

function MarqueeRow({
  organizations,
  reverse,
  isArabic,
}: {
  organizations: readonly Organization[]
  reverse?: boolean
  isArabic: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const dragRef = useRef<{
    pointerId: number
    startX: number
    startTime: number
    duration: number
    distance: number
    animation: Animation
  } | null>(null)

  const finishDrag = (
    element: HTMLDivElement,
    pointerId: number,
  ) => {
    const drag = dragRef.current

    if (!drag || drag.pointerId !== pointerId) {
      return
    }

    drag.animation.play()
    dragRef.current = null

    element.classList.remove(
      'home-trusted__marquee--dragging',
    )

    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId)
    }
  }

  return (
    <div
      className={
        reverse
          ? 'home-trusted__marquee home-trusted__marquee--reverse'
          : 'home-trusted__marquee'
      }
      onPointerDown={(event) => {
        if (
          event.pointerType === 'mouse' &&
          event.button !== 0
        ) {
          return
        }

        const track = trackRef.current

        if (!track) {
          return
        }

        const animation = track.getAnimations()[0]

        if (!animation) {
          return
        }

        const duration = Number(
          animation.effect?.getComputedTiming().duration ??
            0,
        )

        /*
         * The track contains two identical sets.
         * Half its width is therefore one complete
         * marquee cycle.
         */
        const distance = track.scrollWidth / 2

        if (duration <= 0 || distance <= 0) {
          return
        }

        const currentTime = Number(
          animation.currentTime ?? 0,
        )

        animation.pause()

        event.currentTarget.setPointerCapture(
          event.pointerId,
        )

        event.currentTarget.classList.add(
          'home-trusted__marquee--dragging',
        )

        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startTime: currentTime,
          duration,
          distance,
          animation,
        }
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current

        if (
          !drag ||
          drag.pointerId !== event.pointerId
        ) {
          return
        }

        const deltaX =
          event.clientX - drag.startX

        const deltaTime =
          (deltaX / drag.distance) *
          drag.duration

        /*
         * Normal row:
         *   animation moves left as time increases,
         *   so dragging right must move time backwards.
         *
         * Reverse row:
         *   animation already runs in reverse,
         *   so the relationship is inverted.
         */
        const nextTime =
          drag.startTime +
          (reverse ? deltaTime : -deltaTime)

        drag.animation.currentTime =
          ((nextTime % drag.duration) +
            drag.duration) %
          drag.duration

        if (event.cancelable) {
          event.preventDefault()
        }
      }}
      onPointerUp={(event) => {
        finishDrag(
          event.currentTarget,
          event.pointerId,
        )
      }}
      onPointerCancel={(event) => {
        finishDrag(
          event.currentTarget,
          event.pointerId,
        )
      }}
    >
      <div
        ref={trackRef}
        className="home-trusted__track"
      >
        <div className="home-trusted__marquee-set">
          {organizations.map((organization) => (
            <OrganizationCard
              key={organization.nameEn}
              organization={organization}
              isArabic={isArabic}
            />
          ))}
        </div>

        <div
          className="home-trusted__marquee-set"
          aria-hidden="true"
        >
          {organizations.map((organization) => (
            <OrganizationCard
              key={`duplicate-${organization.nameEn}`}
              organization={organization}
              isArabic={isArabic}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TrustedOrganizationsSection() {
  const { t, i18n } = useTranslation('home')
  const sectionRef = useRef<HTMLElement>(null)

  const isArabic =
    i18n.resolvedLanguage?.startsWith('ar') ?? false

  useHomeSectionScrub(sectionRef, {
    header: '.home-section__header',
    items: '.home-trusted__stage',
  })

  return (
    <section
      ref={sectionRef}
      id="trusted"
      className="home-section home-trusted"
      aria-labelledby="home-trusted-title"
    >
      <div className="home-container">
        <div className="home-trusted__intro">
          <header className="home-section__header">
            <div className="home-section__header-copy">
              <p className="home-eyebrow">
                {t('trustedEyebrow')}
              </p>

              <h2 id="home-trusted-title">
                {t('trustedTitle')}
              </h2>

              <p>{t('trustedLead')}</p>
            </div>
          </header>

          <div
            className="home-trusted__stat"
            aria-label={`${ORGANIZATIONS.length} ${t('trustedStatLabel')}`}
          >
            <span className="home-trusted__stat-number">
              {String(ORGANIZATIONS.length).padStart(2, '0')}
            </span>

            <span className="home-trusted__stat-label">
              {t('trustedStatLabel')}
            </span>
          </div>
        </div>

        <div className="home-trusted__stage">
          <div
            className="home-trusted__orb home-trusted__orb--one"
            aria-hidden="true"
          />
          <div
            className="home-trusted__orb home-trusted__orb--two"
            aria-hidden="true"
          />

          <div
            className="home-trusted__watermark"
            aria-hidden="true"
          >
            PR
          </div>

          <MarqueeRow
            organizations={FIRST_ROW}
            isArabic={isArabic}
          />

          <MarqueeRow
            organizations={SECOND_ROW}
            reverse
            isArabic={isArabic}
          />

          <div className="home-trusted__stage-footer">
            <span />
            <p>{t('trustedStageLabel')}</p>
            <span />
          </div>
        </div>
      </div>
    </section>
  )
}
