import { useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { useSound } from '../sound/soundContext'

/**
 * Grey folder of one journey entry (only when it has photos, at most 3), drawn like the folder of the
 * reference site of phase 8: three sheets inside, the photos small and grey on them. A click (or Enter)
 * opens it with a sound and the sheets fan out above it; while open each photo is a button that shows the
 * photos large in the image viewer (in colour on hover). The photos are hidden from screen readers while
 * the folder is closed.
 */
function JourneyFolder({ photos = [], year, onOpenPhoto }) {
  const { t, lang } = useI18n()
  const { cue } = useSound()
  const [open, setOpen] = useState(false)
  const altOf = (photo, index) => {
    const english = lang === 'en' && photo?.caption_en
    return (english ? photo.caption_en : photo?.caption) || t('journey.photoAlt', { year, n: index + 1 })
  }
  const safePhotos = photos || []
  const viewerItems = safePhotos.map((photo, index) => ({ ...photo, caption: altOf(photo, index) }))
  const sheets = [0, 1, 2].map((index) => safePhotos[index] ?? null)

  const toggle = () => {
    cue(open ? 'close' : 'open')
    setOpen((value) => !value)
  }

  return (
    <div className="pub-jr-folder-wrap">
      <div className="pub-jr-folder-box">
        <div className="pub-jr-folder" data-open={open || undefined}>
          <div className="pub-jr-folder-back">
            {sheets.map((photo, index) => (
              <div key={index} className="pub-jr-paper">
                {photo && (
                  <button
                    type="button"
                    className="pub-jr-paper-photo"
                    tabIndex={open ? 0 : -1}
                    aria-hidden={open ? undefined : 'true'}
                    aria-label={altOf(photo, index)}
                    onClick={() => (open ? onOpenPhoto(viewerItems, index) : toggle())}
                  >
                    <img src={photo.url} alt="" width="146" height="124" loading="lazy" decoding="async" />
                  </button>
                )}
              </div>
            ))}
            <span className="pub-jr-folder-front" aria-hidden="true" />
            <span className="pub-jr-folder-front pub-jr-folder-front--right" aria-hidden="true" />
          </div>
        </div>
        <button
          type="button"
          className="pub-jr-folder-button"
          data-open={open || undefined}
          aria-expanded={open}
          aria-label={t(open ? 'journey.folderClose' : 'journey.folderOpen', { year })}
          onClick={toggle}
        />
      </div>
      <p className="pub-jr-folder-text">
        <b>{t('journey.archive')}</b>
        <span className="pub-jr-folder-line" aria-hidden="true" />
        <span className="pub-jr-folder-hint">{t(open ? 'journey.folderHintClose' : 'journey.folderHint')}</span>
        <span className="pub-jr-folder-hint pub-jr-folder-hint--touch">{t(open ? 'journey.folderHintClose' : 'journey.folderHintTouch')}</span>
      </p>
    </div>
  )
}

export default JourneyFolder
