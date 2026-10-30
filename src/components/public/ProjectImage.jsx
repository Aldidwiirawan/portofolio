import { useImageOrientation } from './useImageOrientation'
import './ProjectImage.css'

/**
 * A project image inside a frame whose size comes from the frame's CSS (a fixed ratio), never from
 * the image, so nothing moves while it loads. Once loaded, its natural size picks the fit: a
 * landscape image fills the frame (cover, centred); a portrait one (taller than wide, such as a phone
 * screenshot) shows whole (contain) in the middle, on a thin blueprint grid with a soft shadow. The
 * image stays unseen until then, so a phone screenshot never shows cropped first.
 * Used by the project cards, the detail cover and the gallery.
 */
function ProjectImage({ as: Frame = 'div', className = '', src, alt = '', ...imgProps }) {
  const { ref, orientation, onLoad } = useImageOrientation(src)
  return (
    <Frame className={`pub-media ${className}`.trim()} data-orientation={orientation ?? undefined}>
      <img ref={ref} src={src} alt={alt} onLoad={onLoad} {...imgProps} />
    </Frame>
  )
}

export default ProjectImage
