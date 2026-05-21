import { QRCodeSVG } from 'qrcode.react'
import { PRODUCTS, fmt } from '../data'

export default function QRScreen({ cart, phase, bar, onConfirmed }) {
  const total = PRODUCTS.reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0)
  const orderId = `FB${Math.floor(total / 100).toString().padStart(3, '0')}`

  // Use product IDs (no emoji/Unicode) to keep the QR code short and reliably scannable
  const qrValue = JSON.stringify({
    id: orderId,
    total,
    items: PRODUCTS
      .filter(p => (cart[p.id] || 0) > 0)
      .map(p => ({ pid: p.id, q: cart[p.id] })),
  })

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
            Retiro confirmado. Disfrutá el Festival Eclipse 🎉
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
        {PRODUCTS.filter(p => (cart[p.id] || 0) > 0).map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 20 }}>{p.emoji}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>× {cart[p.id]}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt(p.price * cart[p.id])}</span>
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

      {/* Demo confirm button */}
      <div style={{ padding: '12px 20px 28px', borderTop: '1px solid var(--border)' }}>
        <button className="btn-primary" onClick={onConfirmed}>
          Simular escaneo de QR ✓
        </button>
      </div>
    </div>
  )
}
