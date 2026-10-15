import { useId } from 'react'
import { LOGO_PIECES, LOGO_VIEWBOX } from './logoGeometry'
import './Logo.css'

const ASSEMBLE_STAGGER_MS = 25

// At odd multiples of 32 px (32, 96, …) the 8-unit grid lands on half pixels. Shifting the
// viewBox by 8 units puts every vertical edge on a whole pixel (the logo moves 1/64 of its size).
const SNAPPED_VIEWBOX = '8 8 512 512'

/**
 * ALDI monogram as inline SVG. It uses `currentColor`, so it follows the surrounding text color.
 *
 * - `title`: accessible name. Without it the logo is decorative and hidden from assistive tech.
 * - `assemble`: on mount, every piece slides in from its own direction (about 0.75 s in total).
 *   Skipped when the visitor prefers reduced motion. Remount (change `key`) to replay.
 * - Other props go to the <svg>, so the logo can also be nested inside another SVG (x, y).
 */
function Logo({ size = 48, title, assemble = false, className = '', ...rest }) {
  const titleId = useId()
  const classes = ['brand-logo', assemble && 'brand-logo--assemble', className].filter(Boolean).join(' ')
  const a11y = title ? { role: 'img', 'aria-labelledby': titleId } : { 'aria-hidden': true }
  const viewBox = size % 64 === 32 ? SNAPPED_VIEWBOX : LOGO_VIEWBOX

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      className={classes}
      focusable="false"
      {...a11y}
      {...rest}
    >
      {title && <title id={titleId}>{title}</title>}
      <g fill="currentColor">
        {LOGO_PIECES.map((piece, index) => (
          <path
            key={piece.id}
            d={piece.d}
            className="brand-logo-piece"
            data-piece={piece.id}
            style={
              assemble
                ? {
                    '--from-x': `${piece.from[0]}px`,
                    '--from-y': `${piece.from[1]}px`,
                    '--delay': `${index * ASSEMBLE_STAGGER_MS}ms`,
                  }
                : undefined
            }
          />
        ))}
      </g>
    </svg>
  )
}

export default Logo
