import { useI18n } from '../../../i18n/i18nContext'
import { FileIcon, GithubIcon, LinkedinIcon, MailIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import ContactForm from './ContactForm'
import './ContactSection.css'

/**
 * "Kontak" (monochrome redesign, phase 5): a black section with the invitation, the email address as
 * a large link, the other profiles (LinkedIn, GitHub, the CV once one exists) as icon buttons, and the
 * existing contact form (its sending, checks, loading state and messages are unchanged). Always
 * rendered: the form works even when the profile failed to load (then without topics and links).
 */
function ContactSection() {
  const { t } = useI18n()
  const profile = usePublicData().profile.data
  const social = profile?.social ?? {}
  const profiles = [
    social.linkedin && { key: 'linkedin', href: social.linkedin, label: t('social.linkedin'), Icon: LinkedinIcon },
    social.github && { key: 'github', href: social.github, label: t('social.github'), Icon: GithubIcon },
    profile?.cvUrl && { key: 'cv', href: profile.cvUrl, label: t('cv.download'), Icon: FileIcon },
  ].filter(Boolean)

  return (
    <section id="kontak" className="pub-section pub-invert pub-contact" aria-labelledby="kontak-judul">
      <div className="pub-container pub-contact-grid">
        <div className="pub-contact-intro">
          <h2 id="kontak-judul" className="pub-h2 pub-reveal">
            {t('contact.title')}
          </h2>
          <p className="pub-lead">{t('contact.intro')}</p>

          {social.email && (
            <>
              <p className="pub-contact-label">{t('contact.emailLabel')}</p>
              <a href={`mailto:${social.email}`} className="pub-contact-mail">
                <MailIcon size={20} />
                <span>{social.email}</span>
              </a>
            </>
          )}

          {profiles.length > 0 && (
            <>
              <p className="pub-contact-label" id="kontak-profil">
                {t('contact.profilesLabel')}
              </p>
              <ul className="pub-contact-profiles" aria-labelledby="kontak-profil">
                {profiles.map(({ key, href, label, Icon }) => (
                  <li key={key}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="pub-contact-profile" aria-label={`${label} ${t('common.newTab')}`} title={label}>
                      <Icon size={20} />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
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

export default ContactSection
