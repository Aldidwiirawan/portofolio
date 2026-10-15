import { useEffect, useRef, useState } from 'react'
import './BlueprintBackground.css'

/**
 * Decorative blueprint backdrop. Place it as the first child of a positioned container.
 *
 * Two grid layers drawn with CSS gradients (main grid every 64 px, fine sub-grid every 16 px) plus
 * crosshair marks on some main intersections, drawn by one repeating SVG mask. No per-cell DOM.
 *
 * - `busy` (login, public): the grid drifts slowly; thin orthogonal circuit traces run along the
 *   sub-grid with soft light flowing through them, and grid intersections glow in turn. Everything
 *   is drawn with repeating 512 px tiles, so it suits areas of any size.
 * - `calm` (admin): still grid with one slow scan line.
 *
 * Animations are transform/opacity only, pause while the tab is hidden or the backdrop is scrolled
 * out of view, and stop completely for reduced motion.
 */
function BlueprintBackground({ variant = 'busy', className = '' }) {
  const rootRef = useRef(null)
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden)
  const [offscreen, setOffscreen] = useState(false)

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)

    let observer
    if (typeof IntersectionObserver !== 'undefined' && rootRef.current) {
      observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting))
      observer.observe(rootRef.current)
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      observer?.disconnect()
    }
  }, [])

  const isBusy = variant !== 'calm'

  return (
    <div
      ref={rootRef}
      className={`bp-bg bp-bg--${isBusy ? 'busy' : 'calm'} ${className}`.trim()}
      data-paused={hidden || offscreen ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div className="bp-grid-mask">
        <div className="bp-grid">
          {isBusy && (
            <>
              <span className="bp-traces" />
              <span className="bp-flow bp-flow--x">
                <i />
              </span>
              <span className="bp-flow bp-flow--y">
                <i />
              </span>
              <span className="bp-nodes bp-nodes--a" />
              <span className="bp-nodes bp-nodes--b" />
            </>
          )}
        </div>
      </div>

      {!isBusy && <div className="bp-scan" />}
    </div>
  )
}

export default BlueprintBackground
