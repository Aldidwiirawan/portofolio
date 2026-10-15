import { useEffect, useRef, useState } from 'react'
import './BlueprintBackground.css'

// Measure lines (busy): position in % of the area, length in px, label in mono
const MEASURES = [
  { id: 'm1', axis: 'x', top: '6%', left: '4%', length: 96, label: '96' },
  { id: 'm2', axis: 'y', top: '34%', right: '6%', length: 152, label: '152' },
  { id: 'm3', axis: 'x', bottom: '11%', left: '18%', length: 208, label: '208' },
]

// Small crosshair marks (busy)
const MARKS = [
  { id: 'c1', top: '9%', left: '20%' },
  { id: 'c2', top: '26%', left: '88%' },
  { id: 'c3', top: '62%', left: '5%' },
  { id: 'c4', top: '84%', left: '72%' },
  { id: 'c5', top: '48%', left: '52%' },
]

function Measure({ axis, length, label, style }) {
  const horizontal = axis === 'x'
  const w = horizontal ? length : 28
  const h = horizontal ? 28 : length
  // Dimension line with end ticks, drawn by stroke-dashoffset (pathLength = 1)
  const d = horizontal
    ? `M0 10V22M0 16H${length}M${length} 10V22`
    : `M10 0H22M16 0V${length}M10 ${length}H22`
  return (
    <div className={`bp-measure bp-measure--${axis}`} style={style}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="visible">
        <path className="bp-measure-line" d={d} pathLength="1" />
      </svg>
      <span className="bp-measure-label">{label}</span>
    </div>
  )
}

/**
 * Decorative blueprint backdrop. Place it as the first child of a positioned container.
 *
 * - `busy`: the grid drifts slowly, measure lines draw themselves one after another, small
 *   crosshair marks pulse. Used on the login and public pages.
 * - `calm`: still grid with one slow scan line. Used in the admin panel.
 *
 * Animations pause while the tab is hidden or the backdrop is scrolled out of view, and stop
 * completely for reduced motion (measure lines are then shown fully drawn).
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
        <div className="bp-grid" />
      </div>

      {isBusy ? (
        <>
          {MEASURES.map(({ id, axis, length, label, ...pos }, index) => (
            <Measure
              key={id}
              axis={axis}
              length={length}
              label={label}
              style={{ ...pos, '--bp-delay': `${index * 4}s` }}
            />
          ))}
          {MARKS.map(({ id, ...pos }) => (
            <span key={id} className="bp-mark" style={pos} />
          ))}
        </>
      ) : (
        <div className="bp-scan" />
      )}
    </div>
  )
}

export default BlueprintBackground
