import { useEffect, useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { ExternalIcon } from '../icons'
import './GithubActivity.css'

const ENDPOINT = '/api/github-contributions'
const RECENT_WEEKS = 26 // phones show the last 26 weeks

/** The calendar from the Vercel function, or null when it is missing, failed or not JSON (local dev). */
async function loadCalendar(signal) {
  const response = await fetch(ENDPOINT, { headers: { Accept: 'application/json' }, signal })
  if (!response.ok || !/json/i.test(response.headers.get('content-type') || '')) return null
  const body = await response.json()
  if (!Array.isArray(body?.weeks) || typeof body.username !== 'string') return null
  const weeks = body.weeks
    .filter(Array.isArray)
    .map((days) =>
      days
        .filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day?.date))
        .map((day) => ({ date: day.date, count: Number(day.count) || 0, level: Math.min(4, Math.max(0, Number(day.level) || 0)) }))
    )
    .filter((days) => days.length > 0)
  return weeks.length > 0 ? { username: body.username, total: Number(body.total) || 0, weeks } : null
}

const dayOfWeek = (date) => new Date(`${date}T00:00:00Z`).getUTCDay()
const monthOf = (date) => date.slice(0, 7)

/**
 * "Aktivitas di GitHub" (stage 3C, K5): the contribution calendar of the last 12 months, from the
 * Vercel function (official GitHub API, token on the server). Loaded when the projects section comes
 * near (GithubActivitySlot). While loading it keeps the height of the chart; when the function is
 * missing (local dev), fails or the total is 0, nothing is rendered. The cells are decorative
 * (aria-hidden): the total is the text that is read.
 */
function GithubActivity() {
  const { t, locale } = useI18n()
  const [state, setState] = useState({ status: 'loading', data: null })

  useEffect(() => {
    const controller = new AbortController()
    loadCalendar(controller.signal)
      .then((data) => setState({ status: data && data.total > 0 ? 'ready' : 'hidden', data }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'hidden', data: null })
      })
    return () => controller.abort()
  }, [])

  if (state.status === 'hidden') return null
  if (state.status === 'loading') {
    return (
      <div className="pub-gh pub-gh--loading" role="status">
        <span className="pub-sr-only">{t('github.loading')}</span>
        <div className="pub-gh-skeleton pub-skeleton" aria-hidden="true" />
      </div>
    )
  }

  const { username, total, weeks } = state.data
  const months = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
  const number = new Intl.NumberFormat(locale).format(total)
  const href = `https://github.com/${encodeURIComponent(username)}`

  return (
    <section className="pub-gh" aria-labelledby="pub-gh-title">
      <div className="pub-gh-head">
        <h3 id="pub-gh-title" className="pub-others-title">
          {t('github.title')}
        </h3>
        <a href={href} target="_blank" rel="noopener noreferrer" className="pub-arrow-link pub-gh-link">
          <span>{t('github.profile')}</span>
          <ExternalIcon size={16} />
          <span className="pub-sr-only">{t('common.newTab')}</span>
        </a>
      </div>
      <p className="pub-gh-total">{total === 1 ? t('github.totalOne') : t('github.total', { n: number })}</p>

      <div
        className="pub-gh-chart"
        aria-hidden="true"
        style={{ '--pub-gh-weeks': weeks.length, '--pub-gh-recent': Math.min(RECENT_WEEKS, weeks.length) }}
      >
        <div className="pub-gh-grid">
          {weeks.map((days, index) => {
            const first = days[0].date
            const newMonth = index === 0 || monthOf(first) !== monthOf(weeks[index - 1][0].date)
            // Phones start at the first recent week: it gets its month there too, unless a new month
            // begins within the next two weeks (the labels would overlap)
            const recentStart =
              index === weeks.length - RECENT_WEEKS &&
              weeks.slice(index + 1, index + 3).every((next) => monthOf(next[0].date) === monthOf(first))
            // The first week starts on the weekday of the first day; earlier weekdays stay empty
            const offset = index === 0 ? dayOfWeek(first) : 0
            const label = months.format(new Date(`${first}T00:00:00Z`))
            return (
              <div key={first} className="pub-gh-week" data-old={index < weeks.length - RECENT_WEEKS || undefined}>
                {newMonth && index < weeks.length - 2 && <span className="pub-gh-month">{label}</span>}
                {!newMonth && recentStart && <span className="pub-gh-month pub-gh-month--phone">{label}</span>}
                {offset > 0 && <span className="pub-gh-pad" style={{ gridRow: `span ${offset}` }} />}
                {days.map((day) => (
                  <span key={day.date} className="pub-gh-cell" data-level={day.level} />
                ))}
              </div>
            )
          })}
        </div>
        <div className="pub-gh-legend">
          <span>{t('github.less')}</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className="pub-gh-cell" data-level={level} />
          ))}
          <span>{t('github.more')}</span>
        </div>
      </div>
      <p className="pub-hint pub-gh-recent">{t('github.recent')}</p>
    </section>
  )
}

export default GithubActivity
