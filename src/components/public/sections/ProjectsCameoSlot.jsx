import { lazy, Suspense, useRef, useState } from 'react'
import { useMediaQuery, usePrefersReducedMotion } from '../../../lib/useMediaQuery'
import { readStorage } from '../../../lib/safeStorage'
import { CAMEO_STORAGE_KEY } from '../characters/cameoKey'
import { useNearViewport } from '../useNearViewport'

const ProjectsCameo = lazy(() => import('../characters/ProjectsCameo'))

/**
 * Room next to the "Proyek" heading where the chicken shows up once per visit (stage 3B, owner K4):
 * the hero, where it lives, is off screen by then. Only from 1024 px (narrower screens have no room
 * beside the heading) and never with reduced motion. Decorative: aria-hidden.
 */
function ProjectsCameoSlot() {
  const slotRef = useRef(null)
  const wide = useMediaQuery('(min-width: 1024px)')
  const reducedMotion = usePrefersReducedMotion()
  const [seen] = useState(() => readStorage(CAMEO_STORAGE_KEY, 'session') === '1')
  const [done, setDone] = useState(false)
  const near = useNearViewport(slotRef, '300px')
  const play = wide && !reducedMotion && !seen && !done

  return (
    <div ref={slotRef} className="pub-cameo-slot" aria-hidden="true">
      {play && near && (
        <Suspense fallback={null}>
          <ProjectsCameo slotRef={slotRef} onDone={() => setDone(true)} />
        </Suspense>
      )}
    </div>
  )
}

export default ProjectsCameoSlot
