import { useCallback, useLayoutEffect, useRef, useState } from 'react'

/** 'portrait' when the image is taller than wide (a phone screenshot), otherwise 'landscape'. */
function orientationOf(img) {
  if (!img?.naturalWidth || !img.naturalHeight) return null
  return img.naturalHeight > img.naturalWidth ? 'portrait' : 'landscape'
}

/**
 * Orientation of an image, read from its naturalWidth and naturalHeight once it has loaded (null
 * before, and for an image that fails). An image already in the cache is read before the first
 * paint. Returns the ref and the onLoad handler for the <img>.
 */
export function useImageOrientation(src) {
  const ref = useRef(null)
  const [loaded, setLoaded] = useState({ src: null, orientation: null })

  const read = useCallback(
    (img) => {
      const orientation = orientationOf(img)
      if (orientation) setLoaded({ src, orientation })
    },
    [src],
  )

  useLayoutEffect(() => {
    if (ref.current?.complete) read(ref.current)
  }, [read])

  return {
    ref,
    orientation: loaded.src === src ? loaded.orientation : null,
    onLoad: (event) => read(event.currentTarget),
  }
}
