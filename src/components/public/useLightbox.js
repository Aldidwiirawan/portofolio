import { useCallback, useState } from 'react'

/**
 * State of the image viewer: render <LazyLightbox viewer={viewer} onClose={closeLightbox} /> and call
 * openLightbox(images, start) from a button.
 */
export function useLightbox() {
  const [viewer, setViewer] = useState(null)
  const openLightbox = useCallback((images, start = 0) => {
    if (images?.length) setViewer({ images, start })
  }, [])
  const closeLightbox = useCallback(() => setViewer(null), [])
  return { viewer, openLightbox, closeLightbox }
}
