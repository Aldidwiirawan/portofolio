import { createContext, useContext } from 'react'

/**
 * Sound of the public pages (SoundProvider): { enabled, toggle, play }. play(options) makes one "tok"
 * when sound is on and the limits allow it (see tokSynth.playTok); it returns whether it played.
 */
export const SoundContext = createContext({ enabled: false, toggle: () => {}, play: () => false })

export function useSound() {
  return useContext(SoundContext)
}
