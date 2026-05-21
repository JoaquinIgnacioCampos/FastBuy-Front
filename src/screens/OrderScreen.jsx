import { PRODUCTS, fmt } from '../data'

export default function OrderScreen({ cart, onPay, onBack }) {
  const lineItems = PRODUCTS.filter(p => (cart[p.id] || 0) > 0).map(p => ({
    ...p, qty: cart[p.id], subtotal: p.price * cart[p.id],
  }))
  const total = lineItems.reduce((s, i) => s + i.subtotal, 0)
  const totalItems = lineItems.reduce((s, i) => s + i.qty, 0)

  if (lineItems.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Carrito vacío</h3>
          <p>Volvé al menú y agregá lo que querés pedir.</p>
          <button className="btn-primary" onClick={onBack} style={{ marginTop: 8 }}>
            Ir al menú
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="screen-body">
        {/* Items */}
        <div className="section-title">Tu pedido</div>

        {lineItems.map(item => (
          <div key={item.id} className="order-row">
            <div className="row-left">
              <div className="row-emoji">{item.emoji}</div>
              <div className="row-info">
                <div className="row-name">{item.name}</div>
                <div className="row-sub">{item.qty} × {fmt(item.price)}</div>
              </div>
            </div>
            <div className="row-price">{fmt(item.subtotal)}</div>
          </div>
        ))}

        <div className="divider" style={{ margin: '8px 0' }} />

        {/* Totals */}
        <div style={{ padding: '4px 20px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: 'var(--text-dim)' }}>
            <span>{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</span>
            <span>{fmt(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: 'var(--text-dim)' }}>
            <span>Cargo de servicio</span>
            <span>$0</span>
          </div>
          <div className="divider" style={{ margin: '4px -20px', marginLeft: 0, marginRight: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 18, fontWeight: 800 }}>
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>

        {/* Pickup location */}
        <div style={{ padding: '0 20px 20px' }}>
          <div className="info-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 20, marginTop: 2 }}>📍</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Punto de retiro</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                Barra Norte · Planta baja · cerca del escenario principal
              </div>
            </div>
          </div>
        </div>

        {/* Payment section */}
        <div className="section-title">Medio de pago</div>
        <div style={{ padding: '0 20px 24px' }}>
          <div className="info-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--mp-dim)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 18 }}>💳</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Mercado Pago</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Único medio de pago disponible</div>
            </div>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--mp)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 20px 28px', borderTop: '1px solid var(--border)' }}>
        <button className="btn-primary" onClick={onPay} style={{ background: 'var(--mp)', color: '#fff' }}>
          Pagar {fmt(total)} con Mercado Pago
        </button>
      </div>
    </div>
  )
}
