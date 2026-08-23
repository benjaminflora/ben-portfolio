import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'

const DEG = Math.PI / 180

// ── Orbital mechanics ─────────────────────────────────────────────────────────
// Returns world-space position of a satellite at a given orbital angle.
// Convention: Y-up, equatorial plane = XZ.
//   inc  = inclination (rad) — tilt of orbit from equatorial plane
//   node = longitude of ascending node (rad) — rotation around Y
function satPos(r: number, inc: number, node: number, angle: number): THREE.Vector3 {
  const cosA = Math.cos(angle), sinA = Math.sin(angle)
  const cosI = Math.cos(inc),   sinI = Math.sin(inc)
  const cosN = Math.cos(node),  sinN = Math.sin(node)
  return new THREE.Vector3(
     r * cosA * cosN + r * sinA * cosI * sinN,
    -r * sinA * sinI,
    -r * cosA * sinN + r * sinA * cosI * cosN,
  )
}

type SatDef = { r: number; inc: number; node: number; speed: number; phase: number; tag: string[] }

const SATS: SatDef[] = [
  { r: 2.06, inc: 28.5*DEG, node:   0*DEG, speed: 0.0022, phase: 0.00, tag: ['SAT-001', 'INC  28.5°', '7.91 KM/S'] },
  { r: 2.22, inc: 51.6*DEG, node:  72*DEG, speed: 0.0017, phase: 2.10, tag: ['SAT-047', 'INC  51.6°', 'ALT  408KM'] },
  { r: 1.90, inc: 97.4*DEG, node: 144*DEG, speed: 0.0032, phase: 4.50, tag: ['POLAR-3', 'SSO  97.4°', 'T  98.7MIN'] },
]

// ── Point-in-polygon (ray casting, lon/lat 2-D) ───────────────────────────────
function pointInRing(lat: number, lon: number, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j]
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)
      inside = !inside
  }
  return inside
}
function isLand(lat: number, lon: number, rings: number[][][]): boolean {
  for (const ring of rings) if (pointInRing(lat, lon, ring)) return true
  return false
}

// ─────────────────────────────────────────────────────────────────────────────

type GlobeProps = { size?: number; style?: React.CSSProperties }

