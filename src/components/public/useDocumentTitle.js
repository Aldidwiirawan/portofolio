import { useEffect } from 'react'

/** Sets the tab title while the page is shown and puts the previous one back afterwards. */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return undefined
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
