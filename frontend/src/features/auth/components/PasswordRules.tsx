import { useTranslation } from 'react-i18next'

export interface PasswordRulesProps {
  password: string
}

interface Rule {
  key: string
  met: boolean
}

function evaluateRules(password: string): Rule[] {
  return [
    { key: 'passwordRuleLength', met: password.length >= 10 },
    { key: 'passwordRuleUpper', met: /[A-Z]/.test(password) },
    { key: 'passwordRuleLower', met: /[a-z]/.test(password) },
    { key: 'passwordRuleNumber', met: /\d/.test(password) },
  ]
}

/** Visual password policy checklist (same rules as registration). */
export function PasswordRules({ password }: PasswordRulesProps) {
  const { t } = useTranslation('auth')
  const rules = evaluateRules(password)

  return (
    <ul className="password-rules" aria-label={t('passwordRulesLabel')}>
      {rules.map((rule) => (
        <li
          key={rule.key}
          className={
            rule.met ? 'password-rules__item password-rules__item--met' : 'password-rules__item'
          }
        >
          <span aria-hidden="true">{rule.met ? '✓' : '○'}</span>
          <span>{t(rule.key)}</span>
        </li>
      ))}
    </ul>
  )
}
