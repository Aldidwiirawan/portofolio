import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { parseDate } from '../../../i18n/translate'
import { AwardIcon, BadgeCheckIcon, ChevronDownIcon, FileIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import { Section, SectionError } from '../Section'
import LazyLightbox from '../LazyLightbox'
import { useLightbox } from '../useLightbox'
import './CertificatesSection.css'

/**
 * "Sertifikat": featured certificates first; the rest behind "Lihat semua (n lagi)". After it is
 * opened, focus moves to the first certificate that appeared. A certificate image opens the viewer.
 */
function CertificatesSection() {
  const { t } = useI18n()
  const data = usePublicData()
  const { status, data: certificates } = data.certifications
  const [expanded, setExpanded] = useState(false)
  const firstExtraRef = useRef(null)
  const focusExtra = useRef(false)
  const { viewer, openLightbox, closeLightbox } = useLightbox()

  useEffect(() => {
    if (expanded && focusExtra.current) {
      focusExtra.current = false
      firstExtraRef.current?.focus()
    }
  }, [expanded])

  if (status === 'ready' && certificates.length === 0) return null

  const featured = certificates.filter((cert) => cert.is_featured)
  const primary = featured.length > 0 ? featured : certificates.slice(0, 3)
  const extra = certificates.filter((cert) => !primary.includes(cert))
  const shown = expanded ? [...primary, ...extra] : primary

  const toggle = () => {
    focusExtra.current = !expanded
    setExpanded((value) => !value)
  }

  return (
    <Section id="sertifikat" tag={t('certificates.tag')} title={t('certificates.title')} intro={t('certificates.intro')}>
      {status === 'error' && <SectionError onRetry={() => data.reload('certifications')} />}
      {status === 'ready' && (
        <>
          <ul id="sertifikat-daftar" className="pub-certs">
            {shown.map((cert, index) => (
              <li key={cert.id}>
                <CertificateCard
                  cert={cert}
                  headingRef={index === primary.length ? firstExtraRef : undefined}
                  onOpenImage={() => openLightbox([{ url: cert.image_url, caption: cert.name, lang: langOf(cert, 'name') }])}
                />
              </li>
            ))}
          </ul>
          {extra.length > 0 && (
            <button
              type="button"
              className="pub-btn pub-btn--secondary pub-certs-more"
              aria-expanded={expanded}
              aria-controls="sertifikat-daftar"
              onClick={toggle}
            >
              <span>{expanded ? t('certificates.showLess') : t('certificates.showAll', { n: extra.length })}</span>
              <ChevronDownIcon size={18} className={expanded ? 'pub-flip' : undefined} />
            </button>
          )}
        </>
      )}
      <LazyLightbox viewer={viewer} onClose={closeLightbox} />
    </Section>
  )
}

function CertificateCard({ cert, headingRef, onOpenImage }) {
  const { t, code, formatDate } = useI18n()
  const expiry = parseDate(cert.expiry_date)
  const expired = expiry && expiry < new Date(new Date().setHours(0, 0, 0, 0))
  let validity = ''
  if (cert.no_expiry) validity = t('certificates.noExpiry')
  else if (expiry) validity = t(expired ? 'certificates.expired' : 'certificates.validUntil', { date: formatDate(cert.expiry_date) })

  return (
    <article className="pub-cert">
      {cert.image_url && (
        <button type="button" className="pub-cert-image" onClick={onOpenImage} aria-label={t('certificates.open', { name: cert.name })}>
          <img src={cert.image_url} alt="" width="640" height="480" loading="lazy" decoding="async" />
        </button>
      )}
      <div className="pub-cert-body">
        <div className="pub-cert-top">
          {!cert.image_url && (
            <span className="pub-cert-icon" aria-hidden="true">
              <AwardIcon size={20} />
            </span>
          )}
          {code('cert', cert.category) && <span className="pub-badge pub-badge--accent">{code('cert', cert.category)}</span>}
        </div>
        <h3 ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="pub-cert-name" lang={langOf(cert, 'name')}>
          {cert.name}
        </h3>
        {cert.issuer && (
          <p className="pub-cert-issuer" lang={langOf(cert, 'issuer')}>
            {cert.issuer}
          </p>
        )}
        <ul className="pub-cert-facts">
          {cert.issue_date && <li>{t('certificates.issued', { date: formatDate(cert.issue_date) })}</li>}
          {validity && <li data-expired={expired || undefined}>{validity}</li>}
          {cert.score && <li>{t('certificates.score', { score: cert.score })}</li>}
        </ul>
        {(cert.pdf_url || cert.credential_url) && (
          <div className="pub-cert-links">
            {cert.pdf_url && (
              <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" className="pub-arrow-link">
                <FileIcon size={18} />
                <span>{t('certificates.pdf')}</span>
                <span className="pub-sr-only">{t('common.newTab')}</span>
              </a>
            )}
            {cert.credential_url && (
              <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="pub-arrow-link">
                <BadgeCheckIcon size={18} />
                <span>{t('certificates.verify')}</span>
                <span className="pub-sr-only">{t('common.newTab')}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default CertificatesSection
