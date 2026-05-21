import { useState } from 'react'
import { EVENT } from '../data'

const BARTENDER_CODE = '00000000'

export default function WelcomeScreen({ onLogin, onBartender }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 8) return
    setLoading(true)
    // Ask for notification permission during the user gesture
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    const isBartender = digits === BARTENDER_CODE
    setTimeout(() => isBartender ? onBartender() : onLogin(), 1000)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Hero section */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 28px 24px', gap: 24,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: 'var(--accent)', color: 'var(--accent-on)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, fontWeight: 900, margin: '0 auto 16px',
            boxShadow: '0 0 40px var(--accent-glow)',
          }}>F</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>FastBuy</div>
          <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 4 }}>Pedí desde tu lugar</div>
        </div>

        {/* Event info */}
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '14px 16px', width: '100%',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Evento activo
          </div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{EVENT.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 3 }}>
            {EVENT.venue}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
            {EVENT.hours}
          </div>
          <div style={{
            marginTop: 10, padding: '6px 10px', background: 'var(--surface3)',
            borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>🍺</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>
              {EVENT.bar} · {EVENT.barLocation}
            </span>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', marginBottom: 6, display: 'block' }}>
              Tu número de celular
            </label>
            <input
              type="tel"
              placeholder="+54 9 11 ···· ····"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{
                width: '100%', padding: '13px 14px',
                background: 'var(--surface2)', border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                fontSize: 16, outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || phone.replace(/\D/g, '').length < 8}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--accent-on)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                Ingresando…
              </span>
            ) : 'Entrar al evento →'}
          </button>

          {/* Demo cheatsheet */}
          <div style={{
            padding: '10px 12px',
            background: 'var(--surface3)',
            borderRadius: 'var(--radius-xs)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Demo</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-dim)' }}>👤 Usuario</span>
              <span style={{ color: 'var(--text-mute)', fontFamily: 'monospace' }}>cualquier número</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-dim)' }}>🍹 Bartender</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)' }}>0000 0000</span>
            </div>
          </div>
        </form>

        <div style={{ fontSize: 12, color: 'var(--text-mute)', textAlign: 'center', lineHeight: 1.5 }}>
          Al continuar aceptás los términos del evento.
        </div>
      </div>

      {/* Bartender toggle */}
      <div style={{ padding: '0 28px 28px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onBartender}
          style={{
            fontSize: 13, color: 'var(--text-mute)',
            padding: '8px 16px', borderRadius: 99,
            border: '1px solid var(--border)',
          }}
        >
          Vista Bartender 🍹
        </button>
      </div>
    </div>
  )
}
