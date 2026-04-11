import { useEffect, useRef, useState } from 'react'
import './App.css'

// Fresh Figma assets — fetched 2026-04-10 (valid 7 days)
const imgIcon          = 'https://www.figma.com/api/mcp/asset/d7073562-a57c-44a2-91e6-b6169135e705'
const imgProDisplayXdr = 'https://www.figma.com/api/mcp/asset/977468de-6ef6-4d29-8428-7cc2b25395fe'
const imgBillboard     = 'https://www.figma.com/api/mcp/asset/c6d96c0f-a803-4b1f-89c8-092351a6f561'
const imgImage7        = 'https://www.figma.com/api/mcp/asset/b9f33d21-3cbd-4d60-8544-91b09eac0af4'
const imgImage1        = 'https://www.figma.com/api/mcp/asset/c61f0684-f4fc-4b20-b5b3-0728815884b0'
const imgFrames        = 'https://www.figma.com/api/mcp/asset/a341e7a9-9bdf-4bf6-8368-3891ae4e6283'
const imgImage4        = 'https://www.figma.com/api/mcp/asset/c7533171-89a2-4218-9a51-a4c91dba2703'
const imgImage3        = 'https://www.figma.com/api/mcp/asset/c32eae51-4eeb-42da-9fdd-1784f7002f99'
const imgImage5        = 'https://www.figma.com/api/mcp/asset/383f2def-4423-49bd-807a-ede0d7d0bfe4'
const imgIPhoneScreen  = 'https://www.figma.com/api/mcp/asset/025e1c55-50c8-4923-97bd-42e68c764ae2'
const imgIPhoneFrame   = 'https://www.figma.com/api/mcp/asset/9a059948-a7c2-487a-b265-036ffab3a69d'
const imgImage8        = 'https://www.figma.com/api/mcp/asset/95e110b7-4c27-4bc2-80dd-83dd5892d87f'

// ── Module-level preload ──────────────────────────────────────────────────────
// Fires before React mounts. The 11 MB XDR frame is the bottleneck; starting it
// here gives it the maximum possible lead time. All 7 Mac cards share one cache
// entry, so they all become ready the moment it finishes downloading.
;[imgProDisplayXdr, imgBillboard, imgImage7, imgImage1, imgFrames,
  imgImage4, imgImage3, imgImage5, imgIPhoneScreen, imgIPhoneFrame, imgImage8,
].forEach(src => { const i = new Image(); i.src = src })

type CardType = 'mac' | 'photo' | 'iphone'

type Project = {
  title: string
  client: string
  category: string
  type: CardType
  image: string
}

const projects: Project[] = [
  { title: 'BILLBOARDS',           client: 'AFTERQUERY',  category: 'GRAPHIC DESIGN',       type: 'photo',  image: imgBillboard },
  { title: 'WHOP EMAIL CAMPAIGNS', client: 'CASE STUDY',  category: 'UX/UI',                type: 'mac',    image: imgImage7    },
  { title: 'REBRAND CONCEPT',      client: 'AFTERQUERY',  category: 'BRANDING & WEB DESIGN', type: 'mac',   image: imgImage1    },
  { title: 'BULK ACTIONS',         client: 'JULY',        category: 'UX/UI',                type: 'mac',    image: imgFrames    },
  { title: 'BEVS AND DEVS',        client: 'JULY',        category: 'WEBSITE DEV',          type: 'mac',    image: imgImage4    },
  { title: 'TOPH',                 client: 'LAVA LAB',    category: 'PRODUCT',              type: 'mac',    image: imgImage3    },
  { title: 'BATCHER',              client: 'S.E.P.',      category: 'PRODUCT',              type: 'mac',    image: imgImage5    },
  { title: 'BULK ACTIONS',         client: 'FOR JULY',    category: 'UX/UI',                type: 'iphone', image: imgIPhoneScreen },
  { title: 'MUSIC STREAMING',      client: 'CASE STUDY',  category: 'UX/UI',                type: 'mac',    image: imgImage8    },
]

// ─── ProjectCard ─────────────────────────────────────────────────────────────

type ProjectCardProps = {
  project: Project
  index: number
  onOpen: () => void
  ready: boolean  // global signal: all images preloaded (or timeout hit)
}

