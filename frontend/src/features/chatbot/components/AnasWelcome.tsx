import { useTranslation } from 'react-i18next'
import { usePublicCategoriesQuery } from '@/features/services/queries/usePublicCategoriesQuery'
import { AnasHourglass } from '@/features/chatbot/components/AnasHourglass'
import {
  AnasQuickActions,
  type QuickActionItem,
} from '@/features/chatbot/components/AnasQuickActions'

export interface AnasWelcomeProps {
  disabled: boolean
  reducedMotion: boolean
  onQuickAction: (prompt: string) => void
}

const MAX_CATEGORY_SUGGESTIONS = 3

/**
 * First-open experience: a designed greeting instead of an empty chat box,
 * with suggestions built from the *live* active service catalog so they
 * never drift from what Admin actually publishes.
 */
export function AnasWelcome({
  disabled,
  reducedMotion,
  onQuickAction,
}: AnasWelcomeProps) {
  const { t } = useTranslation('chatbot')
  const categoriesQuery = usePublicCategoriesQuery()

  const categoryItems: QuickActionItem[] = (categoriesQuery.data ?? [])
    .slice(0, MAX_CATEGORY_SUGGESTIONS)
    .map((category) => ({
      key: `category-${category.id}`,
      label: category.name,
      prompt: t('quickActionCategoryPrompt', { category: category.name }),
    }))

  const items: QuickActionItem[] = [
    {
      key: 'find-service',
      label: t('quickActionFindService'),
      prompt: t('quickActionFindServicePrompt'),
    },
    ...categoryItems,
    {
      key: 'contact',
      label: t('quickActionContact'),
      prompt: t('quickActionContactPrompt'),
    },
  ]

  return (
    <div className="anas-welcome">
      <AnasHourglass
        size={52}
        state="idle"
        reducedMotion={reducedMotion}
        className="anas-welcome__mark"
      />

      <h2 className="anas-welcome__title">{t('welcomeTitle')}</h2>
      <p className="anas-welcome__body">{t('welcomeBody')}</p>

      <AnasQuickActions
        items={items}
        disabled={disabled}
        onSelect={onQuickAction}
      />

      <p className="anas-welcome__disclaimer">{t('welcomeDisclaimer')}</p>
    </div>
  )
}
