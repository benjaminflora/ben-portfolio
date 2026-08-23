import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Globe from './components/Globe'
import ShootingStars from './components/ShootingStars'

// ── Word-by-word fade-in (starts invisible, no flash) ────────────────────────
function FadeText({ children, style, delay = 0 }: { children: string; style?: React.CSSProperties; delay?: number }) {
  return (
    <span style={{ display: 'block', ...style }}>
      {children.split(' ').map((word, i) => (
        <span key={i} style={{
          display: 'inline-block',
          opacity: 0,
          animation: 'wordFadeIn 0.5s ease forwards',
          animationDelay: `${delay + i * 0.07}s`,
          marginRight: '0.25em',
        }}>{word}</span>
      ))}
    </span>
  )
}

// True on touch-only devices (phones/tablets) — no hover capability
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches

const imgIcon          = '/images/icon.svg'
const imgProDisplayXdr = '/images/pro-display-xdr.png'
const imgBillboard     = '/images/billboard.jpg'
const imgImage7        = '/images/image7.png'
const imgImage1        = '/images/image1.png'
const imgFrames        = '/images/frames.png'
const imgImage4        = '/images/image4.jpg'
const imgImage3        = '/images/image3.png'
const imgImage5        = '/images/image5.png'
const imgIPhoneScreen  = '/images/iphone-screen.png'
const imgIPhoneFrame   = '/images/iphone-frame.png'
const imgImage8        = '/images/image8.png'

// ── Module-level preload ──────────────────────────────────────────────────────
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
  { title: 'BILLBOARDS',           client: 'AFTERQUERY',  category: 'GRAPHIC DESIGN',        type: 'photo',  image: imgBillboard    },
  { title: 'WHOP EMAIL CAMPAIGNS', client: 'CASE STUDY',  category: 'UX/UI',                 type: 'mac',    image: imgImage7       },
  { title: 'REBRAND CONCEPT',      client: 'AFTERQUERY',  category: 'BRANDING & WEB DESIGN', type: 'mac',    image: imgImage1       },
  { title: 'BULK ACTIONS',         client: 'JULY',        category: 'UX/UI',                 type: 'mac',    image: imgFrames       },
  { title: 'BEVS AND DEVS',        client: 'JULY',        category: 'WEBSITE DEV',           type: 'mac',    image: imgImage4       },
  { title: 'TOPH',                 client: 'LAVA LAB',    category: 'PRODUCT',               type: 'mac',    image: imgImage3       },
  { title: 'BATCHER',              client: 'S.E.P.',      category: 'PRODUCT',               type: 'mac',    image: imgImage5       },
  { title: 'BULK ACTIONS',         client: 'FOR JULY',    category: 'UX/UI',                 type: 'iphone', image: imgIPhoneScreen },
  { title: 'MUSIC STREAMING',      client: 'CASE STUDY',  category: 'UX/UI',                 type: 'mac',    image: imgImage8       },
]

// ─── ProjectCard ─────────────────────────────────────────────────────────────

type ProjectCardProps = {
  project: Project
  index: number
  onOpen: () => void
  ready: boolean
}