export default function Globe({ size = 420, style }: GlobeProps) {
  const mountRef  = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.z = 3.8

    const RADIUS = 1.5

    // ── Group — globe + land layer rotate together ───────────────────────────
    const group = new THREE.Group()
    scene.add(group)

    // ── Inner dot cloud ──────────────────────────────────────────────────────
    const positions: number[] = []
    const CLOUD  = 4500
    const GOLDEN = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < CLOUD; i++) {
      const y = 1 - (i / (CLOUD - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const t = GOLDEN * i
      positions.push(RADIUS * r * Math.cos(t), RADIUS * y, RADIUS * r * Math.sin(t))
    }
    ;[-60,-30,0,30,60].forEach(lat => {
      const lr = (lat * Math.PI) / 180, n = 240
      for (let i = 0; i < n; i++) {
        const lon = (i / n) * Math.PI * 2, r = RADIUS * Math.cos(lr)
        positions.push(r * Math.cos(lon), RADIUS * Math.sin(lr), r * Math.sin(lon))
      }
    })
    for (let l = 0; l < 12; l++) {
      const lon = (l / 12) * Math.PI * 2, n = 120
      for (let i = 0; i < n; i++) {
        const lat = -Math.PI / 2 + (i / n) * Math.PI, r = RADIUS * Math.cos(lat)
        positions.push(r * Math.cos(lon), RADIUS * Math.sin(lat), r * Math.sin(lon))
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    const dofVert = /* glsl */`
      varying float vFocusDist;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFocusDist = max(0.0, -mv.z - 2.3);
        float t = smoothstep(0.0, 3.0, vFocusDist);
        gl_PointSize = mix(2.8, 1.1, t);
        gl_Position = projectionMatrix * mv;
      }`
    const dofFrag = /* glsl */`
      varying float vFocusDist;
      void main() {
        float oof = smoothstep(0.0, 3.0, vFocusDist);
        float d = length(gl_PointCoord - 0.5);
        float a = 1.0 - smoothstep(mix(0.0, 0.28, oof), 0.5, d);
        float o = mix(0.88, 0.18, oof);
        if (a * o < 0.01) discard;
        gl_FragColor = vec4(1.0, 1.0, 1.0, a * o);
      }`

    group.add(new THREE.Points(geo, new THREE.ShaderMaterial({
      vertexShader: dofVert, fragmentShader: dofFrag,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })))

    // ── Land glow layer (async) ──────────────────────────────────────────────
    const landDisposables: THREE.BufferGeometry[] = []

    import('world-atlas/countries-110m.json').then(mod => {
      const topo = mod.default as unknown as Topology<{ countries: GeometryCollection }>
      const countries = feature(topo, topo.objects.countries)

      const landRings: number[][][] = []
      for (const f of countries.features) {
        const g = f.geometry; if (!g) continue
        if (g.type === 'Polygon') landRings.push(g.coordinates[0])
        else if (g.type === 'MultiPolygon') for (const p of g.coordinates) landRings.push(p[0])
      }

      const LRAD = 1.54, CANDS = 20000
      const lp: number[] = []
      for (let i = 0; i < CANDS; i++) {
        const yn = 1 - (i / (CANDS - 1)) * 2
        const r  = Math.sqrt(Math.max(0, 1 - yn * yn))
        const th = GOLDEN * i
        const lat = Math.asin(yn) * (180 / Math.PI)
        const lon = ((th % (2 * Math.PI)) / (2 * Math.PI)) * 360 - 180
        if (isLand(lat, lon, landRings))
          lp.push(LRAD * r * Math.cos(th), LRAD * yn, LRAD * r * Math.sin(th))
      }

      const lg = new THREE.BufferGeometry()
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3))
      landDisposables.push(lg)

      const glowVert = /* glsl */`
        varying float vBack;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vBack = smoothstep(2.3, 5.3, -mv.z);
          gl_PointSize = 5.5;
          gl_Position = projectionMatrix * mv;
        }`
      const glowFrag = /* glsl */`
        varying float vBack;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = exp(-d * d * 3.8);
          float o = mix(0.72, 0.08, vBack);
          if (a * o < 0.008) discard;
          gl_FragColor = vec4(1.0, 1.0, 1.0, a * o);
        }`
      group.add(new THREE.Points(lg, new THREE.ShaderMaterial({
        vertexShader: glowVert, fragmentShader: glowFrag,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      })))
    })

    // ── Satellites ───────────────────────────────────────────────────────────
    const satAngles = SATS.map(s => s.phase)

    // Orbit rings (precomputed — not attached to rotating group)
    SATS.forEach(sat => {
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 128; i++) pts.push(satPos(sat.r, sat.inc, sat.node, (i / 128) * Math.PI * 2))
      const rg = new THREE.BufferGeometry().setFromPoints(pts)
      const rm = new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.07,
        depthWrite: false, blending: THREE.AdditiveBlending,
      })
      scene.add(new THREE.Line(rg, rm))
    })

    // ── Animation ────────────────────────────────────────────────────────────
    const tmp = new THREE.Vector3()
    let rafId: number

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      group.rotation.y += 0.0018

      SATS.forEach((sat, i) => {
        satAngles[i] += sat.speed
        const pos = satPos(sat.r, sat.inc, sat.node, satAngles[i])

        // Project to screen coords relative to the wrapper div
        tmp.copy(pos)
        tmp.project(camera)
        const sx = ( tmp.x + 1) / 2 * size
        const sy = (-tmp.y + 1) / 2 * size

        // Fade as satellite crosses behind globe
        const vis = THREE.MathUtils.smoothstep(pos.z, -1.8, -0.2)

        const el = labelRefs.current[i]
        if (el) {
          el.style.transform = `translate(${sx}px, ${sy}px)`
          el.style.opacity   = String(vis)
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      geo.dispose()
      landDisposables.forEach(g => g.dispose())
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [size])

  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'visible', ...style }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {SATS.map((sat, i) => (
        <div
          key={i}
          ref={el => { labelRefs.current[i] = el }}
          style={{
            position: 'absolute', top: 0, left: 0,
            pointerEvents: 'none', userSelect: 'none',
            display: 'flex', alignItems: 'flex-start', gap: '6px',
            // offset so the reticle center sits on the projected point
            marginLeft: -10, marginTop: -10,
          }}
        >
          {/* SVG reticle — lives in DOM, never clipped by WebGL canvas */}
          <svg width="20" height="20" viewBox="0 0 32 32" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="16" cy="16" r="10" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8"/>
            <line x1="3"  y1="16" x2="11" y2="16" stroke="white" strokeWidth="1" opacity="0.82"/>
            <line x1="21" y1="16" x2="29" y2="16" stroke="white" strokeWidth="1" opacity="0.82"/>
            <line x1="16" y1="3"  x2="16" y2="11" stroke="white" strokeWidth="1" opacity="0.82"/>
            <line x1="16" y1="21" x2="16" y2="29" stroke="white" strokeWidth="1" opacity="0.82"/>
            <circle cx="16" cy="16" r="1.5" fill="white"/>
          </svg>

          {/* Text label */}
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '8px', lineHeight: '13px', letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ color: '#ffffff', display: 'block' }}>{sat.tag[0]}</span>
            {sat.tag.slice(1).map((line, j) => (
              <span key={j} style={{ color: 'var(--secondary)', display: 'block' }}>{line}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
