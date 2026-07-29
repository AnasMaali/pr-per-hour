import { useTranslation } from 'react-i18next'

export function AuthBenefitsPanel() {
  const { t } = useTranslation('auth')

  return (
    <aside className="auth-benefits" aria-labelledby="auth-benefits-title">
      <p className="auth-benefits__eyebrow">{t('benefitsEyebrow')}</p>
      <h2 id="auth-benefits-title" className="auth-benefits__title">
        {t('benefitsTitle')}
      </h2>
      <p className="auth-benefits__lead">{t('benefitsLead')}</p>
      <ul className="auth-benefits__list">
        <li>{t('benefitsItem1')}</li>
        <li>{t('benefitsItem2')}</li>
        <li>{t('benefitsItem3')}</li>
      </ul>
    </aside>
  )
}