function ProjectCard({ project, index, onOpen, ready }: ProjectCardProps) {
  const [hovered, setHovered]         = useState(false)
  const [cardVisible, setCardVisible] = useState(false)
  const [inView, setInView]           = useState(false)
  const cardRef                       = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setCardVisible(true), index * 130)
    return () => clearTimeout(t)
  }, [ready, index])

  useEffect(() => {
    if (!isTouchDevice || !cardRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.6 }
    )
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  const whiteContent = (() => {
    if (project.type === 'photo') {
      return (
        <div style={{
          width: '73.03%', aspectRatio: '260 / 174', flexShrink: 0,
          boxShadow: '0px 21px 13.7px 0px rgba(0,0,0,0.25), 0px 4px 8.2px 0px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}>
          <img src={project.image} alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )
    }
    if (project.type === 'iphone') {
      return (
        <div style={{ width: '78.703px', height: '171px', borderRadius: '10px', flexShrink: 0, position: 'relative' }}>
          <img src={project.image} alt={project.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', maxWidth: 'none', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: '-4.47px', top: '-3.94px', width: '87.646px', height: '178.87px' }}>
            <img src={imgIPhoneFrame} alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none', pointerEvents: 'none' }} />
          </div>
        </div>
      )
    }
    return (
      <div style={{ paddingTop: '8.43%', width: '100%' }}>
        <div style={{ width: '87.64%', aspectRatio: '312 / 258.732', position: 'relative', margin: '0 auto' }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <img src={imgProDisplayXdr} alt=""
              style={{ position: 'absolute', left: '-1.96%', top: '-0.05%', width: '101.88%', height: '100.09%', maxWidth: 'none' }} />
          </div>
          <div style={{ position: 'absolute', left: '1.97%', top: '2.86%', width: '96.05%', height: '65.24%', overflow: 'hidden', zIndex: 1 }}>
            <img src={project.image} alt={project.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    )
  })()

  return (
    <div ref={cardRef} style={{
      position: 'relative', paddingTop: '76.97%',
      opacity: cardVisible ? 1 : 0,
      transform: cardVisible ? 'translateY(0px) scale(1)' : 'translateY(14px) scale(0.98)',
      transition: 'opacity 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, backgroundColor: '#181818',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer',
      }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onOpen() }}
      >
        <div style={{
          flex: 1, minHeight: 0, backgroundColor: '#ffffff', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: project.type === 'mac' ? 'flex-start' : 'center',
        }}>
          {whiteContent}
        </div>
        <div style={{
          flexShrink: 0, overflow: 'hidden',
          height: (hovered || inView) ? '40px' : '0px',
          transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{
            height: '40px', backgroundColor: '#181818',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 10px', fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px', letterSpacing: '0.4px', lineHeight: '20px', whiteSpace: 'nowrap',
            transform: (hovered || inView) ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
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
    const update = () => setTime(new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <>{time}</>
}

// ─── ProjectOverlay ──────────────────────────────────────────────────────────

type ProjectOverlayProps = { project: Project; onClose: () => void }

function ProjectOverlay({ project, onClose }: ProjectOverlayProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const mockup = (() => {
    if (project.type === 'photo') {
      return (
        <img src={project.image} alt={project.title} style={{
          maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', display: 'block',
          boxShadow: '0px 40px 60px rgba(0,0,0,0.5)',
        }} />
      )
    }
    if (project.type === 'iphone') {
      const scale = 2.1
      const w = 78.703 * scale, h = 171 * scale
      const fw = 87.646 * scale, fh = 178.87 * scale
      const fl = -4.47 * scale, ft = -3.94 * scale
      return (
        <div style={{ position: 'relative', width: w, height: h, flexShrink: 0 }}>
          <img src={project.image} alt={project.title} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', borderRadius: 10 * scale, maxWidth: 'none', pointerEvents: 'none',
          }} />
          <div style={{ position: 'absolute', left: fl, top: ft, width: fw, height: fh }}>
            <img src={imgIPhoneFrame} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', maxWidth: 'none', pointerEvents: 'none',
            }} />
          </div>
        </div>
      )
    }
    return (
      <div style={{ width: 'min(72vw, 800px)', position: 'relative', aspectRatio: '312 / 258.732' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <img src={imgProDisplayXdr} alt="" style={{
            position: 'absolute', left: '-1.96%', top: '-0.05%', width: '101.88%', height: '100.09%', maxWidth: 'none',
          }} />
        </div>
        <div style={{ position: 'absolute', left: '1.97%', top: '2.86%', width: '96.05%', height: '65.24%', overflow: 'hidden', zIndex: 1 }}>
          <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    )
  })()

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }} onClick={onClose} />
      <div style={{
        position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
        width: project.type === 'mac' ? 'min(72vw, 800px)' : 'auto',
        transform: visible ? 'scale(1)' : 'scale(0.96)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 2,
          background: 'none', border: 'none', color: 'var(--secondary)',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px',
          letterSpacing: '0.4px', cursor: 'pointer', padding: '4px', lineHeight: 1,
        }}>✕</button>
        <div style={{
          backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: project.type === 'mac' ? 'flex-start' : 'center',
          paddingTop: project.type === 'mac' ? '8.43%' : '40px',
          paddingBottom: project.type === 'mac' ? '0' : '40px',
          minHeight: project.type === 'iphone' ? '420px' : undefined, overflow: 'hidden',
        }}>
          {mockup}
        </div>
        <div style={{
          backgroundColor: '#181818', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: '48px', flexShrink: 0,
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', letterSpacing: '0.4px', lineHeight: '20px', whiteSpace: 'nowrap',
        }}>
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

const allSrcs = [
  imgProDisplayXdr, imgBillboard, imgImage7, imgImage1, imgFrames,
  imgImage4, imgImage3, imgImage5, imgIPhoneScreen, imgIPhoneFrame, imgImage8,
]

const TEXT = { fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', system-ui, sans-serif", fontSize: '16px', lineHeight: '22px', letterSpacing: '-0.014px' }

export default function App() {
  const [showPortfolio, setShowPortfolio]     = useState(false)
  const [cornersVisible, setCornersVisible]   = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [imagesReady, setImagesReady]         = useState(false)
  const [sectionP, setSectionP]               = useState(0)   // 0 = hero, 1 = about

  const progressRef = useRef(0)
  const targetRef   = useRef(0)
  const snapRafRef  = useRef(0)
  const showPortRef = useRef(false)

  // Preload images
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

  // Fade in corners on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setCornersVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Lock scroll on landing, unlock on portfolio
  useEffect(() => {
    showPortRef.current = showPortfolio
    document.body.style.overflow = showPortfolio ? '' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [showPortfolio])

  // ── Fixed-pace ease-in-out to target ────────────────────────────────────
  const snapTo = useCallback((target: number) => {
    targetRef.current = target
    cancelAnimationFrame(snapRafRef.current)
    const from = progressRef.current
    const start = performance.now()
    const DURATION = 950 // ms — consistent pace every time

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // ease-in-out
      progressRef.current = from + (target - from) * eased
      setSectionP(progressRef.current)
      if (t < 1) snapRafRef.current = requestAnimationFrame(tick)
      else { progressRef.current = target; setSectionP(target) }
    }
    snapRafRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Damped scroll for project grid ───────────────────────────────────────
  useEffect(() => {
    if (!showPortfolio) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      window.scrollBy({ top: e.deltaY * 0.35, behavior: 'auto' })
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [showPortfolio])

  // ── Wheel + touch → trigger transition ───────────────────────────────────
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (showPortRef.current) return
      e.preventDefault()
      const desired = e.deltaY > 0 ? 1 : 0
      if (desired !== targetRef.current) snapTo(desired)
    }

    let touchStartY = 0
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY }
    const onTouchMove  = (e: TouchEvent) => { if (!showPortRef.current) e.preventDefault() }
    const onTouchEnd   = (e: TouchEvent) => {
      if (showPortRef.current) return
      const delta = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(delta) < 40) return
      const desired = delta > 0 ? 1 : 0
      if (desired !== targetRef.current) snapTo(desired)
    }

    window.addEventListener('wheel',      onWheel,      { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true  })
    window.addEventListener('touchmove',  onTouchMove,  { passive: false })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true  })
    return () => {
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchend',   onTouchEnd)
    }
  }, [snapTo])

  const goHome = useCallback(() => {
    setShowPortfolio(false)
    snapTo(0)
  }, [snapTo])

  const handleEnter = () => setShowPortfolio(true)

  const cornerFade = {
    opacity: cornersVisible ? 1 : 0,
    transition: 'opacity 0.7s ease',
  }

  return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh', width: '100%' }}>

      {/* ── Shooting stars ─────────────────────────────────────────────────── */}
      <ShootingStars />

      {/* ── Globe — always fixed in bg ──────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0, opacity: 0.45, pointerEvents: 'none',
      }}>
        <Globe size={660} />
      </div>

      {/* ── Domain badge — fixed top center ────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: '28px', left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px',
        pointerEvents: 'none', ...cornerFade,
      }}>
        <button onClick={goHome} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'auto',
        }}>
          <img src={imgIcon} alt="" style={{ width: '16px', height: '16px' }} />
          <span style={{ ...TEXT, color: 'var(--secondary)' }}>benjaminflora.com</span>
        </button>
      </div>

      {/* ── Top corners — fixed ─────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 10,
        paddingLeft: '28px', paddingRight: '28px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        pointerEvents: 'none', ...cornerFade,
        transition: 'opacity 0.7s ease 80ms',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ ...TEXT, color: '#ffffff' }}>Benjamin Flora</span>
          <button onClick={() => { setShowPortfolio(false); snapTo(1) }} style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            ...TEXT, color: 'var(--secondary)', textAlign: 'left', pointerEvents: 'auto',
          }}>About me →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <span style={{ ...TEXT, color: '#ffffff' }}>Los Angeles</span>
          <span style={{ ...TEXT, color: 'var(--secondary)' }}><LiveClock /></span>
        </div>
      </div>

      {/* ── Bottom corners — fixed ──────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: '40px', left: 0, right: 0, zIndex: 110,
        paddingLeft: '28px', paddingRight: '28px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        ...cornerFade, transition: 'opacity 0.7s ease 160ms',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ ...TEXT, color: '#ffffff' }}>Socials</span>
          <a href="https://www.linkedin.com/in/benjaminflora" target="_blank" rel="noreferrer"
            style={{ ...TEXT, color: 'var(--secondary)', textDecoration: 'none' }}>
            Linkedin →
          </a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <span style={{ ...TEXT, color: '#ffffff' }}>Contact</span>
          <a href="mailto:benmflora@gmail.com"
            style={{ ...TEXT, color: 'var(--secondary)', textDecoration: 'none' }}>
            benmflora@gmail.com
          </a>
        </div>
      </div>

      {/* ── Bottom gradient + blur — always ────────────────────────────────── */}
      {[
        { blur: 0.5, start:  0, end: 30 },
        { blur: 1.5, start: 20, end: 55 },
        { blur: 3,   start: 45, end: 72 },
        { blur: 6,   start: 62, end: 88 },
        { blur: 10,  start: 78, end: 100 },
      ].map(({ blur, start, end }, i) => (
        <div key={i} style={{
          position: 'fixed', bottom: 0, left: 0, width: '100%', height: '110px',
          backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`,
          maskImage: `linear-gradient(to bottom, transparent ${start}%, black ${end}%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent ${start}%, black ${end}%)`,
          pointerEvents: 'none', zIndex: 100,
        }} />
      ))}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%', height: '110px',
        background: 'linear-gradient(to bottom, rgba(8,8,8,0) 0%, rgba(8,8,8,0.5) 49%, #080808 100%)',
        pointerEvents: 'none', zIndex: 105,
      }} />

      {/* ── Hero — fades out on scroll or portfolio ─────────────────────────── */}
      {(() => {
        const heroOpacity = showPortfolio ? 0 : Math.max(0, 1 - sectionP * 2) * (cornersVisible ? 1 : 0)
        return (
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: `translate(-50%, calc(-50% + ${sectionP * -70}px))`,
            zIndex: 1, width: 'min(470px, 90vw)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px',
            opacity: heroOpacity,
            pointerEvents: heroOpacity < 0.1 ? 'none' : 'auto',
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '16px',
              textAlign: 'center', width: '100%',
              filter: 'drop-shadow(0px 0px 176px rgba(255,255,255,0.26))',
            }}>
              <FadeText delay={0} style={{
                fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400,
                fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.15,
                letterSpacing: '-0.5px', color: '#f7f8f8',
              }}>
                UX and Systems Designer
              </FadeText>
              <FadeText delay={0.3} style={{ ...TEXT, fontSize: '17px', color: 'var(--secondary)' }}>
                Designing Mission Critical Software @ Sift
              </FadeText>
            </div>
            <button onClick={handleEnter} style={{
              background: 'linear-gradient(to bottom, #ffffff, #e6e6e6)',
              border: 'none', borderRadius: '0', cursor: 'pointer',
              padding: '8px 16px',
              boxShadow: '0px 0px 38.8px 0px rgba(255,255,255,0.25)',
              fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, textTransform: 'uppercase',
              fontSize: '13px', lineHeight: '22px', letterSpacing: '0.4px', color: '#08090a',
            }}>
              See Work
            </button>
          </div>
        )
      })()}

      {/* ── About — fades in on scroll down ─────────────────────────────────── */}
      {(() => {
        const aboutOpacity = showPortfolio ? 0 : Math.max(0, (sectionP - 0.3) * 2)
        return (
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: `translate(-50%, calc(-50% + ${(1 - sectionP) * 70}px))`,
            zIndex: 1, width: 'min(440px, 90vw)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px',
            textAlign: 'center',
            opacity: aboutOpacity,
            pointerEvents: aboutOpacity < 0.1 ? 'none' : 'auto',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <p style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', system-ui, sans-serif", fontWeight: 500,
                fontSize: 'clamp(30px, 4.5vw, 42px)', lineHeight: 1.15,
                letterSpacing: '-0.4px', color: '#f7f8f8', margin: 0,
              }}>
                Designer, builder,<br />based in LA.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ ...TEXT, color: 'var(--secondary)', margin: 0 }}>
                  Currently designing brand direction, billboards, and public-facing
                  graphic assets at AQ–(recently raised a $30M Series A at $300M).
                  Previously at July, designing systems to help talent managers land
                  brand deals for their clients, and manage creators at scale.
                </p>
                <p style={{ ...TEXT, color: 'var(--secondary)', margin: 0 }}>
                  My design expertise is deeply rooted in a passion for illustration–I
                  picked up the pencil and paintbrush at 5 years old, and spent the rest
                  of my life dedicated towards self-expression through a dense, vibrant,
                  doodle art-style. I often describe my work as similar to Takashi
                  Murakami or Vexx.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
              <button onClick={handleEnter} style={{
                background: 'linear-gradient(to bottom, #ffffff, #e6e6e6)',
                border: 'none', borderRadius: '0', cursor: 'pointer',
                padding: '8px 16px',
                fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, textTransform: 'uppercase',
                fontSize: '13px', lineHeight: '22px', letterSpacing: '0.4px', color: '#08090a',
              }}>
                See Work
              </button>
              <a href="mailto:benmflora@gmail.com"
                style={{ ...TEXT, color: 'var(--secondary)', textDecoration: 'none' }}>
                benmflora@gmail.com →
              </a>
            </div>
          </div>
        )
      })()}

      {/* ── Project grid — fades in after See Work ──────────────────────────── */}
      <div
        onClick={() => setShowPortfolio(false)}
        style={{
          position: 'relative', zIndex: 1,
          paddingTop: '140px',
          opacity: showPortfolio ? 1 : 0,
          transition: 'opacity 0.6s ease 0.1s',
          pointerEvents: showPortfolio ? 'auto' : 'none',
          cursor: 'default',
        }}
      >
        <div className="page-padding project-grid">
          {projects.map((project, i) => (
            <ProjectCard
              key={i} project={project} index={i}
              onOpen={() => setSelectedProject(project)}
              ready={imagesReady && showPortfolio}
            />
          ))}
        </div>
        <div style={{ height: '140px' }} />
      </div>

      {/* ── Scroll hint — visible on hero, disappears on about ──────────────── */}
      <div style={{
        position: 'fixed', bottom: '36px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 115, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        opacity: showPortfolio ? 0 : Math.max(0, (1 - sectionP * 4)) * (cornersVisible ? 1 : 0),
        transition: 'opacity 0.4s ease',
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px',
          letterSpacing: '0.6px', color: 'var(--secondary)',
        }}>(about me)</span>
        <span style={{
          color: 'var(--secondary)', fontSize: '11px',
          display: 'inline-block', animation: 'bounceArrow 1.8s ease-in-out infinite',
        }}>↓</span>
      </div>

      {selectedProject && (
        <ProjectOverlay project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  )
}
