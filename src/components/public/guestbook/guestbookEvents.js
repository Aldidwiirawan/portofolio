// Opening the guestbook panel from anywhere on the page (the "Buku Tamu" menu item): the floating button
// owns the panel and listens for this event.
export const GUESTBOOK_OPEN_EVENT = 'pub:guestbook-open'

export function openGuestbook() {
  window.dispatchEvent(new Event(GUESTBOOK_OPEN_EVENT))
}
