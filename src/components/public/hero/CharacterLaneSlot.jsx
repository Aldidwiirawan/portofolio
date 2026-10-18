import { lazy, Suspense, useRef } from 'react'
import { useNearViewport } from '../useNearViewport'

const CharacterLane = lazy(() => import('../characters/CharacterLane'))

/**
 * The lane above the status bar line where the chicken and the duck walk (stage 3B). The characters,
 * their lines and behaviour are a separate chunk, loaded when the status bar comes near the screen.
 * Decorative: aria-hidden; only the characters themselves take clicks.
 */
function CharacterLaneSlot() {
  const laneRef = useRef(null)
  const near = useNearViewport(laneRef, '200px')

  return (
    <div ref={laneRef} className="pub-lane" aria-hidden="true">
      {near && (
        <Suspense fallback={null}>
          <CharacterLane laneRef={laneRef} />
        </Suspense>
      )}
    </div>
  )
}

export default CharacterLaneSlot
