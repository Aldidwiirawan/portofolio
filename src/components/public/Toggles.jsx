import { useI18n } from '../../i18n/i18nContext'
import { MoonIcon, SoundOffIcon, SoundOnIcon, SunIcon } from './icons'
import { useTheme } from './publicContexts'
import { useSound } from './sound/soundContext'

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

/** Sound switch (icon button, off by default). Like the theme switch, its name says what it does next. */
export function SoundToggle({ className = '' }) {
  const { enabled, toggle } = useSound()
  const { t } = useI18n()
  const label = t(enabled ? 'sound.off' : 'sound.on')
  return (
    <button type="button" className={`pub-icon-btn ${className}`.trim()} onClick={toggle} aria-label={label} title={label}>
      {enabled ? <SoundOnIcon size={20} /> : <SoundOffIcon size={20} />}
    </button>
  )
}

const LANGUAGES = [
  { code: 'id', name: 'lang.idName' },
  { code: 'en', name: 'lang.enName' },
]

/**
 * ID / EN language choice: two buttons in a pill, the active one pressed (aria-pressed). Each spoken
 * name starts with the letters on the button ("ID, Bahasa Indonesia"), so voice control users can say
 * what they see (WCAG 2.5.3).
 */
export function LangToggle({ className = '' }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div className={`pub-lang ${className}`.trim()} role="group" aria-label={t('lang.label')}>
      {LANGUAGES.map((option) => (
        <button
          key={option.code}
          type="button"
          className="pub-lang-option"
          lang={option.code}
          aria-pressed={lang === option.code}
          aria-label={t(option.name)}
          onClick={() => setLang(option.code)}
        >
          {option.code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
