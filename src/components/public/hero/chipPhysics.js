// Light physics for the hero chips (no library): boxes that fall, stack, bounce on the floor and push
// each other aside. Positions are in pixels inside the arena, y grows downwards. One step = one frame.

const GRAVITY = 0.6
const AIR = 0.992 // horizontal speed kept per step
const FLOOR_BOUNCE = 0.3
const FLOOR_FRICTION = 0.86
const WALL_BOUNCE = 0.5
const CEILING = -260 // chips thrown upwards may leave the arena this far, then stop rising
const REST = 0.7 // vertical speeds below this count as resting

/**
 * A world with `count` bodies { x, y, vx, vy, w, h, r }; sizes and positions come from place().
 * drag = { index, ... } while a chip is held (that chip follows the pointer and pushes the others).
 */
export function createWorld() {
  return { width: 0, height: 0, bodies: [], drag: null }
}

// Where chips start (share of the free width): two groups, left and middle, like the pile of the
// reference site of phase 8 (chips land partly on each other). Narrow arenas use the whole width.
const GROUPS = [
  [0, 0.28],
  [0.38, 0.56],
]

/**
 * Starting positions above the arena (the chips fall in when the page opens, like the reference site of
 * phase 8): alternately in the two groups, spread inside a group by the golden ratio, at a few different
 * heights so they land one after the other. Each chip gets a fixed resting angle for when it ends up lying
 * on another chip. settle() lets them fall at once (reduced motion).
 */
export function place(world, sizes) {
  const wide = world.width > 700
  world.bodies = sizes.map(({ w, h }, index) => {
    const [from, to] = wide ? GROUPS[index % 2] : [0, 1]
    const share = from + ((0.13 + index * 0.618034) % 1) * (to - from)
    const sign = index % 2 === 0 ? 1 : -1
    return {
      x: share * Math.max(0, world.width - w),
      y: Math.max(CEILING, -h - 10 - (index % 4) * 60),
      vx: 0,
      vy: 0,
      w,
      h,
      r: 0,
      rest: sign * (8 + ((index * 7) % 15)),
    }
  })
}

/** Whether a chip lies on the floor (not on another chip). */
export function grounded(world, body) {
  return body.y + body.h >= world.height - 0.5
}

/** New sizes (font loaded, window resized) without moving the chips more than needed. */
export function resize(world, sizes) {
  world.bodies.forEach((body, index) => {
    body.w = sizes[index].w
    body.h = sizes[index].h
    body.x = Math.min(Math.max(body.x, 0), Math.max(0, world.width - body.w))
    body.y = Math.min(body.y, world.height - body.h)
  })
}

/**
 * Advances the world one frame. onHit(index, strength 0..1) is called when a chip lands hard.
 * @returns {number} the total speed left (near 0 = everything rests)
 */
export function step(world, onHit) {
  const { bodies, width, height, drag } = world
  const held = drag ? drag.index : -1

  bodies.forEach((p, index) => {
    if (index === held) return
    p.vy += GRAVITY
    p.vx *= AIR
    p.x += p.vx
    p.y += p.vy
    if (p.y + p.h > height) {
      if (p.vy > 6 && onHit) onHit(index, Math.min(p.vy / 20, 1))
      p.y = height - p.h
      p.vy *= -FLOOR_BOUNCE
      p.vx *= FLOOR_FRICTION
      if (Math.abs(p.vy) < REST) p.vy = 0
    }
    if (p.y < CEILING) {
      p.y = CEILING
      p.vy = 0
    }
    if (p.x < 0) {
      p.x = 0
      p.vx *= -WALL_BOUNCE
    }
    if (p.x + p.w > width) {
      p.x = width - p.w
      p.vx *= -WALL_BOUNCE
    }
  })

  // Overlaps: pushed apart along the shorter overlap. Sideways: both move half (a held chip does not
  // move) and swap some speed. Vertically: the upper chip rests on the lower one.
  for (let a = 0; a < bodies.length; a += 1) {
    for (let b = a + 1; b < bodies.length; b += 1) {
      const A = bodies[a]
      const B = bodies[b]
      const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x)
      const oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y)
      if (ox <= 0 || oy <= 0) continue
      const aHeld = a === held
      const bHeld = b === held
      if (ox < oy) {
        const dir = A.x + A.w / 2 < B.x + B.w / 2 ? -1 : 1
        if (aHeld) B.x -= dir * ox
        else if (bHeld) A.x += dir * ox
        else {
          A.x += (dir * ox) / 2
          B.x -= (dir * ox) / 2
        }
        const speed = A.vx
        A.vx = B.vx * 0.6
        B.vx = speed * 0.6
      } else {
        const top = A.y + A.h / 2 < B.y + B.h / 2 ? A : B
        const bottom = top === A ? B : A
        const topHeld = (top === A && aHeld) || (top === B && bHeld)
        const bottomHeld = (bottom === A && aHeld) || (bottom === B && bHeld)
        const grounded = bottom.y + bottom.h >= height - 0.5
        if (topHeld) bottom.y += oy
        else if (bottomHeld || grounded) top.y -= oy
        else {
          top.y -= oy / 2
          bottom.y += oy / 2
        }
        if (top.vy > 0) top.vy *= -0.2
        if (Math.abs(top.vy) < REST) top.vy = 0
        top.vx *= 0.9
      }
    }
  }

  let energy = 0
  for (const p of bodies) energy += Math.abs(p.vx) + Math.abs(p.vy)
  return energy
}

/** Runs the world without drawing or sounds until it rests (at most `steps` frames), then stops it. */
export function settle(world, steps = 600) {
  for (let i = 0; i < steps; i += 1) {
    if (step(world) < 0.05 && i > 30) break
  }
  for (const body of world.bodies) {
    body.vx = 0
    body.vy = 0
    body.r = 0
  }
}
