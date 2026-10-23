import Logo from '../../brand/Logo'
import { useI18n } from '../../../i18n/i18nContext'
import ProjectImage from '../ProjectImage'

/**
 * Cover of a project in a fixed frame (16:9 on phones, 16:10 wider; no layout shift while it loads).
 * A landscape image fills it, a portrait one (phone screenshot) shows whole (ProjectImage). Without
 * a cover image a blueprint placeholder shows the logo and the project type. Decorative: the title
 * sits next to it.
 */
function ProjectCover({ project, className = '', eager = false }) {
  const { code } = useI18n()
  const caption = [code('type', project.project_type), project.year].filter(Boolean).join(' · ')

  if (project.thumbnail_url) {
    return (
      <ProjectImage
        className={`pub-cover ${className}`}
        src={project.thumbnail_url}
        width="800"
        height="500"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    )
  }

  return (
    <div className={`pub-cover ${className}`.trim()}>
      <div className="pub-cover-placeholder" aria-hidden="true">
        <Logo size={64} />
        {caption && <span className="pub-cover-caption">{caption}</span>}
      </div>
    </div>
  )
}

export default ProjectCover
