// "Tok" sounds made with the Web Audio API (no audio files): a short falling sine, like a small wood
// block, plus a tiny filtered noise click. Rate limited, so a pile of falling labels never turns into
// noise. The AudioContext only exists after a visitor gesture (browser autoplay rules).

const MIN_GAP_MS = 45 // between any two sounds
const MAX_PER_SECOND = 12
const PER_SOURCE_GAP_MS = 120 // the same label (or character) at most every 120 ms
const MAX_VOLUME = 0.35
const BASE_HZ = 900

let ctx = null
let output = null
let noise = null
let lastAt = -Infinity
const recent = [] // start times within the last second
const lastBySource = new Map()

function AudioContextClass() {
  if (typeof window === 'undefined') return null
  return window.AudioContext || window.webkitAudioContext || null
}

function setup() {
  const Ctx = AudioContextClass()
  if (!Ctx) return false
  try {
    ctx = new Ctx()
  } catch {
    ctx = null
    return false
  }
  // A gentle compressor keeps several sounds at once from clipping
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -18
  compressor.ratio.value = 6
  output = ctx.createGain()
  output.gain.value = 0.9
  output.connect(compressor)
  compressor.connect(ctx.destination)
  // 40 ms of white noise, made once in memory, for the click at the start of every tok
  noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.04), ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  return true
}

/**
 * Creates the audio context if needed and resumes it. Call it from a click, tap or key press.
 * @returns {Promise<boolean>} true once audio can play
 */
export function unlockAudio() {
  if (!ctx && !setup()) return Promise.resolve(false)
  if (ctx.state === 'running') return Promise.resolve(true)
  return ctx
    .resume()
    .then(() => ctx.state === 'running')
    .catch(() => false)
}

/** Suspends the audio context (hidden tab, sound switched off) or resumes it again. */
export function setAudioPaused(paused) {
  if (!ctx) return
  if (paused && ctx.state === 'running') ctx.suspend().catch(() => {})
  else if (!paused && ctx.state === 'suspended') ctx.resume().catch(() => {})
}

/**
 * Plays one tok, unless the limits say it would be too much.
 * @param {{ strength?: number, pitch?: number, source?: unknown }} [options]
 *   strength 0..1 (how hard: impact speed), pitch multiplier (1 = label, higher for a small jump,
 *   lower for a big label), source = what made the sound (for the per-source limit)
 * @returns {boolean} whether it played
 */
export function playTok({ strength = 0.5, pitch = 1, source } = {}) {
  if (!ctx || ctx.state !== 'running') return false
  const now = performance.now()
  if (now - lastAt < MIN_GAP_MS) return false
  while (recent.length > 0 && now - recent[0] > 1000) recent.shift()
  if (recent.length >= MAX_PER_SECOND) return false
  if (source != null) {
    const previous = lastBySource.get(source)
    if (previous && now - previous < PER_SOURCE_GAP_MS) return false
    if (lastBySource.size > 64) lastBySource.clear()
    lastBySource.set(source, now)
  }
  lastAt = now
  recent.push(now)

  const t = ctx.currentTime
  const volume = MAX_VOLUME * Math.min(1, Math.max(0.08, strength))
  const hz = BASE_HZ * pitch * (0.92 + Math.random() * 0.16)

  // Body: a sine that drops quickly in pitch and fades in under 0.1 s
  const tone = ctx.createOscillator()
  tone.type = 'sine'
  tone.frequency.setValueAtTime(hz, t)
  tone.frequency.exponentialRampToValueAtTime(hz * 0.55, t + 0.06)
  const toneGain = ctx.createGain()
  toneGain.gain.setValueAtTime(0.0001, t)
  toneGain.gain.exponentialRampToValueAtTime(volume, t + 0.003)
  toneGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  tone.connect(toneGain)
  toneGain.connect(output)
  tone.start(t)
  tone.stop(t + 0.1)

  // Attack: a 20 ms band of noise, the "knock" of wood
  const click = ctx.createBufferSource()
  click.buffer = noise
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 2600 * pitch
  band.Q.value = 1.2
  const clickGain = ctx.createGain()
  clickGain.gain.setValueAtTime(volume * 0.5, t)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02)
  click.connect(band)
  band.connect(clickGain)
  clickGain.connect(output)
  click.start(t)
  click.stop(t + 0.03)

  tone.onended = () => {
    tone.disconnect()
    toneGain.disconnect()
    click.disconnect()
    band.disconnect()
    clickGain.disconnect()
  }
  return true
}
