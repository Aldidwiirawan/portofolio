import { Suspense, useRef } from 'react'
import { lazyDecor, useNearViewport } from '../useNearViewport'

const GithubActivity = lazyDecor(() => import('./GithubActivity'))

/**
 * Place of the GitHub contribution calendar at the end of the projects section (stage 3C, K5). Its code
 * and data load only when the visitor gets near; a chunk that cannot load leaves nothing behind.
 */
function GithubActivitySlot() {
  const slotRef = useRef(null)
  const near = useNearViewport(slotRef, '600px')
  return (
    <div ref={slotRef} className="pub-gh-slot">
      {near && (
        <Suspense fallback={null}>
          <GithubActivity />
        </Suspense>
      )}
    </div>
  )
}

export default GithubActivitySlot
