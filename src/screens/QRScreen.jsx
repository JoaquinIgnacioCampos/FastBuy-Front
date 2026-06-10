import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { fmt } from '../lib/format.js'
import { useProductMap, resolveProduct } from '../hooks/useMenu.js'

export default function QRScreen({ cart, phase, bar, activeOrder, event, onConfirmed }) {
  const productMap = useProductMap()

  const cartLines = useMemo(
    () => Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([pid, qty]) => ({ ...resolveProduct(productMap, pid), qty })),
    [cart, productMap]
  )
  const total = cartLines.reduce((s, p) => s + p.price * p.qty, 0)

  // Use real backend ID and items when available, fall back to computed values in demo mode
  const orderId  = activeOrder?.id    ?? `FB${Math.floor(total / 100).toString().padStart(3, '0')}`
  const qrItems  = activeOrder?.items ?? cartLines.map(p => ({ pid: p.id, q: p.qty }))
  const qrTotal  = activeOrder?.total ?? total

  // Use product IDs (no emoji/Unicode) to keep the QR code short and reliably scannable
  const qrValue = JSON.stringify({ id: orderId, total: qrTotal, items: qrItems })

  if (phase === 'confirmed') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32 }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'var(--accent-dim)', border: '3px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, animation: 'fb-bounce 0.6s ease-out',
        }}>✓</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>¡Listo!</div>
          <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Retiro confirmado. Disfrutá {event?.name ?? 'el evento'} 🎉
          </div>
        </div>
        <div style={{ fontSize: 32 }}>🍺🍹🥃</div>
        <button className="btn-primary" onClick={onConfirmed} style={{ width: '100%' }}>
          Hacer otro pedido
        </button>
      </div>
    )
  }

  return (
    <div data-theme="light" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="screen-body">
        {/* Alert */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            background: 'var(--accent-dim)', border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-sm)', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
              Acercate a {bar?.label ?? 'la barra'} y mostrá este código
            </span>
          </div>
        </div>

        {/* QR */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 32px' }}>
          <div className="qr-wrap" style={{ padding: 20 }}>
            <QRCodeSVG value={qrValue} size={200} />
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-dim)' }}>
            Pedido #{orderId}
          </div>
        </div>

        {/* Order summary */}
        <div className="section-title">Tu pedido</div>
        {cartLines.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 20 }}>{p.emoji}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>× {p.qty}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt(p.price * p.qty)}</span>
          </div>
        ))}

        {/* Total */}
        <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>

        {/* Location */}
        <div style={{ padding: '0 20px 28px' }}>
          <div className="info-card" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, marginTop: 1 }}>📍</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{bar?.label ?? 'Barra'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                {bar?.location ?? ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
