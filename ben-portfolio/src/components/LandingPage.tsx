import { useEffect, useState } from 'react'
import Globe from './Globe'

type Props = {
  onEnter: () => void
}

export default function LandingPage({ onEnter }: Props) {
  const [visible, setVisible] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

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

  const fade = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(8px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: '#080808',
      overflow: 'hidden',
    }}>
      {/* Globe background */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <Globe size={660} />
      </div>

      {/* Domain badge — top center */}
      <div style={{
        position: 'absolute', top: '28px', left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px',
        zIndex: 1, ...fade,
      }}>
        <img src="/images/icon.svg" alt="" style={{ width: 16, height: 16 }} />
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: '20px',
          letterSpacing: '-0.014px', color: 'var(--secondary)',
        }}>
          benjaminflora.com
        </span>
      </div>

      {/* Top-left — name */}
      <div style={{
        position: 'absolute', top: '40px', left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between',
        padding: '72px 40px 0',
        zIndex: 1, ...fade,
        transition: 'opacity 0.7s ease 80ms, transform 0.7s ease 80ms',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: '20px', letterSpacing: '-0.014px', color: '#ffffff' }}>
            Benjamin Flora
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: '20px', letterSpacing: '-0.014px', color: 'var(--secondary)' }}>
            About me →
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: '20px', letterSpacing: '-0.014px', color: '#ffffff' }}>
            Los Angeles
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: '20px', letterSpacing: '-0.014px', color: 'var(--secondary)' }}>
            {time}
          </span>
        </div>
      </div>

      {/* Center hero */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40,
        width: 'min(470px, 90vw)',
        zIndex: 1,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.15s',
      }}>
        {/* Text */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          textAlign: 'center', width: '100%',
          filter: 'drop-shadow(0px 0px 176px rgba(255,255,255,0.26))',
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 500,
            fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: '1.1',
            letterSpacing: '-0.528px', color: '#f7f8f8', margin: 0,
          }}>
            Web & Brand Designer
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 400,
            fontSize: 15, lineHeight: '20px',
            letterSpacing: '-0.03px', color: 'var(--secondary)', margin: 0,
          }}>
            Currently at AfterQuery{' '}
            <span style={{ textDecoration: 'underline' }}>($30M Series A at $300M)</span>
          </p>
        </div>

        {/* See Work button */}
        <button
          onClick={onEnter}
          style={{
            background: 'linear-gradient(to bottom, #ffffff, #e6e6e6)',
            border: 'none', borderRadius: 4, cursor: 'pointer',
            padding: '8px 10px',
            boxShadow: '0px 0px 38.8px 0px rgba(255,255,255,0.25)',
            fontFamily: "'Inter', sans-serif", fontWeight: 500,
            fontSize: 14, lineHeight: '20px',
            letterSpacing: '-0.014px', color: '#08090a',
          }}
        >
          See Work
        </button>
      </div>

      {/* Bottom corners */}
      <div style={{
        position: 'absolute', bottom: '40px', left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 2,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.7s ease 0.25s',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: '20px', letterSpacing: '-0.014px', color: '#ffffff' }}>
            Socials
          </span>
          <a href="https://linkedin.com" style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: '20px', letterSpacing: '-0.014px', color: 'var(--secondary)', textDecoration: 'none' }}>
            Linkedin →
          </a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: '20px', letterSpacing: '-0.014px', color: '#ffffff' }}>
            Contact
          </span>
          <a href="mailto:benmflora@gmail.com" style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: '20px', letterSpacing: '-0.014px', color: 'var(--secondary)', textDecoration: 'none' }}>
            benmflora@gmail.com
          </a>
        </div>
      </div>

      {/* Bottom gradient + blur fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 220,
        background: 'linear-gradient(to bottom, rgba(8,8,8,0) 0%, rgba(8,8,8,0.6) 49%, #080808 100%)',
        backdropFilter: 'blur(9.75px)',
        WebkitBackdropFilter: 'blur(9.75px)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
    </div>
  )
}
