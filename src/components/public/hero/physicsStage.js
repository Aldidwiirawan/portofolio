// Physics labels of the hero stage (BRIEF §5), loaded on demand: this module and matter-js form their
// own chunk, imported only when the stage is on screen (usePhysicsStage). The labels stay HTML: the
// static pile of stage 3A keeps the stage height, copies of its labels are placed in a layer on top and
// moved with transform from the matter-js bodies.

import Matter from 'matter-js'
import { emitInteraction } from '../interactionBus'

const { Bodies, Body, Composite, Constraint, Engine, Events, Sleeping, Vector } = Matter

const STEP_MS = 1000 / 60
const MAX_STEPS_PER_FRAME = 3
const SPAWN_GAP_MS = 70 // labels drop in one by one
const EDGE = 6 // px between the labels and the stage frame
const WALL = 80 // thickness of the invisible walls
const MAX_THROW = 28 // px per step
const TAP_MS = 300
const TAP_MOVE = 10 // px a tap may move (touch) before it is a scroll
const CLICK_MOVE = 5 // px a mouse click may move before it is a drag
const SETTLE_MS = 6000 // after this long without touching, a pile that only jitters is put to sleep
const SOUND_MIN_SPEED = 1.2 // impact speed (px per step) below which a collision is silent
const LANDING_SPEED = 5 // a landing this hard (on the floor or on the pile) is reported to the characters

const rand = (min, max) => min + Math.random() * (max - min)

/**
 * Starts the physics labels on a `.pub-stage` element (with its static `.pub-stage-pile`).
 * @param {HTMLElement} stage
 * @param {{ onImpact?: (impact: { strength: number, pitch: number, source: number }) => void }} [options]
 * @returns {{ setPaused: (paused: boolean) => void, destroy: () => void }}
 */
