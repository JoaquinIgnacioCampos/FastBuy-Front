import { useState } from 'react'
import { PRODUCTS, CATEGORIES, fmt } from '../data'

export default function MenuScreen({ cart, onCartChange, onCheckout }) {
  const [category, setCategory] = useState('cervezas')

  const items = PRODUCTS.filter(p => p.category === category)
  const totalItems = Object.values(cart).reduce((s, n) => s + n, 0)
  const totalPrice = PRODUCTS.reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0)

  function setQty(id, delta) {
    const cur = cart[id] || 0
    const next = Math.max(0, cur + delta)
    onCartChange({ ...cart, [id]: next })
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Event bar */}
      <div style={{
        padding: '10px 20px', background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>🍺</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Barra Norte</div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>Festival Eclipse · Costanera Sur</div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="pill-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`pill-tab${category === cat.id ? ' active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="screen-body" style={{ paddingBottom: totalItems > 0 ? 100 : 20 }}>
        {items.map(p => {
          const qty = cart[p.id] || 0
          const oos = p.stock === 0
          const lowStock = p.stock > 0 && p.stock <= 5
          return (
            <div key={p.id} className={`product-card${oos ? ' out-of-stock' : ''}`}>
              <div className="product-emoji">{p.emoji}</div>
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-sub">{p.subtitle}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div className="product-price">{fmt(p.price)}</div>
                  {oos && <span className="badge-danger">Agotado</span>}
                  {lowStock && !oos && <span className="low-stock">Solo {p.stock} left</span>}
                </div>
              </div>
              <div className="product-right">
                {!oos && (
                  qty === 0 ? (
                    <button
                      onClick={() => setQty(p.id, 1)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--accent)', color: 'var(--accent-on)',
                        fontSize: 20, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >+</button>
                  ) : (
                    <div className="stepper">
                      <button className={qty > 0 ? 'active' : ''} onClick={() => setQty(p.id, -1)}>−</button>
                      <span className="qty">{qty}</span>
                      <button className="active" onClick={() => setQty(p.id, 1)}>+</button>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating cart */}
      {totalItems > 0 && (
        <div className="cart-bar" onClick={onCheckout}>
          <div className="cart-info">
            <div className="cart-label">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</div>
            <div className="cart-total">{fmt(totalPrice)}</div>
          </div>
          <div className="cart-cta">Ver pedido →</div>
        </div>
      )}

      {/* Empty state for empty cart tap */}
      {totalItems === 0 && (
        <div style={{
          position: 'absolute', bottom: 20, left: 20, right: 20,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🛒</span>
          <span style={{ fontSize: 13, color: 'var(--text-mute)' }}>
            Agregá productos para hacer tu pedido
          </span>
        </div>
      )}
    </div>
  )
}
