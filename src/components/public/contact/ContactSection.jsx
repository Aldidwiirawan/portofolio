import { useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { CheckIcon, CopyIcon, FileIcon, GithubIcon, LinkedinIcon, MailIcon } from '../icons'
import { langOf } from '../localize'
import { usePublicData } from '../publicContexts'
import ContactForm from './ContactForm'
import './ContactSection.css'

/**
 * "Kontak" laid out like the reference site of phase 8: a black section with, on the left, the title over
 * two lines, the invitation, the email address in a box (the address opens the mail program; the button
 * next to it copies it) and the other profiles (LinkedIn, GitHub, the CV once one exists) as square icon
 * buttons; on the right the existing contact form in a thin bordered panel (its sending, checks, loading
 * state and messages are unchanged). Always rendered: the form works even when the profile failed to
 * load (then without topics and links). The footer follows it (PublicFooter).
 */
function ContactSection() {
  const { t } = useI18n()
  const profile = usePublicData().profile.data
  const social = profile?.social ?? {}
  const [copied, setCopied] = useState(false)
  const profiles = [
    social.linkedin && { key: 'linkedin', href: social.linkedin, label: t('social.linkedin'), Icon: LinkedinIcon },
    social.github && { key: 'github', href: social.github, label: t('social.github'), Icon: GithubIcon },
    profile?.cvUrl && { key: 'cv', href: profile.cvUrl, label: t('cv.download'), Icon: FileIcon },
  ].filter(Boolean)
  const words = t('contact.title').split(' ')
  const half = Math.ceil(words.length / 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(social.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not allowed: the address itself stays a mailto link
    }
  }

  return (
    <section id="kontak" className="pub-invert pub-contact" aria-labelledby="kontak-judul">
      <div className="pub-contact-inner">
        <div className="pub-contact-grid">
          <div className="pub-contact-intro">
            <h2 id="kontak-judul" className="pub-title pub-reveal" data-reveal="title">
              {words.slice(0, half).join(' ')}
              {words.length > half && (
                <>
                  <br />
                  {words.slice(half).join(' ')}
                </>
              )}
            </h2>
            <p className="pub-contact-lead">{t('contact.intro')}</p>

            {social.email && (
              <div className="pub-contact-block">
                <p className="pub-contact-label">{t('contact.emailLabel')}</p>
                <div className="pub-contact-mailbox">
                  <a href={`mailto:${social.email}`} className="pub-contact-mail">
                    <span className="pub-contact-mail-icon" aria-hidden="true">
                      <MailIcon size={20} />
                    </span>
                    <span className="pub-contact-mail-text">{social.email}</span>
                  </a>
                  <button type="button" className="pub-contact-copy" onClick={copy} aria-label={t(copied ? 'contact.copied' : 'contact.copy')}>
                    {copied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
                  </button>
                  <span className="pub-sr-only" role="status">
                    {copied ? t('contact.copied') : ''}
                  </span>
                </div>
              </div>
            )}

            {profiles.length > 0 && (
              <div className="pub-contact-block">
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
              </div>
            )}
          </div>

          <div className="pub-contact-panel">
            <ContactForm topics={contactTopics(profile)} />
          </div>
        </div>
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
