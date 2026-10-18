import Logo from '../../brand/Logo'
import { useI18n } from '../../../i18n/i18nContext'

/**
 * Cover of a project in a fixed 16:10 frame (no layout shift while it loads). Without a cover image
 * a blueprint placeholder shows the logo and the project type. Decorative: the title sits next to it.
 */
function ProjectCover({ project, className = '', eager = false }) {
  const { code } = useI18n()
  const caption = [code('type', project.project_type), project.year].filter(Boolean).join(' · ')

  return (
    <div className={`pub-cover ${className}`.trim()}>
      {project.thumbnail_url ? (
        <img
          src={project.thumbnail_url}
          alt=""
          width="800"
          height="500"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <div className="pub-cover-placeholder" aria-hidden="true">
          <Logo size={64} />
          {caption && <span className="pub-cover-caption">{caption}</span>}
        </div>
      )}
    </div>
  )
}

export default ProjectCover
