import { useState } from 'react'
import { useI18n } from '../../../i18n/i18nContext'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'
import { useSound } from '../sound/soundContext'
import './MediaViewer.css'

function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

/**
 * Media of a project page (monochrome redesign, phase 6): tabs Sampul / Galeri / Diagram (a tab only
 * when it has images; no tab bar for a single kind), arrows and thumbnails in the gallery, a choice per
 * diagram (its label, e.g. "ERD"), "Layar Web / Layar HP" only when the gallery has phone screenshots
 * as well as web ones, and "Perbesar" for the lightbox. Every image shows whole in a 16:10 frame.
 * The cover is the largest element of the page: fetched first.
 */
function MediaViewer({ project, onZoom }) {
  const { t } = useI18n()
  const { cue } = useSound()
  const allGallery = project.gallery.filter((item) => item.kind !== 'diagram')
  const diagrams = project.gallery.filter((item) => item.kind === 'diagram')
  const devices = ['web', 'mobile'].filter((device) => allGallery.some((item) => item.device === device))
  const [device, setDevice] = useState(devices[0] ?? 'web')
  const gallery = devices.length > 1 ? allGallery.filter((item) => item.device === device) : allGallery
  const cover = project.thumbnail_url ? [{ url: project.thumbnail_url, caption: t('detail.coverCaption', { title: project.title }) }] : []
  const tabs = [
    cover.length > 0 && { key: 'cover', label: t('detail.tabCover'), items: cover },
    allGallery.length > 0 && { key: 'gallery', label: t('detail.tabGallery'), items: gallery, count: allGallery.length },
    diagrams.length > 0 && { key: 'diagram', label: t('detail.tabDiagram'), items: diagrams, count: diagrams.length },
  ].filter(Boolean)
  const [tabKey, setTabKey] = useState(tabs[0]?.key)
  const [index, setIndex] = useState(0)
  if (tabs.length === 0) return null

  const tab = tabs.find((item) => item.key === tabKey) ?? tabs[0]
  const items = tab.items
  const current = items[Math.min(index, items.length - 1)] ?? items[0]
  const position = items.indexOf(current)
  const captionOf = (item, n) => item.caption || item.label || t('lightbox.untitled', { n: n + 1 })
  const labelOf = (item, n) => item.label || item.caption || t('detail.diagramN', { n: n + 1 })
  const choose = (key) => {
    setTabKey(key)
    setIndex(0)
  }
  const go = (step) => setIndex((position + step + items.length) % items.length)

  return (
    <section className="pub-viewer" aria-label={t('detail.media')}>
      {(tabs.length > 1 || (tab.key === 'diagram' && items.length > 1) || (tab.key === 'gallery' && devices.length > 1)) && (
        <div className="pub-viewer-top">
          {tabs.length > 1 && (
            <div className="pub-viewer-tabs" role="group" aria-label={t('detail.mediaKind')}>
              {tabs.map((item) => (
                <button key={item.key} type="button" className="pub-viewer-tab" aria-pressed={item.key === tab.key} onClick={() => choose(item.key)}>
                  {item.label}
                  {item.count != null && <small>{item.count}</small>}
                </button>
              ))}
            </div>
          )}
          {tab.key === 'diagram' && items.length > 1 && (
            <div className="pub-viewer-sub" role="group" aria-label={t('detail.chooseDiagram')}>
              {items.map((item, n) => (
                <button key={item.url} type="button" aria-pressed={n === position} onClick={() => setIndex(n)} lang={item.lang}>
                  {labelOf(item, n)}
                </button>
              ))}
            </div>
          )}
          {tab.key === 'gallery' && devices.length > 1 && (
            <div className="pub-viewer-sub" role="group" aria-label={t('detail.chooseScreen')}>
              {devices.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={key === device}
                  onClick={() => {
                    setDevice(key)
                    setIndex(0)
                  }}
                >
                  {t(key === 'web' ? 'detail.screenWeb' : 'detail.screenPhone')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="pub-viewer-stage">
        <img
          key={current.url}
          src={current.url}
          alt={captionOf(current, position)}
          lang={current.lang}
          width="1200"
          height="750"
          decoding="async"
          fetchPriority={tab.key === 'cover' ? 'high' : undefined}
        />
        {tab.key === 'gallery' && items.length > 1 && (
          <>
            <button type="button" className="pub-viewer-arrow pub-viewer-arrow--prev" onClick={() => go(-1)} aria-label={t('lightbox.prev')}>
              <ChevronLeftIcon size={18} />
            </button>
            <button type="button" className="pub-viewer-arrow pub-viewer-arrow--next" onClick={() => go(1)} aria-label={t('lightbox.next')}>
              <ChevronRightIcon size={18} />
            </button>
          </>
        )}
      </div>

      <div className="pub-viewer-bottom">
        <p lang={current.lang}>
          {captionOf(current, position)}
          {items.length > 1 && <span className="pub-viewer-count">{t('lightbox.counter', { n: position + 1, total: items.length })}</span>}
        </p>
        <button
          type="button"
          className="pub-viewer-zoom"
          onClick={() => {
            cue('zoom')
            onZoom(items, position)
          }}
        >
          <ZoomIcon />
          <span>{t('detail.zoom')}</span>
        </button>
      </div>

      {tab.key === 'gallery' && items.length > 1 && (
        <div className="pub-viewer-thumbs" role="group" aria-label={t('detail.chooseImage')}>
          {items.map((item, n) => (
            <button
              key={item.url}
              type="button"
              className="pub-viewer-thumb"
              aria-pressed={n === position}
              aria-label={captionOf(item, n)}
              onClick={() => setIndex(n)}
            >
              <img src={item.url} alt="" width="160" height="100" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default MediaViewer