export function createPhysicsStage(stage, { onImpact } = {}) {
  const pile = stage.querySelector('.pub-stage-pile')
  const world = document.createElement('div')
  world.className = 'pub-stage-world'
  world.setAttribute('aria-hidden', 'true')
  stage.appendChild(world)

  const engine = Engine.create({ enableSleeping: true })
  engine.gravity.y = 1
  const walls = {
    floor: Bodies.rectangle(0, 0, 10, WALL, { isStatic: true, label: 'floor' }),
    ceiling: Bodies.rectangle(0, 0, 10, WALL, { isStatic: true, label: 'ceiling' }),
    left: Bodies.rectangle(0, 0, WALL, 10, { isStatic: true, label: 'wall' }),
    right: Bodies.rectangle(0, 0, WALL, 10, { isStatic: true, label: 'wall' }),
  }
  Composite.add(engine.world, Object.values(walls))

  let items = [] // { el, body, w, h, round }
  let queue = [] // items still waiting to drop in
  let nextSpawnAt = 0
  let size = { w: 0, h: 0 }
  let signature = ''
  let raf = 0
  let lastTime = 0
  let accumulator = 0
  let paused = true
  let lastTouch = 0
  let drag = null // { pointerId, item, constraint, x0, y0, t0, moved }
  let tap = null // { pointerId, item, x0, y0, t0 }
  const byElement = new Map()

  // --- world size and walls -------------------------------------------------------------------
  function measure() {
    return { w: world.clientWidth, h: world.clientHeight }
  }

  function placeWalls() {
    const { w, h } = size
    const span = Math.max(w, h) * 3
    setWall(walls.floor, w / 2, h - EDGE + WALL / 2, span, WALL)
    setWall(walls.ceiling, w / 2, EDGE - WALL / 2, span, WALL)
    setWall(walls.left, EDGE - WALL / 2, h / 2, WALL, span)
    setWall(walls.right, w - EDGE + WALL / 2, h / 2, WALL, span)
  }

  function setWall(body, x, y, width, height) {
    const bw = body.bounds.max.x - body.bounds.min.x
    const bh = body.bounds.max.y - body.bounds.min.y
    Body.scale(body, width / bw, height / bh)
    Body.setPosition(body, { x, y })
  }

  // --- labels -----------------------------------------------------------------------------------
  /** Visible labels of the static pile (on phones the extra ones are hidden by CSS). */
  function sources() {
    return Array.from(pile.children).filter((el) => el.offsetParent !== null)
  }

  function signatureOf(list) {
    return list.map((el) => `${el.textContent}:${el.offsetWidth}x${el.offsetHeight}`).join('|')
  }

  function build() {
    clearItems()
    size = measure()
    placeWalls()
    const list = sources()
    signature = signatureOf(list)
    // Spread the drop positions over the width, in a shuffled order, so labels do not land on each other
    const slots = list.map((_, i) => (i + 0.5) / list.length).sort(() => Math.random() - 0.5)
    items = list.map((source, index) => {
      const el = source.cloneNode(true)
      el.removeAttribute('data-extra')
      el.style.removeProperty('--tilt')
      el.dataset.body = String(index)
      el.dataset.cursorLock = ''
      el.dataset.waiting = ''
      world.appendChild(el)
      const w = el.offsetWidth
      const h = el.offsetHeight
      const round = source.classList.contains('pub-stage-orb')
      const x = Math.min(size.w - EDGE - w / 2, Math.max(EDGE + w / 2, slots[index] * size.w + rand(-12, 12)))
      const y = EDGE + h / 2 + 2
      const options = {
        restitution: round ? 0.45 : 0.3,
        friction: 0.4,
        frictionAir: 0.015,
        density: 0.002,
        angle: rand(-0.3, 0.3),
      }
      const body = round
        ? Bodies.circle(x, y, w / 2, options)
        : Bodies.rectangle(x, y, w, h, { ...options, chamfer: { radius: 3 } })
      const item = { el, body, w, h, round, index }
      byElement.set(el, item)
      return item
    })
    queue = [...items]
    nextSpawnAt = 0
    lastTouch = performance.now()
    wake()
  }

  function clearItems() {
    for (const item of items) {
      Composite.remove(engine.world, item.body)
      item.el.remove()
    }
    for (const constraint of Composite.allConstraints(engine.world)) Composite.remove(engine.world, constraint)
    items = []
    queue = []
    drag = null
    tap = null
    byElement.clear()
  }

  function spawnDue(now) {
    while (queue.length > 0 && now >= nextSpawnAt) {
      const item = queue.shift()
      Composite.add(engine.world, item.body)
      Body.setVelocity(item.body, { x: rand(-0.6, 0.6), y: rand(0, 1.5) })
      delete item.el.dataset.waiting
      nextSpawnAt = now + SPAWN_GAP_MS
      // The static pile disappears as soon as the first copy is on stage
      stage.dataset.physics = 'on'
    }
  }

  function sync(force) {
    for (const item of items) {
      if (item.el.dataset.waiting !== undefined) continue
      // A body that fell asleep is written once more (its final position), then left alone
      const asleep = item.body.isSleeping
      if (!force && asleep && item.asleep) continue
      item.asleep = asleep
      const { x, y } = item.body.position
      item.el.style.transform = `translate3d(${(x - item.w / 2).toFixed(2)}px, ${(y - item.h / 2).toFixed(2)}px, 0) rotate(${item.body.angle.toFixed(4)}rad)`
    }
  }

  // --- loop ---------------------------------------------------------------------------------------
  function settled() {
    if (queue.length > 0 || drag) return false
    return items.every((item) => item.body.isSleeping)
  }

  function frame(now) {
    raf = 0
    if (!lastTime) lastTime = now
    accumulator += Math.min(now - lastTime, 100)
    lastTime = now
    spawnDue(now)
    let steps = 0
    while (accumulator >= STEP_MS && steps < MAX_STEPS_PER_FRAME) {
      Engine.update(engine, STEP_MS)
      accumulator -= STEP_MS
      steps += 1
    }
    if (steps === MAX_STEPS_PER_FRAME) accumulator = 0
    if (steps > 0) rescue()
    // A pile that only trembles long after the last touch goes to sleep (no endless loop)
    if (!drag && queue.length === 0 && now - lastTouch > SETTLE_MS) {
      for (const item of items) {
        if (!item.body.isSleeping && item.body.speed < 0.15 && Math.abs(item.body.angularVelocity) < 0.01) Sleeping.set(item.body, true)
      }
    }
    sync(false)
    if (!paused && !settled()) raf = requestAnimationFrame(frame)
    else lastTime = 0
  }

  function wake() {
    if (paused || raf) return
    lastTime = 0
    accumulator = 0
    raf = requestAnimationFrame(frame)
  }

  // --- sound and reactions -----------------------------------------------------------------------
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair
      // The body that hit (the faster one; a wall or the floor never moves)
      const moving = bodyA.isStatic ? bodyB : bodyB.isStatic ? bodyA : bodyA.speed >= bodyB.speed ? bodyA : bodyB
      const other = moving === bodyA ? bodyB : bodyA
      const speed = Math.abs(Vector.dot(Vector.sub(bodyA.velocity, bodyB.velocity), pair.collision.normal))
      if (speed < SOUND_MIN_SPEED) continue
      const item = items.find((entry) => entry.body === moving)
      const pitch = item?.round ? 1.2 : Math.min(1.15, Math.max(0.8, 1.15 - ((item?.w ?? 90) - 70) / 300))
      onImpact?.({ strength: Math.min(1, (speed - 1) / 8), pitch, source: moving.id })
      if ((other.label === 'floor' || !other.isStatic) && moving.velocity.y > 0 && speed > LANDING_SPEED) {
        const box = world.getBoundingClientRect()
        emitInteraction('label-impact', { x: box.left + moving.position.x, y: box.top + moving.position.y, strength: Math.min(1, speed / 14) })
      }
    }
  })

  // --- pointer: drag and throw (mouse, pen), tap to toss (touch) -----------------------------------
  function local(event) {
    const box = world.getBoundingClientRect()
    return { x: event.clientX - box.left, y: event.clientY - box.top }
  }

  // The drag spring may not pull a label into a wall: matter-js would push it through
  function insideFrame(point, item) {
    const margin = EDGE + Math.min(item.w, item.h) / 2
    return {
      x: Math.min(size.w - margin, Math.max(margin, point.x)),
      y: Math.min(size.h - margin, Math.max(margin, point.y)),
    }
  }

  /** Safety net: a label that still escaped the frame is put back inside, at rest. */
  function rescue() {
    for (const item of items) {
      if (item.el.dataset.waiting !== undefined) continue
      const { x, y } = item.body.position
      if (x >= 0 && x <= size.w && y >= 0 && y <= size.h) continue
      const half = Math.max(item.w, item.h) / 2 + EDGE
      Body.setPosition(item.body, { x: Math.min(size.w - half, Math.max(half, x)), y: Math.min(size.h - half, Math.max(half, y)) })
      Body.setVelocity(item.body, { x: 0, y: 0 })
      Body.setAngularVelocity(item.body, 0)
    }
  }

  function toss(item) {
    Sleeping.set(item.body, false)
    Body.setVelocity(item.body, { x: rand(-3, 3), y: rand(-14, -10) })
    Body.setAngularVelocity(item.body, rand(-0.18, 0.18))
    lastTouch = performance.now()
    wake()
  }

  function onPointerDown(event) {
    const el = event.target instanceof Element ? event.target.closest('[data-body]') : null
    const item = el && byElement.get(el)
    if (!item || event.button !== 0 || el.dataset.waiting !== undefined) return
    if (event.pointerType === 'touch') {
      // Touch only tosses; the finger keeps scrolling the page (touch-action: manipulation)
      // Times from the events themselves: a busy phone that handles them late still sees a quick tap
      tap = { pointerId: event.pointerId, item, x0: event.clientX, y0: event.clientY, t0: event.timeStamp }
      return
    }
    // Mouse/pen: no text selection, and focus stays where it was
    event.preventDefault()
    try {
      el.setPointerCapture(event.pointerId)
    } catch {
      // The pointer is already gone (e.g. released during a long frame): drag without capture
    }
    const point = local(event)
    Sleeping.set(item.body, false)
    const constraint = Constraint.create({
      pointA: point,
      bodyB: item.body,
      pointB: { x: point.x - item.body.position.x, y: point.y - item.body.position.y },
      stiffness: 0.2,
      damping: 0.1,
      length: 0.01,
    })
    Composite.add(engine.world, constraint)
    drag = { pointerId: event.pointerId, item, constraint, x0: event.clientX, y0: event.clientY, t0: event.timeStamp, moved: false }
    item.el.dataset.dragging = ''
    lastTouch = performance.now()
    wake()
  }

  function onPointerMove(event) {
    if (tap && event.pointerId === tap.pointerId && Math.hypot(event.clientX - tap.x0, event.clientY - tap.y0) > TAP_MOVE) tap = null
    if (!drag || event.pointerId !== drag.pointerId) return
    if (Math.hypot(event.clientX - drag.x0, event.clientY - drag.y0) > CLICK_MOVE) drag.moved = true
    drag.constraint.pointA = insideFrame(local(event), drag.item)
    Sleeping.set(drag.item.body, false)
    lastTouch = performance.now()
    wake()
  }

  function endDrag(event, cancelled) {
    if (tap && event.pointerId === tap.pointerId) {
      if (!cancelled && event.timeStamp - tap.t0 < TAP_MS) toss(tap.item)
      tap = null
    }
    if (!drag || event.pointerId !== drag.pointerId) return
    const { item, constraint, moved, t0 } = drag
    Composite.remove(engine.world, constraint)
    delete item.el.dataset.dragging
    drag = null
    if (!cancelled && !moved && event.timeStamp - t0 < TAP_MS) {
      toss(item)
      return
    }
    // Throw with the speed of the drag, within a sensible limit
    const v = item.body.velocity
    const speed = Math.hypot(v.x, v.y)
    if (speed > MAX_THROW) Body.setVelocity(item.body, Vector.mult(v, MAX_THROW / speed))
    lastTouch = performance.now()
    wake()
  }

  const onPointerUp = (event) => endDrag(event, false)
  const onPointerCancel = (event) => endDrag(event, true)

  world.addEventListener('pointerdown', onPointerDown)
  world.addEventListener('pointermove', onPointerMove)
  world.addEventListener('pointerup', onPointerUp)
  world.addEventListener('pointercancel', onPointerCancel)

  // --- size changes: move the walls; rebuild when the labels themselves changed (breakpoints) ------
  const resizeObserver = new ResizeObserver(() => {
    const next = measure()
    if (next.w === size.w && next.h === size.h) return
    if (signatureOf(sources()) !== signature) {
      build()
      return
    }
    size = next
    placeWalls()
    for (const item of items) {
      const { x, y } = item.body.position
      const margin = (item.round ? item.w : Math.max(item.w, item.h)) / 2 + EDGE
      const clamped = { x: Math.min(size.w - margin, Math.max(margin, x)), y: Math.min(size.h - margin, Math.max(margin, y)) }
      if (clamped.x !== x || clamped.y !== y) Body.setPosition(item.body, clamped)
      Sleeping.set(item.body, false)
    }
    lastTouch = performance.now()
    wake()
  })
  resizeObserver.observe(stage)

  build()

  return {
    /** Off screen or hidden tab: the loop stops; it continues where it was when shown again. */
    setPaused(next) {
      paused = next
      if (paused) {
        cancelAnimationFrame(raf)
        raf = 0
        lastTime = 0
      } else {
        sync(true)
        wake()
      }
    },
    destroy() {
      cancelAnimationFrame(raf)
      raf = 0
      resizeObserver.disconnect()
      world.removeEventListener('pointerdown', onPointerDown)
      world.removeEventListener('pointermove', onPointerMove)
      world.removeEventListener('pointerup', onPointerUp)
      world.removeEventListener('pointercancel', onPointerCancel)
      Events.off(engine)
      clearItems()
      Engine.clear(engine)
      world.remove()
      delete stage.dataset.physics
    },
  }
}
