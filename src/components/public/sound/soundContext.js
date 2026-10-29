import { createContext, useContext } from 'react'

/**
 * Sound of the public pages (SoundProvider): { enabled, toggle, play, cue }. play(options) makes one
 * "tok" and cue(name, options) one named sound (pick, drop, jump, hit, land, open, close, zoom, meow)
 * when sound is on and the limits allow it (see tokSynth); both return whether a sound played.
 */
export const SoundContext = createContext({ enabled: false, toggle: () => {}, play: () => false, cue: () => false })

export function useSound() {
  return useContext(SoundContext)
}
