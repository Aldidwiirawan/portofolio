import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { parseDate } from '../../../i18n/translate'
import { AwardIcon, BadgeCheckIcon, ChevronDownIcon, FileIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import { SectionError } from '../Section'
import LazyLightbox from '../LazyLightbox'
import { useSound } from '../sound/soundContext'
import { useLightbox } from '../useLightbox'
import './CertificatesSection.css'

/**
 * "Sertifikat" (monochrome redesign, phase 5): the featured certificates (the first three when none is
 * featured), each image whole on a soft background; a click on the image opens the viewer (Esc and
 * "Tutup" close it). "Lihat semua (n lagi)" shows the others and moves focus to the first one that
 * appeared. Category, name, issuer, issue date, validity and "Lihat PDF"; scores are never shown.
 */
function CertificatesSection() {
  const { t } = useI18n()
  const { cue } = useSound()
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

  const featured = certificates.filter((cert) => cert.is_featured).slice(0, 3)
  const primary = featured.length > 0 ? featured : certificates.slice(0, 3)
  const extra = certificates.filter((cert) => !primary.includes(cert))
  const shown = expanded ? [...primary, ...extra] : primary

  const toggle = () => {
    focusExtra.current = !expanded
    setExpanded((value) => !value)
  }

  const open = (cert) => {
    cue('zoom')
    openLightbox([{ url: cert.image_url, caption: cert.name, lang: langOf(cert, 'name') }])
  }

  return (
    <section id="sertifikat" className="pub-certs-section" aria-labelledby="sertifikat-judul">
      <div className="pub-certs-inner">
        <div className="pub-certs-head">
          <h2 id="sertifikat-judul" className="pub-title pub-reveal" data-reveal="title">
            {t('certificates.title')}
          </h2>
          <p className="pub-certs-intro">{t('certificates.intro')}</p>
        </div>

        {status === 'error' && <SectionError onRetry={() => data.reload('certifications')} />}
        {status === 'ready' && (
          <>
            <ul id="sertifikat-daftar" className="pub-certs">
              {shown.map((cert, index) => (
                <li key={cert.id} className="pub-reveal">
                  <CertificateCard cert={cert} headingRef={index === primary.length ? firstExtraRef : undefined} onOpenImage={() => open(cert)} />
                </li>
              ))}
            </ul>
            {extra.length > 0 && (
              <div className="pub-certs-more-row">
                <button type="button" className="pub-btn pub-certs-more" aria-expanded={expanded} aria-controls="sertifikat-daftar" onClick={toggle}>
                  <span>{expanded ? t('certificates.showLess') : t('certificates.showAll', { n: extra.length })}</span>
                  <ChevronDownIcon size={18} className={expanded ? 'pub-flip' : undefined} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <LazyLightbox viewer={viewer} onClose={closeLightbox} />
    </section>
  )
}

function CertificateCard({ cert, headingRef, onOpenImage }) {
  const { t, code, formatDate } = useI18n()
  const expiry = parseDate(cert.expiry_date)
  const expired = expiry && expiry < new Date(new Date().setHours(0, 0, 0, 0))
  let validity = null
  if (cert.no_expiry) validity = { label: t('certificates.validLabel'), value: t('certificates.noExpiry') }
  else if (expiry) validity = { label: t(expired ? 'certificates.expiredLabel' : 'certificates.validLabel'), value: formatDate(cert.expiry_date) }
  const category = code('cert', cert.category)

  return (
    <article className="pub-cert">
      {cert.image_url ? (
        <button type="button" className="pub-cert-paper" onClick={onOpenImage} aria-label={t('certificates.open', { name: cert.name })}>
          <img src={cert.image_url} alt="" width="640" height="480" loading="lazy" decoding="async" />
        </button>
      ) : (
        <div className="pub-cert-paper pub-cert-paper--empty" aria-hidden="true">
          <AwardIcon size={40} />
        </div>
      )}
      <div className="pub-cert-body">
        {category && <span className="pub-cert-kind">{category}</span>}
        <h3 ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="pub-cert-name" lang={langOf(cert, 'name')}>
          {cert.name}
        </h3>
        {cert.issuer && (
          <p className="pub-cert-issuer" lang={langOf(cert, 'issuer')}>
            {cert.issuer}
          </p>
        )}
        {(cert.issue_date || validity) && (
          <dl className="pub-cert-dates">
            {cert.issue_date && (
              <div>
                <dt>{t('certificates.issuedLabel')}</dt>
                <dd>{formatDate(cert.issue_date)}</dd>
              </div>
            )}
            {validity && (
              <div data-expired={expired || undefined}>
                <dt>{validity.label}</dt>
                <dd>{validity.value}</dd>
              </div>
            )}
          </dl>
        )}
        {(cert.pdf_url || cert.credential_url) && (
          <div className="pub-cert-actions">
            {cert.pdf_url && (
              <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" className="pub-cert-pdf">
                <FileIcon size={14} />
                <span>{t('certificates.pdf')}</span>
                <span className="pub-sr-only">
                  {cert.name} {t('common.newTab')}
                </span>
              </a>
            )}
            {cert.credential_url && (
              <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="pub-cert-verify">
                <BadgeCheckIcon size={16} />
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
