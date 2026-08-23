import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  vx: number
  vy: number
  life: number      // 0–1
  maxLife: number   // frames
  len: number       // tail length px
}

const ANGLE = 215 * (Math.PI / 180) // ~down-right
const SPEED = 6

function spawn(w: number, h: number): Star {
  // Start from top-left quadrant or top edge so they streak across screen
  const edge = Math.random()
  let x: number, y: number
  if (edge < 0.6) {
    // top edge
    x = Math.random() * w * 0.8
    y = Math.random() * h * 0.2
  } else {
    // left edge
    x = Math.random() * w * 0.15
    y = Math.random() * h * 0.5
  }
  const speed = SPEED + Math.random() * 3
  return {
    x, y,
    vx: Math.cos(ANGLE) * speed,
    vy: Math.sin(ANGLE) * speed,
    life: 0,
    maxLife: 55 + Math.random() * 35,
    len: 80 + Math.random() * 100,
  }
}

export default function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width  = w
    canvas.height = h

    const onResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width  = w
      canvas.height = h
    }
    window.addEventListener('resize', onResize)

    const stars: Star[] = []
    let framesSinceSpawn = 0
    let nextSpawn = 120 + Math.random() * 200  // ~2–5 seconds at 60fps

    let rafId: number

    const tick = () => {
      rafId = requestAnimationFrame(tick)
      ctx.clearRect(0, 0, w, h)

      // Spawn
      framesSinceSpawn++
      if (framesSinceSpawn >= nextSpawn && stars.length < 3) {
        stars.push(spawn(w, h))
        framesSinceSpawn = 0
        nextSpawn = 120 + Math.random() * 200
      }

      // Draw & update
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i]
        s.x += s.vx
        s.y += s.vy
        s.life++

        const t = s.life / s.maxLife
        // Fade in then fade out — peak at t=0.2
        const alpha = t < 0.2
          ? (t / 0.2) * 0.55
          : (1 - (t - 0.2) / 0.8) * 0.55

        if (alpha <= 0 || t >= 1) { stars.splice(i, 1); continue }

        // Tail: draw gradient line behind current position
        const tailX = s.x - Math.cos(ANGLE) * s.len
        const tailY = s.y - Math.sin(ANGLE) * s.len

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
        grad.addColorStop(0, `rgba(255,255,255,0)`)
        grad.addColorStop(1, `rgba(255,255,255,${alpha.toFixed(3)})`)

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    tick()
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}
