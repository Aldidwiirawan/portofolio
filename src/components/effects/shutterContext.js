import { createContext, useContext } from 'react'

/** Without a <ShutterProvider>, navigation still happens (no animation). */
const fallback = {
  runShutter: ({ onCovered } = {}) => onCovered?.(),
}

export const ShutterContext = createContext(fallback)

/**
 * Access the camera-shutter page transition provided by <ShutterProvider>.
 * @returns {{ runShutter: (options: {
 *   onCovered?: () => void,
 *   isReady?: () => boolean,
 *   message?: string,
 *   focusSelector?: string,
 * }) => void }}
 */
export function useShutter() {
  return useContext(ShutterContext)
}
