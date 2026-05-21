import { useEffect, useState } from 'react'
import { PRODUCTS, fmt } from '../data'

const STEPS = [
  { key: 'queue',     label: 'En cola',    sub: 'Tu pedido fue recibido y está esperando turno' },
  { key: 'preparing', label: 'Preparando', sub: 'El bartender está haciendo tu pedido' },
  { key: 'ready',     label: 'Listo',       sub: 'Acercate a la barra a retirarlo' },
]

export default function QueueScreen({ phase, cart, bar, offline, onReady, onOfflineRetry }) {
  const [elapsedSec, setElapsedSec] = useState(0)
  const total = PRODUCTS.reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0)
  const totalItems = PRODUCTS.reduce((s, p) => s + (cart[p.id] || 0), 0)

  useEffect(() => {
    const t = setInterval(() => setElapsedSec(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const fmtTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const currentStep = STEPS.findIndex(s => s.key === phase)

  if (offline) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
        <div style={{ fontSize: 48 }}>📡</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sin conexión</div>
          <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            No podemos actualizar el estado de tu pedido. Tu pago fue acreditado correctamente.
          </div>
        </div>
        <div style={{
          background: 'var(--warn-dim)', border: '1px solid var(--warn)',
          borderRadius: 'var(--radius-sm)', padding: '12px 16px',
          display: 'flex', gap: 10, width: '100%',
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: 13, color: 'var(--warn)' }}>
            Esperá la notificación push cuando tu pedido esté listo.
          </span>
        </div>
        <button className="btn-primary" onClick={onOfflineRetry} style={{ width: '100%' }}>
          Reintentar conexión
        </button>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="screen-body">
        {/* Order summary card */}
        <div style={{ padding: '16px 20px' }}>
          <div className="info-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 3 }}>Pedido #FB{Math.floor(total / 100)}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{fmt(total)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 3 }}>Tiempo</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(elapsedSec)}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'} · {bar?.label ?? 'Barra'}
            </div>
          </div>
        </div>

        {/* Status steps */}
        <div className="section-title">Estado del pedido</div>
        <div className="status-steps">
          {STEPS.map((step, i) => {
            const isDone   = i < currentStep
            const isActive = i === currentStep
            const isLast   = i === STEPS.length - 1
            return (
              <div key={step.key} className="status-step">
                <div className="step-indicator">
                  <div className={`step-dot${isDone ? ' done' : isActive ? ' active' : ''}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  {!isLast && <div className={`step-line${isDone ? ' done' : ''}`} />}
                </div>
                <div className="step-content">
                  <div className={`step-title${isActive ? ' active' : isDone ? ' done' : ''}`}>
                    {step.label}
                  </div>
                  {isActive && <div className="step-sub">{step.sub}</div>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Active state indicator */}
        {phase === 'queue' && (
          <div style={{ padding: '8px 20px 20px' }}>
            <div style={{
              background: 'var(--accent-dim)', border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span className="animate-pulse" style={{ fontSize: 18 }}>⏳</span>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                Posición en cola: #3 · Espera estimada ~8 min
              </span>
            </div>
          </div>
        )}

        {phase === 'preparing' && (
          <div style={{ padding: '8px 20px 20px' }}>
            <div style={{
              background: 'var(--warn-dim)', border: '1px solid var(--warn)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span className="animate-pulse" style={{ fontSize: 18 }}>👨‍🍳</span>
              <span style={{ fontSize: 13, color: 'var(--warn)', fontWeight: 600 }}>
                Tu bartender está preparando el pedido
              </span>
            </div>
          </div>
        )}

        {phase === 'ready' && (
          <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: 'var(--accent-dim)', border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>🔔</span>
              <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>
                ¡Tu pedido está listo!
              </span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '12px 14px',
              display: 'flex', gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--accent)', color: 'var(--accent-on)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, flexShrink: 0,
              }}>F</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>FastBuy</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                  🍺 ¡Tu pedido está listo! Mostrá el QR en {bar?.label ?? 'la barra'}.
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={onReady}>
              Mostrar QR para retirar →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