function ProjectCard({ project, index, onOpen, ready }: ProjectCardProps) {
  const [hovered, setHovered]     = useState(false)
  const [cardVisible, setCardVisible] = useState(false)

  // Cascade starts only after the global ready signal — so every card appears
  // with its content already loaded, in a clean left-to-right stagger.
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setCardVisible(true), index * 80)
    return () => clearTimeout(t)
  }, [ready, index])

  // ── inner white-area content, per card type ──────────────────────────────

  const whiteContent = (() => {
    if (project.type === 'photo') {
      return (
        <div style={{
          width: '73.03%',
          aspectRatio: '260 / 174',
          flexShrink: 0,
          boxShadow: '0px 21px 13.7px 0px rgba(0,0,0,0.25), 0px 4px 8.2px 0px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}>
          <img
            src={project.image}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )
    }

    if (project.type === 'iphone') {
      return (
        <div style={{ width: '78.703px', height: '171px', borderRadius: '10px', flexShrink: 0, position: 'relative' }}>
          <img
            src={project.image}
            alt={project.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', maxWidth: 'none', pointerEvents: 'none' }}
          />
          <div style={{ position: 'absolute', left: '-4.47px', top: '-3.94px', width: '87.646px', height: '178.87px' }}>
            <img
              src={imgIPhoneFrame}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none', pointerEvents: 'none' }}
            />
          </div>
        </div>
      )
    }

    // type === 'mac'
    return (
      <div style={{ paddingTop: '8.43%', width: '100%' }}>
        <div style={{ width: '87.64%', aspectRatio: '312 / 258.732', position: 'relative', margin: '0 auto' }}>
          {/* Pro Display XDR bezel */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <img
              src={imgProDisplayXdr}
              alt=""
              style={{ position: 'absolute', left: '-1.96%', top: '-0.05%', width: '101.88%', height: '100.09%', maxWidth: 'none' }}
            />
          </div>
          {/* Screenshot */}
          <div style={{ position: 'absolute', left: '1.97%', top: '2.86%', width: '96.05%', height: '65.24%', overflow: 'hidden', zIndex: 1 }}>
            <img
              src={project.image}
              alt={project.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    )
  })()

  return (
    <div
      style={{
        position: 'relative',
        paddingTop: '76.97%',   // 274 / 356 — locks card to Figma aspect ratio
        opacity:   cardVisible ? 1 : 0,
        transform: cardVisible ? 'scale(1)' : 'scale(0.97)',
        transition: 'opacity 0.45s ease-out, transform 0.45s ease-out',
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: '#181818',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onOpen}
      >
        {/* White area — always white; outer div is transparent until cardVisible so no flash */}
        <div
          style={{
            flex: 1, minHeight: 0,
            backgroundColor: '#ffffff',
            overflow: 'hidden',
            // photo + iphone: vertically center (no padding); mac: top-aligned via paddingTop in content
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: project.type === 'mac' ? 'flex-start' : 'center',
          }}
        >
          {whiteContent}
        </div>

        {/* Label bar — slides up on hover */}
        <div
          style={{
            flexShrink: 0,
            overflow: 'hidden',
            height: hovered ? '40px' : '0px',
            transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            style={{
              height: '40px',
              backgroundColor: '#181818',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 10px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px', letterSpacing: '0.4px', lineHeight: '20px',
              whiteSpace: 'nowrap',
              transform: hovered ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#ffffff' }}>{project.title}</span>
              <span style={{ color: 'var(--secondary)' }}>/</span>
              <span style={{ color: 'var(--secondary)' }}>{project.client}</span>
            </div>
            <span style={{ color: 'var(--secondary)' }}>{project.category}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LiveClock ────────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return <>{time}</>
}

// ─── NameLabel ───────────────────────────────────────────────────────────────
// "Benjamin Flora" slides out upward on hover, "learn more →" slides in from below.

function NameLabel() {
  return (
    <span style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '-0.014px',
      color: '#ffffff',
      whiteSpace: 'nowrap',
    }}>
      Benjamin Flora
    </span>
  )
}

// ─── ProjectOverlay ──────────────────────────────────────────────────────────

type ProjectOverlayProps = {
  project: Project
  onClose: () => void
}

function ProjectOverlay({ project, onClose }: ProjectOverlayProps) {
  const [visible, setVisible] = useState(false)

  // Trigger enter animation after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── enlarged mockup content, per card type ────────────────────────────────

  const mockup = (() => {
    if (project.type === 'photo') {
      return (
        <img
          src={project.image}
          alt={project.title}
          style={{
            maxWidth: '100%',
            maxHeight: '65vh',
            objectFit: 'contain',
            display: 'block',
            boxShadow: '0px 40px 60px rgba(0,0,0,0.5)',
          }}
        />
      )
    }

    if (project.type === 'iphone') {
      // Scale the iPhone up ~2× from the card (78.703 → ~160px)
      const scale = 2.1
      const w = 78.703 * scale
      const h = 171 * scale
      const fw = 87.646 * scale
      const fh = 178.87 * scale
      const fl = -4.47 * scale
      const ft = -3.94 * scale
      return (
        <div style={{ position: 'relative', width: w, height: h, flexShrink: 0 }}>
          <img
            src={project.image}
            alt={project.title}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              borderRadius: 10 * scale,
              maxWidth: 'none',
              pointerEvents: 'none',
            }}
          />
          <div style={{
            position: 'absolute',
            left: fl, top: ft,
            width: fw, height: fh,
          }}>
            <img
              src={imgIPhoneFrame}
              alt=""
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                maxWidth: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      )
    }

    // mac — Pro Display XDR at up to 72vw, capped at 800px
    return (
      <div style={{ width: 'min(72vw, 800px)', position: 'relative', aspectRatio: '312 / 258.732' }}>
        {/* Bezel */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <img
            src={imgProDisplayXdr}
            alt=""
            style={{
              position: 'absolute',
              left: '-1.96%', top: '-0.05%',
              width: '101.88%', height: '100.09%',
              maxWidth: 'none',
            }}
          />
        </div>
        {/* Screen */}
        <div style={{
          position: 'absolute',
          left: '1.97%', top: '2.86%',
          width: '96.05%', height: '65.24%',
          overflow: 'hidden',
          zIndex: 1,
        }}>
          <img
            src={project.image}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>
    )
  })()

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      {/* Backdrop — click to close */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(8,8,8,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={onClose}
      />

      {/* Panel — replicates the card structure: white area + dark label bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: project.type === 'mac' ? 'min(72vw, 800px)' : 'auto',
          transform: visible ? 'scale(1)' : 'scale(0.96)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Close button — sits above the panel */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 2,
            background: 'none',
            border: 'none',
            color: 'var(--secondary)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.4px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* White area */}
        <div
          style={{
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: project.type === 'mac' ? 'flex-start' : 'center',
            paddingTop: project.type === 'mac' ? '8.43%' : '40px',
            paddingBottom: project.type === 'mac' ? '0' : '40px',
            minHeight: project.type === 'iphone' ? '420px' : undefined,
            overflow: 'hidden',
          }}
        >
          {mockup}
        </div>

        {/* Dark label bar */}
        <div
          style={{
            backgroundColor: '#181818',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px',
            height: '48px',
            flexShrink: 0,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px', letterSpacing: '0.4px', lineHeight: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#ffffff' }}>{project.title}</span>
            <span style={{ color: 'var(--secondary)' }}>/</span>
            <span style={{ color: 'var(--secondary)' }}>{project.client}</span>
          </div>
          <span style={{ color: 'var(--secondary)' }}>{project.category}</span>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

// All unique srcs — module-level preload already fired; this list drives the
// App-level "all settled" check so the cascade starts with images ready.
const allSrcs = [
  imgProDisplayXdr, imgBillboard, imgImage7, imgImage1, imgFrames,
  imgImage4, imgImage3, imgImage5, imgIPhoneScreen, imgIPhoneFrame, imgImage8,
]

export default function App() {
  const [headerVisible, setHeaderVisible]       = useState(false)
  const [selectedProject, setSelectedProject]   = useState<Project | null>(null)
  const [imagesReady, setImagesReady]           = useState(false)

  // Wait for every image to load (or 3.5 s fallback), then trigger the cascade.
  // Module-level preload already started all downloads, so most will be cached by now.
  useEffect(() => {
    let remaining = allSrcs.length
    const done = () => { if (--remaining <= 0) setImagesReady(true) }
    const timer = setTimeout(() => setImagesReady(true), 3500)

    allSrcs.forEach(src => {
      const img = new Image()
      img.src = src
      if (img.complete) { done() } else { img.onload = img.onerror = done }
    })

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setHeaderVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const headerTransition = 'opacity 0.6s ease, transform 0.6s ease'

  return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh', width: '100%' }}>
      {/* Domain */}
      <div
        style={{
          paddingTop: '40px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px',
          opacity:   headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(6px)',
          transition: headerTransition,
        }}
      >
        <img src={imgIcon} alt="" style={{ width: '16px', height: '16px' }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.014px', color: 'var(--secondary)' }}>
          benjaminflora.com
        </span>
      </div>

      {/* Header row */}
      <div
        className="page-padding"
        style={{
          marginTop: '14px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          opacity:   headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(6px)',
          transition: `opacity 0.6s ease 80ms, transform 0.6s ease 80ms`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <NameLabel />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.014px', color: 'var(--secondary)' }}>
            Last Updated 04/07/26
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.014px' }}>
          <span style={{ color: '#ffffff' }}>Los Angeles</span>
          <span style={{ color: 'var(--secondary)' }}><LiveClock /></span>
        </div>
      </div>

      {/* Project grid */}
      <div
        className="page-padding project-grid"
        style={{ marginTop: '48px' }}
      >
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} onOpen={() => setSelectedProject(project)} ready={imagesReady} />
        ))}
      </div>

      {/*
        Progressive blur — stacked layers, each masked to its band.
        Blur increases toward the bottom: 0.5px → 1.5px → 3px → 6px → 10px.
      */}
      {[
        { blur: 0.5, start:  0, end: 30 },
        { blur: 1.5, start: 20, end: 55 },
        { blur: 3,   start: 45, end: 72 },
        { blur: 6,   start: 62, end: 88 },
        { blur: 10,  start: 78, end: 100 },
      ].map(({ blur, start, end }, i) => (
        <div key={i} style={{
          position: 'fixed', bottom: 0, left: 0, width: '100%', height: '110px',
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          maskImage: `linear-gradient(to bottom, transparent ${start}%, black ${end}%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent ${start}%, black ${end}%)`,
          pointerEvents: 'none',
          zIndex: 100,
        }} />
      ))}

      {/* Color gradient sits on top of the blur layers */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%', height: '110px',
        background: 'linear-gradient(to bottom, rgba(8,8,8,0) 0%, rgba(8,8,8,0.5) 49%, #080808 100%)',
        pointerEvents: 'none', zIndex: 105,
      }} />

      <div style={{ height: '80px' }} />

      {selectedProject && (
        <ProjectOverlay
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}
