// Behaviour of the chicken and the duck in the hero status bar (BRIEF §6). Plain JS, no React: it moves
// the two characters with transform, sets their pose (data-pose, styled by characters.css) and asks the
// React component to show a speech bubble. Every timer runs on a clock that pauses while the lane is off
// screen or the tab is hidden; the movement loop only runs while someone walks.

import { CHARACTER_LINES as L, timeOfDay } from '../../../i18n/characterLines'

const WHO = ['chicken', 'duck']
const CHAT_MS = [10000, 15000] // owner, 19 Oct 2026
const BUBBLE_MS = [2000, 3000]
const DUCK_LAG_MS = 400 // the duck is a little slow
const SPEED = { chicken: 34, duck: 22 } // px per second
const RUN_SPEED = 160
const PAUSE_MS = { chicken: [1200, 3500], duck: [2500, 5500] }
const MIN_STEP = 60
const FLEE_RADIUS = 95
const CALM_RELEASE = 140
const FAST_POINTER = 0.35 // px per ms: faster than this is "rushing at them"
const FLEE_DISTANCE = 160
const FLEE_LINE_GAP_MS = 4000
const CALM_LINE_GAP_MS = 20000
const JUMP_MS = 480
const TAP_MS = 300
const TAP_MOVE = 10
const CLICK_CHAIN_MS = 1500
const EGG_CLICKS = 10
const FAINT_MS = 3000
const IDLE_ASK_MS = 40000
const IDLE_SLEEP_MS = 20000
const IDLE_CHECK_MS = 5000
const IMPACT_RADIUS = 120
const IMPACT_GAP_MS = 12000
const MEET_GAP = 40
const FAB_GAP = 24
const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart']

const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** setTimeout that can be paused and resumed as a whole. */
function createClock() {
  let paused = true
  const jobs = new Set()
  const arm = (job) => {
    job.due = performance.now() + job.remaining
    job.timer = setTimeout(() => {
      jobs.delete(job)
      job.fn()
    }, job.remaining)
  }
  return {
    after(ms, fn) {
      const job = { fn, remaining: ms, due: 0, timer: 0 }
      jobs.add(job)
      if (!paused) arm(job)
      return () => {
        clearTimeout(job.timer)
        jobs.delete(job)
      }
    },
    pause() {
      if (paused) return
      paused = true
      const now = performance.now()
      for (const job of jobs) {
        clearTimeout(job.timer)
        job.remaining = Math.max(0, job.due - now)
      }
    },
    resume() {
      if (!paused) return
      paused = false
      for (const job of jobs) arm(job)
    },
    clear() {
      for (const job of jobs) clearTimeout(job.timer)
      jobs.clear()
    },
  }
}

/**
 * @param {object} options
 * @param {HTMLElement} options.lane the lane above the status bar line
 * @param {{ chicken: HTMLElement, duck: HTMLElement }} options.els character wrappers (.pub-char)
 * @param {() => HTMLElement | null} options.getBubble the bubble element, once React rendered it
 * @param {(bubble: { who: string, line: object } | null) => void} options.show React shows the line text
 * @param {(line: object) => string} options.textOf text of a line in the current language
 * @param {() => { hasCv: boolean }} options.context
 * @param {(who: string) => void} options.onJump sound of a jump
 * @param {boolean} options.reduced reduced motion: still, no automatic talk
 * @param {boolean} options.finePointer mouse/pen with hover: they run from a cursor that rushes at them
 */
