/** True while the opening screen (IntroScreen) covers the page. */
export function isIntroPlaying() {
  return typeof document !== 'undefined' && Boolean(document.querySelector('.pub-intro'))
}
