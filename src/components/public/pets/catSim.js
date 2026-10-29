// Movement of the two cats (no library). One step = one frame. x = left edge in px, y = height above
// the floor in px (0 = peeking from the bottom of the screen). Modes: idle, walk, held, air.

const GRAVITY = 0.9
const WALK_SPEED = 1.5
const CHASE_SPEED = 3.6
const BOUNCE = 0.32
const HARD_LANDING = 9 // falling faster than this bounces, makes a sound and maybe a meow
export const CHASE_ZONE = 280 // px from the bottom of the screen where the cats follow the pointer
const CHASE_MEMORY_MS = 3500

export function createCat(x, index) {
  return { x, y: 0, vx: 0, vy: 0, dir: index ? -1 : 1, mode: 'idle', timer: 140 + index * 110, target: 0, grab: null }
}

/**
 * Advances one cat. `pointer` = { x, y, at } of the last pointer or touch, `offset` = its distance from
 * the pointer while chasing (the two cats keep apart), `still` = reduced motion (no walking or chasing).
 * onLand(strength 0..1) is called on a hard landing.
 * @returns {boolean} whether the cat is moving on the ground (walk animation)
 */
export function stepCat(cat, { width, catWidth, height, pointer, offset, still, now }, onLand) {
  const max = Math.max(0, width - catWidth)
  if (cat.mode === 'held') return false

  if (cat.mode === 'air') {
    cat.vy -= GRAVITY
    cat.x += cat.vx
    cat.y += cat.vy
    cat.vx *= 0.995
    if (cat.x < 0) {
      cat.x = 0
      cat.vx *= -0.5
    }
    if (cat.x > max) {
      cat.x = max
      cat.vx *= -0.5
    }
    if (cat.y <= 0) {
      cat.y = 0
      if (cat.vy < -HARD_LANDING) {
        onLand?.(Math.min(1, -cat.vy / 30))
        cat.vy = -cat.vy * BOUNCE
        cat.vx *= 0.7
      } else {
        cat.vy = 0
        cat.vx = 0
        cat.mode = 'idle'
        cat.timer = 90
      }
    }
    return false
  }

  if (still) {
    cat.mode = 'idle'
    return false
  }

  const chasing = pointer && now - pointer.at < CHASE_MEMORY_MS && pointer.y > height - CHASE_ZONE
  if (chasing) {
    const target = Math.min(max, Math.max(0, pointer.x - catWidth / 2 + offset))
    const dx = target - cat.x
    if (Math.abs(dx) > 6) {
      cat.x += Math.sign(dx) * Math.min(Math.abs(dx), CHASE_SPEED)
      cat.dir = Math.sign(dx)
      cat.mode = 'walk'
      return true
    }
    cat.mode = 'idle'
    return false
  }

  // Wander: rest a while, walk to a random spot, rest again
  cat.timer -= 1
  if (cat.mode === 'walk') {
    const dx = cat.target - cat.x
    if (Math.abs(dx) < 2) {
      cat.mode = 'idle'
      cat.timer = 160 + Math.random() * 260
      return false
    }
    cat.x += Math.sign(dx) * WALK_SPEED
    cat.dir = Math.sign(dx)
    return true
  }
  if (cat.timer <= 0) {
    cat.target = 20 + Math.random() * Math.max(40, max - 40)
    cat.mode = 'walk'
  }
  return false
}
