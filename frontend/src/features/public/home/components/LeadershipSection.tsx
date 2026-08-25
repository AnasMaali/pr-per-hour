import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandMarkDraw } from '@/shared/components/BrandMarkDraw'
import {
  buildBrandMarkDrawTimeline,
  prepareBrandMarkDraw,
  syncBrandMarkSettleUnmask,
} from '@/shared/components/brandMarkDrawTimeline'
import { useHomeGsap } from '@/features/public/home/hooks/useHomeGsap'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'

const LEADERS = [
  {
    id: 'founder',
    nameKey: 'founderName',
    roleKey: 'founderTitle',
    bioKey: 'founderBio',
    pointKeys: [
      'founderPoint1',
      'founderPoint2',
      'founderPoint3',
      'founderPoint4',
    ],
  },
  {
    id: 'technology',
    nameKey: 'technologyLeaderName',
    roleKey: 'technologyLeaderRole',
    bioKey: 'technologyLeaderBio',
    pointKeys: [
      'technologyLeaderPoint1',
      'technologyLeaderPoint2',
      'technologyLeaderPoint3',
      'technologyLeaderPoint4',
    ],
  },
] as const

export function LeadershipSection() {
  const { t } = useTranslation('home')
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const markRef = useRef<SVGSVGElement>(null)

  useHomeGsap(sectionRef, (gsapApi) => {
    const section = sectionRef.current
    const svg = markRef.current

    if (!section || !svg) return

    const { fillLayer, maskUrl } = prepareBrandMarkDraw(gsapApi, svg)

    const visual = section.querySelector<HTMLElement>(
      '.home-leadership__visual',
    )

    const profiles = section.querySelectorAll(
      '.home-leadership__profile',
    )

    const points = section.querySelectorAll(
      '.home-leadership__points li',
    )

    if (visual) {
      gsapApi.set(visual, {
        opacity: 0,
        y: 24,
        scale: 0.98,
      })
    }

    if (profiles.length) {
      gsapApi.set(profiles, {
        opacity: 0,
        y: 28,
      })
    }

    if (points.length) {
      gsapApi.set(points, {
        opacity: 0,
        y: 24,
      })
    }

    const timeline = gsapApi.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        end: 'top 22%',
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) =>
          syncBrandMarkSettleUnmask(
            fillLayer,
            maskUrl,
            self.progress,
          ),
      },
    })

    if (visual) {
      timeline.to(
        visual,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: 'none',
        },
        0,
      )
    }

    timeline.add(
      buildBrandMarkDrawTimeline(gsapApi, svg),
      0.04,
    )

    if (profiles.length) {
      timeline.to(
        profiles,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'none',
        },
        0.18,
      )
    }

    if (points.length) {
      timeline.to(
        points,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: 'none',
        },
        0.32,
      )
    }
  })

  return (
    <section
      ref={sectionRef}
      id="leadership"
      className="home-section home-leadership"
      aria-labelledby="home-leadership-title"
    >
      <div className="home-container">
        <header className="home-leadership__header">
          <p className="home-eyebrow">
            {t('leadershipEyebrow')}
          </p>

          <h2 id="home-leadership-title">
            {t('leadershipTitle')}
          </h2>

          <p>{t('leadershipLead')}</p>
        </header>

        <div className="home-leadership__layout">
          <figure
            className="home-leadership__visual"
            aria-hidden="true"
          >
            <BrandMarkDraw
              ref={markRef}
              className="home-leadership__mark"
              complete={reduced}
            />
          </figure>

          <div className="home-leadership__profiles">
            {LEADERS.map((leader, index) => (
              <article
                key={leader.id}
                className="home-leadership__profile"
              >
                <div className="home-leadership__profile-index">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="home-leadership__profile-copy">
                  <h3>{t(leader.nameKey)}</h3>

                  <p className="home-leadership__role">
                    {t(leader.roleKey)}
                  </p>

                  <p className="home-leadership__bio">
                    {t(leader.bioKey)}
                  </p>

                  <ul className="home-leadership__points">
                    {leader.pointKeys.map((key) => (
                      <li key={key}>
                        <span
                          className="home-leadership__credential-mark"
                          aria-hidden="true"
                        />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}

            <Link
              className="btn btn--lift home-leadership__cta"
              to="/contact"
            >
              {t('founderCta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
