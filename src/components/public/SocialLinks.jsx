import { useI18n } from '../../i18n/i18nContext'
import { GithubIcon, InstagramIcon, LinkedinIcon, MailIcon } from './icons'

const NETWORKS = [
  { key: 'linkedin', label: 'social.linkedin', Icon: LinkedinIcon },
  { key: 'github', label: 'social.github', Icon: GithubIcon },
  { key: 'instagram', label: 'social.instagram', Icon: InstagramIcon },
  { key: 'email', label: 'social.email', Icon: MailIcon },
]

/**
 * Icon links to the profile's networks (only those filled in). `only` limits and orders them, e.g.
 * ['linkedin', 'github']. Web links open in a new tab; email opens the mail app.
 */
function SocialLinks({ social, only, className = '', label }) {
  const { t } = useI18n()
  if (!social) return null
  const list = (only ? only.map((key) => NETWORKS.find((n) => n.key === key)) : NETWORKS).filter(
    (network) => network && social[network.key]
  )
  if (list.length === 0) return null

  return (
    <ul className={`pub-social ${className}`.trim()} aria-label={label}>
      {list.map(({ key, label: labelKey, Icon }) => {
        const isEmail = key === 'email'
        return (
          <li key={key}>
            <a
              href={isEmail ? `mailto:${social.email}` : social[key]}
              className="pub-icon-btn pub-social-link"
              {...(isEmail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              aria-label={isEmail ? `${t(labelKey)}: ${social.email}` : `${t(labelKey)} ${t('common.newTab')}`}
              title={isEmail ? social.email : t(labelKey)}
            >
              <Icon size={18} />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default SocialLinks
