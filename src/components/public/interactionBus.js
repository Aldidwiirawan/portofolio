// Tiny event bus for the decorative pieces of the public page, which live in separate lazy chunks.
// Example: the footer's "Kembali ke atas" emits 'back-to-top' so the robot can react. Nothing here is
// needed for the page to work.

const listeners = new Map()

/** Subscribes to one event type; returns the function that unsubscribes. */
export function onInteraction(type, listener) {
  if (!listeners.has(type)) listeners.set(type, new Set())
  listeners.get(type).add(listener)
  return () => listeners.get(type)?.delete(listener)
}

export function emitInteraction(type, detail) {
  listeners.get(type)?.forEach((listener) => {
    try {
      listener(detail)
    } catch {
      // A decorative listener must never break the one that emits
    }
  })
}
