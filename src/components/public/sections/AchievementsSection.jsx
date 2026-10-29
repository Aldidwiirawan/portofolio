import { useI18n } from '../../../i18n/i18nContext'
import { FileIcon, TrophyIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import { Section } from '../Section'
import LazyLightbox from '../LazyLightbox'
import { useLightbox } from '../useLightbox'
import './CardsSection.css'

/** "Prestasi": only rendered when there are visible achievements (the table is optional). */
function AchievementsSection() {
  const { t, formatDate } = useI18n()
  const { status, data: achievements } = usePublicData().achievements
  const { viewer, openLightbox, closeLightbox } = useLightbox()
  if (status !== 'ready' || achievements.length === 0) return null

  return (
    <Section id="prestasi" title={t('achievements.title')}>
      <ul className="pub-cards">
        {achievements.map((item) => {
          const when = item.month
            ? formatDate(`${item.year}-${String(item.month).padStart(2, '0')}-01`)
            : item.year
          return (
            <li key={item.id}>
              <article className="pub-card">
                {item.photo_url ? (
                  <button
                    type="button"
                    className="pub-card-media"
                    onClick={() => openLightbox([{ url: item.photo_url, caption: item.title, lang: langOf(item, 'title') }])}
                    aria-label={t('lightbox.open', { caption: item.title })}
                  >
                    <img src={item.photo_url} alt="" width="72" height="72" loading="lazy" decoding="async" />
                  </button>
                ) : (
                  <span className="pub-card-media" aria-hidden="true">
                    <TrophyIcon size={22} />
                  </span>
                )}
                <div className="pub-card-body">
                  <h3 className="pub-card-title" lang={langOf(item, 'title')}>
                    {item.title}
                  </h3>
                  {item.event_name && (
                    <p className="pub-card-sub" lang={langOf(item, 'event_name')}>
                      {item.event_name}
                    </p>
                  )}
                  {when && <p className="pub-card-meta">{when}</p>}
                  {item.description && (
                    <p className="pub-card-text" lang={langOf(item, 'description')}>
                      {item.description}
                    </p>
                  )}
                  {item.document_url && (
                    <a href={item.document_url} target="_blank" rel="noopener noreferrer" className="pub-arrow-link">
                      <FileIcon size={18} />
                      <span>{t('achievements.document')}</span>
                      <span className="pub-sr-only">{t('common.newTab')}</span>
                    </a>
                  )}
                </div>
              </article>
            </li>
          )
        })}
      </ul>
      <LazyLightbox viewer={viewer} onClose={closeLightbox} />
    </Section>
  )
}

export default AchievementsSection
