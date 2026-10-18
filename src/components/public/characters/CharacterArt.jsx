// The chicken and the duck (BRIEF §6): original SVG drawings in the robot a+ family — simple geometric
// shapes, an ink outline, flat fills from the Blueprint tokens (beak and feet sky, the chicken's comb red).
// Both face right; the parent flips them. The legs are separate groups so they can step, and every eye
// shape (open, asleep, fainted) is drawn so CSS can switch between them by the parent's data-pose.
// Always decorative (aria-hidden).

/** Shapes drawn twice: a thick ink stroke first, then the fill on top, so only the outer outline shows. */
function Silhouette({ children }) {
  return (
    <>
      <g className="pub-char-ink">{children}</g>
      <g className="pub-char-fill">{children}</g>
    </>
  )
}

function Eyes({ cx, cy }) {
  return (
    <>
      <circle className="pub-char-eye pub-char-eye--open" cx={cx} cy={cy} r="1.7" />
      <path className="pub-char-line pub-char-eye--closed" d={`M${cx - 1.8} ${cy + 0.2}Q${cx} ${cy + 1.8} ${cx + 1.8} ${cy + 0.2}`} />
      <path
        className="pub-char-line pub-char-eye--x"
        d={`M${cx - 1.8} ${cy - 1.8}L${cx + 1.8} ${cy + 1.8}M${cx + 1.8} ${cy - 1.8}L${cx - 1.8} ${cy + 1.8}`}
      />
    </>
  )
}

export function ChickenArt() {
  return (
    <svg className="pub-char-art" viewBox="0 0 48 52" aria-hidden="true" focusable="false">
      <g className="pub-char-leg pub-char-leg--a">
        <path className="pub-char-line" d="M18 42.5V49M15.5 49.5H20.5" />
      </g>
      <g className="pub-char-leg pub-char-leg--b">
        <path className="pub-char-line" d="M25 42.5V49M22.5 49.5H27.5" />
      </g>
      <Silhouette>
        <ellipse cx="21" cy="31" rx="14" ry="12" />
        <path d="M10.5 27.5C5.5 25 3.5 18.5 6 14C8 16.6 9.6 17.8 11.2 18.4C10.6 14.6 11.8 11.4 14.6 9.6C15 13.6 16.6 17.4 19.5 20.5Z" />
        <circle cx="32" cy="17" r="8" />
      </Silhouette>
      <path className="pub-char-comb pub-char-part" d="M26.5 11.5C25.5 6.5 29.5 5 31 8.2C31 4 36.5 3.8 35.8 8.6C38.6 6.5 41.2 9.6 38.4 12.4Z" />
      <path className="pub-char-comb pub-char-part" d="M38.6 20.6C36.8 24.2 38.4 26.4 40 24.8C41 23.4 40.6 21.2 38.6 20.6Z" />
      <path className="pub-char-beak pub-char-part" d="M39.6 14.6L46 17.4L39.6 20.2Z" />
      <Eyes cx={34.2} cy={15.6} />
      <path className="pub-char-wing" d="M13.6 30.4C17 27.4 24 27.4 28.2 30.8C25.4 32.6 24.2 36.6 19.6 36.6C16.4 36.6 14.2 34 13.6 30.4Z" />
      <path className="pub-char-line" d="M18.4 33.6L21.2 31.6M22.6 34.8L25 32.6" />
    </svg>
  )
}

export function DuckArt() {
  return (
    <svg className="pub-char-art" viewBox="0 0 56 48" aria-hidden="true" focusable="false">
      <g className="pub-char-leg pub-char-leg--a">
        <path className="pub-char-line" d="M22 43V46.5" />
        <path className="pub-char-beak pub-char-part" d="M18 47.6L22 45.6L26 47.6Z" />
      </g>
      <g className="pub-char-leg pub-char-leg--b">
        <path className="pub-char-line" d="M30 43V46.5" />
        <path className="pub-char-beak pub-char-part" d="M26 47.6L30 45.6L34 47.6Z" />
      </g>
      <Silhouette>
        <path d="M7 31C7 23 12 21.5 18 23.5L30 25.5C38 23 46.5 25 46.5 32.5C46.5 40.5 38.5 43 28.5 43H17C10.5 43 7 38.5 7 31Z" />
        <path d="M8.5 29L3.5 19L13.5 24.5Z" />
        <path d="M30.5 19C30.5 25 31 28 33.5 28H40.5C41.5 25.5 43 22 43 18.5Z" />
        <circle cx="36" cy="14.5" r="8" />
      </Silhouette>
      <path className="pub-char-line" d="M35.5 6.6C34.6 3.4 37.4 2.4 38.4 4.8" />
      <path className="pub-char-beak pub-char-part" d="M42.2 14H49.6C52.8 14 53.4 18.6 50.2 19.2H42.2Z" />
      <Eyes cx={37.6} cy={12.6} />
      <path className="pub-char-wing" d="M16.5 30Q25 27 32.5 31.5Q26 37.5 18 35.5Z" />
    </svg>
  )
}
