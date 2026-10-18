import { useI18n } from '../../i18n/i18nContext'
import { CodeIcon, ExternalIcon, FileIcon, LinkIcon, LockIcon, PlayCircleIcon } from './icons'

const TYPE_ICONS = { code: CodeIcon, demo: ExternalIcon, docs: FileIcon, video: PlayCircleIcon, other: LinkIcon }

/**
 * Links of a project in the admin's order (BRIEF §5): public links are buttons that open in a new
 * tab; private links are plain labels ("Konsol web · repo privat") without any address.
 * `links` comes from publicLinks(), so a private link has no url at all.
 */
function ProjectLinks({ links }) {
  const { t, code } = useI18n()
  if (!links?.length) return null
  const hasPrivate = links.some((link) => link.is_private)

  return (
    <>
      <ul className="pub-links">
        {links.map((link, index) => {
          const Icon = TYPE_ICONS[link.type] ?? LinkIcon
          if (link.is_private) {
            return (
              <li key={`${link.label}-${index}`} className="pub-link-private">
                <LockIcon size={18} />
                <span className="pub-link-private-label">{link.label}</span>
                <span className="pub-badge">{t(link.type === 'code' ? 'detail.repoPrivate' : 'detail.private')}</span>
              </li>
            )
          }
          return (
            <li key={`${link.label}-${index}`}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="pub-btn pub-btn--secondary pub-link-btn">
                <Icon size={18} />
                <span className="pub-link-label">{link.label}</span>
                <span className="pub-link-type">{code('link', link.type)}</span>
                <span className="pub-sr-only">{t('common.newTab')}</span>
              </a>
            </li>
          )
        })}
      </ul>
      {hasPrivate && <p className="pub-hint pub-links-note">{t('detail.privateNote')}</p>}
    </>
  )
}

export default ProjectLinks
