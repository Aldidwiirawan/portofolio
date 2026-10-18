import { lazy, Suspense } from 'react'

const Lightbox = lazy(() => import('./Lightbox'))

/** The image viewer, loaded on first use (see useLightbox). */
function LazyLightbox({ viewer, onClose }) {
  if (!viewer) return null
  return (
    <Suspense fallback={null}>
      <Lightbox images={viewer.images} start={viewer.start} onClose={onClose} />
    </Suspense>
  )
}

export default LazyLightbox
