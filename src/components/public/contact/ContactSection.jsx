import { useI18n } from '../../../i18n/i18nContext'
import CvButton from '../CvButton'
import { GithubIcon, LinkedinIcon, MailIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import ContactForm from './ContactForm'
import './ContactSection.css'

/**
 * "Hubungi saya": invitation, direct contact (email, LinkedIn, GitHub), "Unduh CV" once a CV exists
 * (K2) and the contact form. Always rendered: the form works even when the profile failed to load
 * (then without topics and direct links).
 */
function ContactSection() {
  const { t } = useI18n()
  const profile = usePublicData().profile.data
  const social = profile?.social ?? {}
  const channels = [
    social.email && { key: 'email', href: `mailto:${social.email}`, label: t('social.email'), value: social.email, Icon: MailIcon },
    social.linkedin && { key: 'linkedin', href: social.linkedin, label: t('social.linkedin'), value: shortUrl(social.linkedin), Icon: LinkedinIcon, external: true },
    social.github && { key: 'github', href: social.github, label: t('social.github'), value: shortUrl(social.github), Icon: GithubIcon, external: true },
  ].filter(Boolean)

  return (
    <section id="kontak" className="pub-section pub-contact" aria-labelledby="kontak-judul">
      <div className="pub-container pub-contact-grid">
        <div className="pub-contact-intro">
          <div className="pub-section-head">
            <p className="pub-tag">{t('contact.tag')}</p>
            <h2 id="kontak-judul" className="pub-h2">
              {t('contact.title')}
            </h2>
            <p className="pub-lead">{t('contact.intro')}</p>
          </div>

          {channels.length > 0 && (
            <ul className="pub-channels" aria-label={t('contact.channels')}>
              {channels.map(({ key, href, label, value, Icon, external }) => (
                <li key={key}>
                  <a
                    href={href}
                    className="pub-channel"
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className="pub-channel-icon" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <span className="pub-channel-text">
                      <span className="pub-channel-label">{label}</span>
                      <span className="pub-channel-value">{value}</span>
                    </span>
                    {external && <span className="pub-sr-only">{t('common.newTab')}</span>}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <CvButton className="pub-contact-cv" />
        </div>

        <ContactForm topics={contactTopics(profile)} />
      </div>
    </section>
  )
}

/**
 * Topics of the form in the page language. The value is always the Indonesian topic, so the admin
 * inbox gets the same topics whatever language the visitor reads.
 */
function contactTopics(profile) {
  const labels = profile?.contact_topics ?? []
  const values = profile?.contact_topic_values ?? labels
  return labels.map((label, index) => ({ value: values[index] ?? label, label, lang: langOf(profile, 'contact_topics', index) }))
}

/** 'https://www.linkedin.com/in/aldi-dwi-irawan/' → 'linkedin.com/in/aldi-dwi-irawan' */
function shortUrl(url) {
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
}

export default ContactSection
