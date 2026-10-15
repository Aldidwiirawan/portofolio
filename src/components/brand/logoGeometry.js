// Geometry of the ALDI monogram. Must stay identical to public/logo.svg (same ids and path data);
// the brand check compares both. Grid: 16-unit module in a 512 viewBox, see
// design-system/aldi-portfolio/screenshots/logo-check/metrics.md.

export const LOGO_VIEWBOX = '0 0 512 512'

// `from` is where each piece starts when the logo assembles itself (viewBox units).
// Every piece arrives from a different direction, roughly away from its own position.
export const LOGO_PIECES = [
  { id: 'logo-i-cap', d: 'M24 24H172L121.5 96H24Z', from: [-112, -64] },
  { id: 'logo-i', d: 'M40 128H104V416H120V488H24V416H40Z', from: [-144, 0] },
  { id: 'logo-a-left', d: 'M204 24H274L190 144H232V128H250L286 200H152L120 245.5V144Z', from: [-48, -144] },
  { id: 'logo-a-right', d: 'M283 34L392 252V280H328V252L245.5 87.5Z', from: [64, -144] },
  { id: 'logo-l', d: 'M157 216H200V416H392V488H136V245.5Z', from: [0, 144] },
  { id: 'logo-d-cap', d: 'M294 24H488V112A80 80 0 0 0 440 96H330Z', from: [128, -96] },
  {
    id: 'logo-d',
    d: 'M346 128H440A48 48 0 0 1 488 176V328A56 56 0 0 1 432 384H232V216H296V312H424V200H382Z',
    from: [144, 0],
  },
  { id: 'logo-d-foot', d: 'M424 415.5A88 88 0 0 0 488 396V488H424Z', from: [112, 112] },
]
