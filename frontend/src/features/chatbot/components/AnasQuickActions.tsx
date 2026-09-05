import { useTranslation } from 'react-i18next'

export interface QuickActionItem {
  key: string
  label: string
  prompt: string
}

export interface AnasQuickActionsProps {
  items: QuickActionItem[]
  disabled: boolean
  onSelect: (prompt: string) => void
}

/**
 * Message suggestions — clicking one sends it through the real chatbot API
 * exactly like typing it in, never a canned client-side reply.
 */
export function AnasQuickActions({
  items,
  disabled,
  onSelect,
}: AnasQuickActionsProps) {
  const { t } = useTranslation('chatbot')

  if (items.length === 0) return null

  return (
    <div className="anas-quick-actions" role="group" aria-label={t('quickActionsLabel')}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="anas-quick-actions__item"
          disabled={disabled}
          onClick={() => onSelect(item.prompt)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
