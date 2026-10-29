import { useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { useSound } from '../sound/soundContext'

/**
 * Black folder of one journey entry, only when it has photos (at most 3): a click (or Enter) opens it
 * and the photos fan out above it with a sound; another click closes it. The photos are real images
 * with their alt text (the admin caption) while open, and hidden from screen readers while closed.
 */
function JourneyFolder({ photos, year }) {
  const { t, lang } = useI18n()
  const { cue } = useSound()
  const [open, setOpen] = useState(false)

  const toggle = () => {
    cue(open ? 'close' : 'open')
    setOpen((value) => !value)
  }

  return (
    <>
      <div className="pub-jr-folder" data-open={open || undefined} data-count={photos.length}>
        <span className="pub-jr-folder-back" aria-hidden="true" />
        {photos.map((photo, index) => {
          const english = lang === 'en' && photo.caption_en
          return (
            <span key={photo.url} className="pub-jr-photo" aria-hidden={open ? undefined : 'true'}>
              <img
                src={photo.url}
                alt={(english ? photo.caption_en : photo.caption) || t('journey.photoAlt', { year, n: index + 1 })}
                lang={lang === 'en' && !english && photo.caption ? 'id' : undefined}
                width="260"
                height="195"
                loading="lazy"
                decoding="async"
              />
            </span>
          )
        })}
        <span className="pub-jr-folder-front" aria-hidden="true" />
        <button
          type="button"
          className="pub-jr-folder-button"
          aria-expanded={open}
          aria-label={t(open ? 'journey.folderClose' : 'journey.folderOpen', { year })}
          onClick={toggle}
        />
      </div>
      <p className="pub-jr-folder-text">
        <b>{t('journey.archive', { year })}</b>
        <span>{t(open ? 'journey.folderHintClose' : 'journey.folderHint')}</span>
      </p>
    </>
  )
}

export default JourneyFolder
