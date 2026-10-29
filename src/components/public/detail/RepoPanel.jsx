import { useEffect, useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { AlertIcon, ExternalIcon, GithubIcon } from '../icons'
import { publicRepoLink } from './repoLink'
import './RepoPanel.css'

const SHADES = 5 // the language bar: four grey levels from the ink, then a hatched "the rest"

/** The panel data from the Vercel function, or null (missing, failed, not JSON: local dev). */
async function loadRepo(slug, signal) {
  const response = await fetch(`/api/github-repo?slug=${encodeURIComponent(slug)}`, { headers: { Accept: 'application/json' }, signal })
  if (!response.ok || !/json/i.test(response.headers.get('content-type') || '')) return null
  const body = await response.json()
  if (!body?.repo?.fullName) return null
  return {
    repo: body.repo,
    languages: (Array.isArray(body.languages) ? body.languages : []).filter((item) => item?.name && Number(item.percent) > 0),
    frameworks: (Array.isArray(body.frameworks) ? body.frameworks : []).filter((item) => typeof item === 'string'),
  }
}

/** Up to four languages; the rest together as one part. */
function languageParts(languages, otherLabel) {
  const top = languages.slice(0, SHADES - 1)
  const rest = languages.slice(SHADES - 1).reduce((sum, item) => sum + Number(item.percent), 0)
  return rest > 0 ? [...top, { name: otherLabel, percent: Math.round(rest * 10) / 10 }] : top
}

/**
 * "Repositori GitHub" (monochrome redesign, phase 6), only for a project with a public GitHub
 * repository: name, last update (pushed_at), main language, the language bar with a legend in
 * monochrome shades, and the frameworks and libraries found in composer.json and package.json, read
 * live through the Vercel function api/github-repo.js (the token stays on the server). When the
 * function fails (or does not run, as in local development) the panel says so and links to the
 * repository, so it is never empty.
 */
function RepoPanel({ project }) {
  const { t, formatDate, formatNumber } = useI18n()
  const link = publicRepoLink(project)
  const linkUrl = link?.url
  const [state, setState] = useState({ slug: null, status: 'loading', data: null })

  useEffect(() => {
    if (!linkUrl) return undefined
    const controller = new AbortController()
    loadRepo(project.slug, controller.signal)
      .then((data) => setState({ slug: project.slug, status: data ? 'ready' : 'error', data }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ slug: project.slug, status: 'error', data: null })
      })
    return () => controller.abort()
  }, [project.slug, linkUrl])

  if (!link) return null
  const status = state.slug === project.slug ? state.status : 'loading'
  const data = status === 'ready' ? state.data : null
  const parts = data ? languageParts(data.languages, t('repo.otherLanguages')) : []
  const percent = (value) => `${formatNumber(Math.round(Number(value) * 10) / 10)}%`

  return (
    <section className="pub-panel pub-repo" aria-labelledby="repo-judul" aria-busy={status === 'loading' || undefined}>
      <div className="pub-panel-title">
        <h2 id="repo-judul">
          <GithubIcon size={20} />
          {t('repo.title')}
        </h2>
        {data && (
          <span className="pub-repo-live">
            <span className="pub-dot" aria-hidden="true" />
            {t('repo.live')}
          </span>
        )}
      </div>

      {status === 'loading' && (
        <div className="pub-repo-loading" role="status">
          <span className="pub-sr-only">{t('repo.loading')}</span>
          <span className="pub-skeleton" aria-hidden="true" />
          <span className="pub-skeleton" aria-hidden="true" />
          <span className="pub-skeleton" aria-hidden="true" />
        </div>
      )}

      {status === 'error' && (
        <p className="pub-repo-error" role="status">
          <AlertIcon size={18} />
          <span>{t('repo.error')}</span>
        </p>
      )}

      {data && (
        <>
          <p className="pub-repo-name">
            <b>{data.repo.fullName}</b>
            {data.repo.pushedAt && <span>{t('repo.updated', { date: formatDate(data.repo.pushedAt, 'day') })}</span>}
          </p>
          {parts.length > 0 && (
            <div className="pub-repo-langs">
              <p className="pub-repo-langs-title">
                <span>{t('repo.mainLanguage')}</span>
                <b>{data.repo.language || parts[0].name}</b>
              </p>
              <div
                className="pub-repo-bar"
                role="img"
                aria-label={t('repo.barLabel', { list: parts.map((part) => `${part.name} ${percent(part.percent)}`).join(', ') })}
              >
                {parts.map((part, index) => (
                  <span key={part.name} className={`pub-repo-shade pub-repo-shade--${index + 1}`} style={{ width: `${part.percent}%` }} />
                ))}
              </div>
              <ul className="pub-repo-legend" aria-hidden="true">
                {parts.map((part, index) => (
                  <li key={part.name}>
                    <i className={`pub-repo-shade pub-repo-shade--${index + 1}`} />
                    {part.name} <em>{percent(part.percent)}</em>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.frameworks.length > 0 && (
            <div className="pub-repo-found">
              <h3>{t('repo.frameworks')}</h3>
              <ul>
                {data.frameworks.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <a href={data?.repo.url || link.url} target="_blank" rel="noopener noreferrer" className="pub-repo-open">
        <span>{t('repo.open')}</span>
        <ExternalIcon size={16} />
        <span className="pub-sr-only">{t('common.newTab')}</span>
      </a>
    </section>
  )
}

export default RepoPanel
