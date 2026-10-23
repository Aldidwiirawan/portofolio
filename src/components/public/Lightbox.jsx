import { useRef, useState } from 'react'
import { useFocusTrap } from '../admin/ui/useFocusTrap'
import { useScrollLock } from '../admin/ui/useScrollLock'
import { useI18n } from '../../i18n/i18nContext'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './icons'
import { useImageOrientation } from './useImageOrientation'
import './Lightbox.css'

const SWIPE_PX = 50

/**
 * Image viewer (loaded on demand): one image at a time with its caption and "n dari total".
 * ← → (and Home/End), the buttons or a swipe on touch screens change the image; Escape, "Tutup" or a
 * click beside the image closes it. Focus stays inside and returns to the opener afterwards.
 * Always dark, whatever the page theme. Every image shows whole; a portrait one (phone screenshot)
 * gets the thin blueprint grid behind it, like on the cards and the detail page.
 * @param {{ images: Array<{ url: string, caption?: string, lang?: string }>, start?: number, onClose: () => void }} props
 *   lang: language of the caption when it differs from the page ('id' on the English page)
 */
function Lightbox({ images, start = 0, onClose }) {
  const { t } = useI18n()
  const [index, setIndex] = useState(() => Math.min(Math.max(start, 0), images.length - 1))
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const swipe = useRef(null)
  const many = images.length > 1
  const image = images[index]
  const caption = image.caption || (many ? t('lightbox.untitled', { n: index + 1 }) : '')
  const { ref: imageRef, orientation, onLoad: onImageLoad } = useImageOrientation(image.url)

  useFocusTrap(dialogRef, true, { onEscape: onClose, initialFocusRef: closeRef })
  useScrollLock(true)

  const go = (step) => setIndex((value) => (value + step + images.length) % images.length)

  const onKeyDown = (event) => {
    if (!many) return
    if (event.key === 'ArrowLeft') go(-1)
    else if (event.key === 'ArrowRight') go(1)
    else if (event.key === 'Home') setIndex(0)
    else if (event.key === 'End') setIndex(images.length - 1)
    else return
    event.preventDefault()
  }

  const onPointerDown = (event) => {
    if (event.pointerType === 'touch') swipe.current = event.clientX
  }
  const onPointerUp = (event) => {
    if (swipe.current == null || event.pointerType !== 'touch') return
    const dx = event.clientX - swipe.current
    swipe.current = null
    if (many && Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1)
  }

  return (
    <div
      ref={dialogRef}
      className="pub-lightbox"
      data-theme="dark"
      role="dialog"
      aria-modal="true"
      aria-label={t('lightbox.label')}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="pub-lightbox-bar">
        <p className="pub-lightbox-count" aria-live="polite">
          {many ? t('lightbox.counter', { n: index + 1, total: images.length }) : ''}
        </p>
        <button ref={closeRef} type="button" className="pub-icon-btn pub-lightbox-close" onClick={onClose} aria-label={t('common.close')}>
          <CloseIcon size={22} />
        </button>
      </div>

      <figure
        className="pub-lightbox-figure"
        data-orientation={orientation ?? undefined}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <img
          key={image.url}
          ref={imageRef}
          src={image.url}
          alt={caption}
          decoding="async"
          lang={image.caption ? image.lang : undefined}
          onLoad={onImageLoad}
        />
        {caption && <figcaption lang={image.caption ? image.lang : undefined}>{caption}</figcaption>}
      </figure>

      {many && (
        <>
          <button type="button" className="pub-icon-btn pub-lightbox-nav pub-lightbox-nav--prev" onClick={() => go(-1)} aria-label={t('lightbox.prev')}>
            <ChevronLeftIcon size={24} />
          </button>
          <button type="button" className="pub-icon-btn pub-lightbox-nav pub-lightbox-nav--next" onClick={() => go(1)} aria-label={t('lightbox.next')}>
            <ChevronRightIcon size={24} />
          </button>
        </>
      )}
    </div>
  )
}

export default Lightbox