export function createCharacterDirector({ lane, els, getBubble, show, textOf, context, onJump, reduced, finePointer }) {
  const clock = createClock()
  const chars = Object.fromEntries(
    WHO.map((who) => [who, { who, el: els[who], x: 0, w: 48, h: 48, dir: who === 'chicken' ? 1 : -1, mode: 'idle', target: 0, speed: 0, cancelPause: null, lastFleeLine: -Infinity, calm: false, clicks: 0, lastClick: 0, tap: null }])
  )
  let laneW = 0
  let limit = { min: 0, max: 0 }
  let active = false
  let started = false
  let raf = 0
  let lastFrame = 0
  let bubble = null // { who, line, priority, cancel }
  let lastLine = null
  let conversation = null // { cancels: [] }
  let usedTimeOfDay = false
  let usedThanks = false
  let lastConversation = null
  let chatCancel = null
  let greeted = false
  let chats = 0
  let lastCalmLine = -Infinity
  let lastImpact = -Infinity
  let lastActivity = performance.now()
  let idleState = 'awake' // awake | asked | asleep
  const pointer = { x: -1, y: -1, t: 0, speed: 0, frame: 0 }

  // --- layout -------------------------------------------------------------------------------------
  function measure() {
    laneW = lane.clientWidth
    let right = laneW
    // Never walk under the floating guestbook button
    const fab = document.querySelector('.pub-gb-fab')
    if (fab) {
      const laneBox = lane.getBoundingClientRect()
      const fabBox = fab.getBoundingClientRect()
      if (fabBox.width > 0 && fabBox.left < laneBox.right) right = Math.min(right, fabBox.left - laneBox.left - FAB_GAP)
    }
    for (const c of Object.values(chars)) {
      c.w = c.el.offsetWidth || 48
      // Height of the drawing itself (the touch area around it is taller): bubbles sit just above it
      c.h = Math.round(c.el.querySelector('.pub-char-art')?.getBoundingClientRect().height || c.el.offsetHeight || 44)
    }
    const w = Math.max(chars.chicken.w, chars.duck.w)
    limit = { min: 0, max: Math.max(0, right - w) }
  }

  function setX(c, x) {
    c.x = x
    c.el.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`
  }

  function face(c, dir) {
    c.dir = dir
    c.el.dataset.dir = String(dir)
  }

  function pose(c, name) {
    c.el.dataset.pose = name
  }

  function place() {
    measure()
    const span = limit.max - limit.min
    if (reduced) {
      // Still, side by side, facing each other
      setX(chars.chicken, limit.min + span * 0.55)
      setX(chars.duck, Math.min(limit.max, chars.chicken.x + chars.chicken.w + 12))
    } else {
      setX(chars.chicken, limit.min + span * 0.3)
      setX(chars.duck, Math.min(limit.max, Math.max(limit.min + span * 0.45, chars.chicken.x + chars.chicken.w + 12)))
    }
    face(chars.chicken, 1)
    face(chars.duck, -1)
    for (const c of Object.values(chars)) pose(c, 'stand')
  }

  // --- speech -------------------------------------------------------------------------------------
  function bubbleMs(line) {
    return clamp(BUBBLE_MS[0] + textOf(line).length * 40, BUBBLE_MS[0], BUBBLE_MS[1])
  }

  /** Shows a line above `who`. Higher priority interrupts lower; small talk never repeats itself. */
  function say(who, line, { priority = 1, ms } = {}) {
    if (!line) return false
    if (bubble && bubble.priority > priority) return false
    if (priority <= 1 && line === lastLine) return false
    bubble?.cancel()
    const c = chars[who]
    c.el.dataset.talk = c.el.dataset.talk === '1' ? '0' : '1'
    lastLine = line
    const duration = ms ?? bubbleMs(line)
    bubble = { who, line, priority, cancel: clock.after(duration, hide) }
    show({ who, line })
    // A reaction, jump or run line counts as talk: the next small talk waits its full pause after it
    if (priority >= 2 && !conversation && chatCancel) scheduleChat(duration + rand(...CHAT_MS))
    return true
  }

  function hide() {
    bubble?.cancel()
    bubble = null
    show(null)
  }

  /** Called by React after the bubble text rendered, and every frame while the speaker moves. */
  function positionBubble() {
    const el = getBubble()
    if (!el || !bubble) return
    const c = chars[bubble.who]
    const width = el.offsetWidth
    const center = c.x + c.w / 2
    const left = clamp(center - width / 2, 0, Math.max(0, laneW - width))
    el.style.transform = `translate3d(${left.toFixed(1)}px, 0, 0)`
    el.style.bottom = `${c.h + 6}px`
    el.style.setProperty('--tail', `${(center - left).toFixed(1)}px`)
  }

  // --- movement -----------------------------------------------------------------------------------
  const moving = (c) => c.mode === 'walk' || c.mode === 'flee' || c.mode === 'meet'

  function frame(now) {
    raf = 0
    const dt = Math.min(0.05, (now - (lastFrame || now)) / 1000)
    lastFrame = now
    let anyone = false
    for (const c of Object.values(chars)) {
      if (!moving(c)) continue
      const step = c.speed * dt
      const distance = c.target - c.x
      if (Math.abs(distance) <= step) {
        setX(c, c.target)
        arrive(c)
      } else {
        setX(c, c.x + Math.sign(distance) * step)
        anyone = true
      }
    }
    positionBubble()
    if (anyone || Object.values(chars).some(moving)) raf = requestAnimationFrame(frame)
    else lastFrame = 0
  }

  function startLoop() {
    if (!active || raf) return
    lastFrame = 0
    raf = requestAnimationFrame(frame)
  }

  function walkTo(c, x, { speed = SPEED[c.who], mode = 'walk', look = 'walk' } = {}) {
    c.cancelPause?.()
    c.cancelPause = null
    c.target = clamp(x, limit.min, limit.max)
    c.mode = mode
    if (Math.abs(c.target - c.x) < 1) {
      arrive(c)
      return
    }
    face(c, c.target > c.x ? 1 : -1)
    c.speed = speed
    pose(c, look)
    startLoop()
  }

  function arrive(c) {
    const wasMeeting = c.mode === 'meet'
    c.mode = 'idle'
    pose(c, 'stand')
    if (wasMeeting) {
      c.met = true
      if (chars.chicken.met && chars.duck.met) talkTogether()
      return
    }
    rest(c)
  }

  /** Stands still a moment (the chicken sometimes pecks), then walks somewhere else. */
  function rest(c, ms = rand(...PAUSE_MS[c.who])) {
    c.cancelPause?.()
    if (reduced || idleState === 'asleep') return
    if (c.who === 'chicken' && Math.random() < 0.35) {
      pose(c, 'peck')
      clock.after(600, () => {
        if (c.mode === 'idle' && c.el.dataset.pose === 'peck') pose(c, 'stand')
      })
    }
    c.cancelPause = clock.after(ms, () => wander(c))
  }

  function wander(c) {
    c.cancelPause = null
    if (c.mode !== 'idle' || c.calm || conversation || idleState === 'asleep') return
    let x = c.x
    for (let i = 0; i < 6 && Math.abs(x - c.x) < MIN_STEP; i += 1) x = rand(limit.min, limit.max)
    walkTo(c, x)
  }

  function stop(c, look = 'stand') {
    c.cancelPause?.()
    c.cancelPause = null
    c.mode = 'idle'
    c.met = false
    pose(c, look)
  }

  // --- talking: greeting, small talk, conversations ------------------------------------------------
  function greet() {
    say('chicken', L.greet.chicken, { priority: 2 })
    clock.after(bubbleMs(L.greet.chicken) + 300 + DUCK_LAG_MS, () => {
      say('duck', L.greet.duck, { priority: 2 })
      clock.after(bubbleMs(L.greet.duck), () => {
        greeted = true
      })
      if (reduced) return
      clock.after(1200, () => {
        rest(chars.chicken, 400)
        rest(chars.duck, 1400)
      })
      scheduleChat(bubbleMs(L.greet.duck) + rand(...CHAT_MS))
    })
  }

  /** The next small talk, a pause of 10–15 s after the last talk ended (owner, 19 Oct 2026). */
  function scheduleChat(ms = rand(...CHAT_MS)) {
    chatCancel?.()
    chatCancel = clock.after(ms, chat)
  }

  function busy(c) {
    return c.mode === 'flee' || c.mode === 'jump' || c.mode === 'faint'
  }

  function chat() {
    chatCancel = null
    if (idleState === 'asleep') return // wake() starts the talk again
    if (bubble || conversation || Object.values(chars).some(busy)) {
      scheduleChat(3000)
      return
    }
    chats += 1
    let line = null
    let who = 'chicken'
    if (!usedTimeOfDay) {
      usedTimeOfDay = true
      line = L.timeOfDay[timeOfDay()]
      who = line.who
    } else if (!usedThanks && chats >= 4) {
      usedThanks = true
      line = L.thanks
      who = line.who
    } else if (Math.random() < 0.3 && !chars.chicken.calm && !chars.duck.calm) {
      const pair = pick(L.conversations.filter((p) => p !== lastConversation))
      lastConversation = pair
      startConversation(pair) // the next pause starts when the conversation ends
      return
    } else if (Math.random() < 2 / 3) {
      const pool = context().hasCv ? [...L.chatter.chicken, L.chatter.chickenCv] : L.chatter.chicken
      line = pick(pool.filter((entry) => entry !== lastLine))
    } else {
      who = 'duck'
      line = pick(L.chatter.duck.filter((entry) => entry !== lastLine))
    }
    say(who, line)
    scheduleChat(bubbleMs(line) + rand(...CHAT_MS))
  }

  /** Both walk to meet in the middle, face each other, and say the two lines. */
  function startConversation(pair) {
    const [a, b] = WHO.map((who) => chars[who]).sort((p, q) => p.x - q.x)
    const middle = clamp((a.x + a.w + b.x) / 2, limit.min + a.w + MEET_GAP / 2, limit.max - MEET_GAP / 2)
    conversation = { pair, cancels: [] }
    a.met = false
    b.met = false
    walkTo(a, middle - MEET_GAP / 2 - a.w, { mode: 'meet' })
    walkTo(b, middle + MEET_GAP / 2, { mode: 'meet' })
  }

  function talkTogether() {
    const current = conversation
    if (!current) return
    const [a, b] = WHO.map((who) => chars[who]).sort((p, q) => p.x - q.x)
    face(a, 1)
    face(b, -1)
    const [[firstWho, first], [secondWho, second]] = current.pair
    say(firstWho, first, { priority: 2 })
    current.cancels.push(
      clock.after(bubbleMs(first) + 500 + (secondWho === 'duck' ? DUCK_LAG_MS : 0), () => {
        if (conversation !== current) return
        say(secondWho, second, { priority: 2 })
        current.cancels.push(clock.after(bubbleMs(second) + 600, () => endConversation(current)))
      })
    )
  }

  function endConversation(current = conversation) {
    if (!current || conversation !== current) return
    current.cancels.forEach((cancel) => cancel())
    conversation = null
    for (const c of Object.values(chars)) {
      c.met = false
      if (c.mode === 'meet') stop(c)
      if (c.mode === 'idle') rest(c)
    }
    if (idleState !== 'asleep') scheduleChat()
  }

  // --- the mouse: run when it rushes at them, stay when it comes slowly (desktop) -------------------
  function onPointerMove(event) {
    if (event.pointerType === 'touch') return
    const now = performance.now()
    if (pointer.t) {
      const dt = Math.max(1, now - pointer.t)
      const speed = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) / dt
      pointer.speed = pointer.speed * 0.5 + speed * 0.5
    }
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.t = now
    if (!pointer.frame) pointer.frame = requestAnimationFrame(checkPointer)
  }

  function checkPointer() {
    pointer.frame = 0
    if (!active || idleState === 'asleep') return
    const box = lane.getBoundingClientRect()
    const px = pointer.x - box.left
    const py = pointer.y - box.top
    for (const c of Object.values(chars)) {
      if (c.mode === 'jump' || c.mode === 'faint') continue
      const cx = c.x + c.w / 2
      const cy = box.height - c.h / 2
      const distance = Math.hypot(px - cx, py - cy)
      if (distance < FLEE_RADIUS) {
        if (pointer.speed > FAST_POINTER) {
          if (c.who === 'duck') {
            // The duck notices a moment later
            if (!c.fleePending) {
              c.fleePending = true
              clock.after(DUCK_LAG_MS / 2, () => {
                c.fleePending = false
                flee(c, px)
              })
            }
          } else flee(c, px)
        } else calmDown(c, px)
      } else if (c.calm && distance > CALM_RELEASE) {
        c.calm = false
        rest(c, 1000)
      }
    }
  }

  function onPointerOut(event) {
    if (event.relatedTarget) return
    // The mouse left the window: whoever was watching it goes back to walking
    for (const c of Object.values(chars)) {
      if (!c.calm) continue
      c.calm = false
      rest(c, 1000)
    }
  }

  function flee(c, px) {
    if (c.mode === 'flee' || c.mode === 'faint' || c.mode === 'jump') return
    if (conversation) endConversation()
    c.calm = false
    const cx = c.x + c.w / 2
    let dir = cx >= px ? 1 : -1
    const room = (d) => (d > 0 ? limit.max - c.x : c.x - limit.min)
    if (room(dir) < MIN_STEP) dir = -dir // cornered on one side: dash past
    const now = performance.now()
    const useLine = now - c.lastFleeLine > FLEE_LINE_GAP_MS
    if (room(dir) < MIN_STEP) {
      // Nowhere to go: tremble with "!"
      stop(c, 'shake')
      say(c.who, L.alarm, { priority: 3, ms: 900 })
      clock.after(700, () => c.el.dataset.pose === 'shake' && rest(c))
      return
    }
    if (useLine) c.lastFleeLine = now
    say(c.who, useLine ? pick(L.flee[c.who]) : L.alarm, { priority: 3, ms: useLine ? 1600 : 900 })
    walkTo(c, c.x + dir * FLEE_DISTANCE, { speed: RUN_SPEED, mode: 'flee', look: 'run' })
  }

  function calmDown(c, px) {
    if (c.calm || c.mode === 'flee') return
    c.calm = true
    if (c.mode === 'meet') endConversation()
    stop(c)
    face(c, px > c.x + c.w / 2 ? 1 : -1)
    const now = performance.now()
    if (c.who === L.calm.who && now - lastCalmLine > CALM_LINE_GAP_MS) {
      lastCalmLine = now
      say(c.who, L.calm)
    }
  }

  // --- clicks and taps: jump; ten in a row: the easter egg ------------------------------------------
  function onCharacterPointerDown(c, event) {
    if (event.pointerType === 'touch') {
      // A tap jumps; a swipe that starts on a character still scrolls the page
      // Event times (not handling times): a busy phone that handles the tap late still sees a tap
      c.tap = { id: event.pointerId, x: event.clientX, y: event.clientY, t: event.timeStamp }
      return
    }
    if (event.button !== 0) return
    event.preventDefault() // focus stays where it was
    hit(c)
  }

  function onCharacterPointerUp(c, event) {
    const tap = c.tap
    c.tap = null
    if (!tap || tap.id !== event.pointerId) return
    if (event.timeStamp - tap.t < TAP_MS && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) < TAP_MOVE) hit(c)
  }

  function onCharacterPointerCancel(c) {
    c.tap = null
  }

  function hit(c) {
    activity()
    if (c.mode === 'faint') return
    const now = performance.now()
    c.clicks = now - c.lastClick < CLICK_CHAIN_MS ? c.clicks + 1 : 1
    c.lastClick = now
    if (c.clicks >= EGG_CLICKS) {
      c.clicks = 0
      faint(c)
      return
    }
    jump(c)
  }

  function jump(c) {
    if (conversation) endConversation()
    say(c.who, pick(L.jump[c.who]), { priority: 3, ms: 1000 })
    if (reduced) return
    const resume = c.mode === 'walk' ? c.target : null
    stop(c, 'jump')
    c.mode = 'jump'
    c.el.dataset.cue = c.el.dataset.cue === '1' ? '0' : '1'
    const token = (c.jumpToken = (c.jumpToken || 0) + 1)
    onJump(c.who)
    clock.after(JUMP_MS, () => {
      if (c.mode !== 'jump' || c.jumpToken !== token) return
      stop(c)
      if (resume != null && !c.calm) walkTo(c, resume)
      else rest(c)
    })
  }

  function faint(c) {
    if (conversation) endConversation()
    stop(c, 'faint')
    c.mode = 'faint'
    say(c.who, L.easterEgg[c.who], { priority: 4, ms: 2600 })
    clock.after(FAINT_MS, () => {
      stop(c)
      if (c.who === 'chicken') say('chicken', L.easterEgg.recover, { priority: 2 })
      rest(c)
    })
  }

  // --- a visitor who does nothing for a while ----------------------------------------------------------
  function activity() {
    lastActivity = performance.now()
    if (idleState === 'asleep') wake()
    else idleState = 'awake'
  }

  function checkIdle() {
    if (!reduced) clock.after(IDLE_CHECK_MS, checkIdle)
    const quiet = performance.now() - lastActivity
    if (idleState === 'awake' && quiet > IDLE_ASK_MS && !bubble) {
      idleState = 'asked'
      say(L.idle.stillThere.who, L.idle.stillThere, { priority: 2 })
    } else if (idleState === 'asked' && quiet > IDLE_ASK_MS + IDLE_SLEEP_MS) {
      sleep()
    }
  }

  function sleep() {
    idleState = 'asleep'
    if (conversation) endConversation()
    hide()
    for (const c of Object.values(chars)) stop(c, 'sleep')
  }

  function wake() {
    idleState = 'awake'
    for (const c of Object.values(chars)) stop(c)
    say(L.idle.wake.who, L.idle.wake, { priority: 2 })
    rest(chars.chicken, 1500)
    rest(chars.duck, 2500)
    scheduleChat(bubbleMs(L.idle.wake) + rand(...CHAT_MS))
  }

  // --- listeners ----------------------------------------------------------------------------------------
  const characterListeners = Object.values(chars).map((c) => {
    const handlers = {
      pointerdown: (event) => onCharacterPointerDown(c, event),
      pointerup: (event) => onCharacterPointerUp(c, event),
      pointercancel: () => onCharacterPointerCancel(c),
    }
    Object.entries(handlers).forEach(([type, fn]) => c.el.addEventListener(type, fn))
    return () => Object.entries(handlers).forEach(([type, fn]) => c.el.removeEventListener(type, fn))
  })

  function listen(on) {
    const method = on ? 'addEventListener' : 'removeEventListener'
    if (!reduced) ACTIVITY_EVENTS.forEach((type) => window[method](type, activity, { capture: true, passive: true }))
    if (finePointer && !reduced) {
      window[method]('pointermove', onPointerMove, { passive: true })
      document[method]('pointerout', onPointerOut, { passive: true })
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    measure()
    for (const c of Object.values(chars)) {
      setX(c, clamp(c.x, limit.min, limit.max))
      if (moving(c)) c.target = clamp(c.target, limit.min, limit.max)
    }
    positionBubble()
  })
  resizeObserver.observe(lane)

  return {
    /** Lane on screen, tab visible and opening screen gone: the characters live; otherwise all pauses. */
    setActive(next) {
      if (next === active) return
      active = next
      if (active) {
        if (!started) {
          started = true
          place()
          clock.resume()
          clock.after(600, greet)
          if (!reduced) clock.after(IDLE_CHECK_MS, checkIdle)
        } else {
          clock.resume()
          measure()
        }
        lastActivity = performance.now()
        listen(true)
        lane.removeAttribute('data-paused')
        if (Object.values(chars).some(moving)) startLoop()
      } else {
        clock.pause()
        cancelAnimationFrame(raf)
        raf = 0
        cancelAnimationFrame(pointer.frame)
        pointer.frame = 0
        listen(false)
        lane.setAttribute('data-paused', '')
      }
    },
    /** Something the visitor did: 'dark', 'light', 'toEnglish', 'toIndonesian', 'impact' ({ x }). */
    react(kind, detail) {
      if (!greeted || !active || reduced || idleState === 'asleep') return
      if (kind === 'impact') {
        const now = performance.now()
        if (now - lastImpact < IMPACT_GAP_MS) return
        const box = lane.getBoundingClientRect()
        const near = ['duck', 'chicken'].find((who) => Math.abs(detail.x - (box.left + chars[who].x + chars[who].w / 2)) < IMPACT_RADIUS)
        if (!near) return
        lastImpact = now
        clock.after(near === 'duck' ? DUCK_LAG_MS : 0, () => say(near, L.react.labelNear[near], { priority: 2 }))
        return
      }
      const line = L.react[kind]
      if (!line) return
      clock.after(line.who === 'duck' ? DUCK_LAG_MS : 150, () => say(line.who, line, { priority: 2 }))
    },
    positionBubble,
    destroy() {
      active = false
      clock.clear()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pointer.frame)
      listen(false)
      characterListeners.forEach((off) => off())
      resizeObserver.disconnect()
    },
  }
}
