import { useI18n } from '../../i18n/i18nContext'
import { MoonIcon, SunIcon } from './icons'
import { useTheme } from './publicContexts'

/** Light/dark switch (icon button). Its name says what it does next. */
export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const label = t(theme === 'dark' ? 'theme.toLight' : 'theme.toDark')
  return (
    <button type="button" className={`pub-icon-btn ${className}`.trim()} onClick={toggleTheme} aria-label={label} title={label}>
      {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
    </button>
  )
}

/** One-click ID / US language switch; the active language is highlighted. */
export function LangToggle({ className = '' }) {
  const { lang, setLang, t } = useI18n()
  const label = t('lang.switch')
  return (
    <button
      type="button"
      className={`pub-lang ${className}`.trim()}
      onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
      aria-label={label}
      title={label}
    >
      <span className="pub-lang-option" data-active={lang === 'id'} aria-hidden="true">
        ID
      </span>
      <span className="pub-lang-option" data-active={lang === 'en'} aria-hidden="true">
        US
      </span>
    </button>
  )
}
