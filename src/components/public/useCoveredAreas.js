/** Whether an element is at least partly on screen (the cats sit on the hero status bar while it shows,
 *  and duck while the contact form shows). */
export function onScreen(element) {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.height > 0
}
