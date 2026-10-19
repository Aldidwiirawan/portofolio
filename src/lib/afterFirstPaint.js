// Longest wait for the first paint (a tab opened in the background paints only when it is shown)
const FALLBACK_MS = 800

/**
 * Runs `callback` once the first frame of the page is on screen (stage 3C): for work that should not
 * compete with the first paint, such as fetching content that is not part of it. Waits for the
 * browser's first-contentful-paint entry, which arrives after the frame has been shown; later calls
 * run at once (in a task). Without that signal it runs after FALLBACK_MS.
 * @returns {() => void} cancels the callback
 */
export function afterFirstPaint(callback) {
  let done = false
  let observer = null
  let timer = 0
  const cleanup = () => {
    observer?.disconnect()
    clearTimeout(timer)
  }
  const run = () => {
    if (done) return
    done = true
    cleanup()
    callback()
  }
  const painted = () => typeof performance !== 'undefined' && performance.getEntriesByName?.('first-contentful-paint').length > 0
  if (painted()) {
    timer = setTimeout(run, 0)
  } else {
    try {
      observer = new PerformanceObserver((list) => {
        if (list.getEntriesByName('first-contentful-paint').length > 0) setTimeout(run, 0)
      })
      observer.observe({ type: 'paint', buffered: true })
    } catch {
      // No paint timing: the fallback below
    }
    timer = setTimeout(run, FALLBACK_MS)
  }
  return () => {
    done = true
    cleanup()
  }
}
