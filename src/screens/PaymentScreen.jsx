import { useEffect, useState } from 'react'
import { PRODUCTS, fmt } from '../data'

const PAYMENT_METHODS = [
  { id: 'balance', label: 'Dinero en cuenta', detail: 'Saldo disponible $18.450', icon: '💰', selected: true },
  { id: 'visa',    label: 'Visa ····  4521',   detail: 'Crédito · Vence 08/27',   icon: '💳', selected: false },
  { id: 'debit',   label: 'Mastercard ···· 9873', detail: 'Débito',               icon: '💳', selected: false },
]

export default function PaymentScreen({ cart, phase, onSuccess, onRetry, onBack }) {
  const [dots, setDots] = useState('.')
  const [selectedMethod, setSelectedMethod] = useState('balance')

  const total = PRODUCTS.reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0)

  useEffect(() => {
    if (phase !== 'paying') return
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(t)
  }, [phase])

  if (phase === 'payment') {
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod)
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="screen-body">
          {/* MP branding strip */}
          <div style={{
            background: 'var(--mp)', padding: '16px 20px 20px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <MpLogo />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Mercado Pago</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Billetera virtual · joaquin.ig.campos@gmail.com</div>
            </div>
          </div>

          {/* Amount */}
          <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 4 }}>Total a pagar</div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em' }}>{fmt(total)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Festival Eclipse · Barra Norte</div>
          </div>

          {/* Payment method selector */}
          <div className="section-title" style={{ marginTop: 8 }}>Medio de pago</div>
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px',
                  background: selectedMethod === m.id ? 'var(--mp-dim)' : 'var(--surface2)',
                  border: `1px solid ${selectedMethod === m.id ? 'var(--mp)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left', width: '100%', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: selectedMethod === m.id ? 'rgba(0,177,234,0.2)' : 'var(--surface3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{m.detail}</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${selectedMethod === m.id ? 'var(--mp)' : 'var(--border-strong)'}`,
                  background: selectedMethod === m.id ? 'var(--mp)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {selectedMethod === m.id && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Order breakdown */}
          <div className="section-title" style={{ marginTop: 8 }}>Resumen</div>
          <div style={{ padding: '0 20px 8px' }}>
            <div className="info-card">
              {PRODUCTS.filter(p => (cart[p.id] || 0) > 0).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-dim)' }}>{cart[p.id]}× {p.name}</span>
                  <span style={{ fontWeight: 600 }}>{fmt(p.price * cart[p.id])}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px 20px' }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Pago encriptado y seguro por Mercado Pago</span>
          </div>
        </div>

        <div style={{ padding: '12px 20px 28px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn-primary"
            onClick={onSuccess}
            style={{ background: 'var(--mp)', color: '#fff' }}
          >
            Pagar {fmt(total)} con {method.label}
          </button>
          <button className="btn-secondary" onClick={onBack}>Cancelar</button>
        </div>
      </div>
    )
  }

  if (phase === 'paying') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          border: '3px solid var(--mp)', borderTopColor: 'transparent',
          animation: 'fb-spin 0.8s linear infinite',
        }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--mp)', marginBottom: 6 }}>
            Procesando{dots}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>No cierres la aplicación</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--mp)' }}>{fmt(total)}</div>
      </div>
    )
  }

  if (phase === 'rejected') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--danger-dim)', border: '2px solid var(--danger)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
        }}>✕</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Pago rechazado</div>
          <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            No pudimos procesar el pago. Verificá tu saldo o intentá con otra tarjeta.
          </div>
        </div>
        <div style={{ padding: '12px 20px', width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn-primary"
            onClick={onRetry}
            style={{ background: 'var(--mp)', color: '#fff' }}
          >
            Reintentar pago
          </button>
          <button className="btn-secondary" onClick={onBack}>Volver al pedido</button>
        </div>
      </div>
    )
  }

  return null
}

function MpLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="11" fill="white" fillOpacity="0.15"/>
      <text x="11" y="15.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="white" fontFamily="Arial, sans-serif">MP</text>
    </svg>
  )
}
