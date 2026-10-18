import { useI18n } from '../../../i18n/i18nContext'
import { UsersIcon } from '../icons'
import { usePublicData } from '../publicContexts'
import { Section } from '../Section'
import { Period } from './ExperienceSection'
import './CertificatesSection.css'

/** "Organisasi": only rendered when there are visible organizations (the table is optional). */
function OrganizationsSection() {
  const { t } = useI18n()
  const { status, data: organizations } = usePublicData().organizations
  if (status !== 'ready' || organizations.length === 0) return null

  return (
    <Section id="organisasi" tag={t('organizations.tag')} title={t('organizations.title')}>
      <ul className="pub-cards">
        {organizations.map((item) => (
          <li key={item.id}>
            <article className="pub-card">
              <span className="pub-card-media pub-card-media--logo" aria-hidden={item.logo_url ? undefined : 'true'}>
                {item.logo_url ? (
                  <img
                    src={item.logo_url}
                    alt={t('organizations.logoAlt', { name: item.name })}
                    width="48"
                    height="48"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <UsersIcon size={22} />
                )}
              </span>
              <div className="pub-card-body">
                <h3 className="pub-card-title">{item.name}</h3>
                {item.role && <p className="pub-card-sub">{item.role}</p>}
                {(item.start_date || item.end_date) && (
                  <p className="pub-card-meta">
                    <Period start={item.start_date} end={item.end_date} current={!item.end_date} />
                  </p>
                )}
                {item.description && <p className="pub-card-text">{item.description}</p>}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default OrganizationsSection
