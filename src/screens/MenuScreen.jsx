import { useMemo, useState } from 'react'
import { fmt } from '../lib/format.js'
import { useMenu } from '../hooks/useMenu.js'
import { useCategories } from '../hooks/useCategories.js'
import { Loading, ErrorPanel } from '../components/QueryStates.jsx'
import ProductImage from '../components/ProductImage.jsx'

export default function MenuScreen({ cart, onCartChange, onCheckout, event }) {
  const menu = useMenu(event?.id)
  const categories = useCategories()

  // First non-"all" category becomes the initial tab once data is loaded.
  const firstCategory = useMemo(() => {
    const list = categories.data ?? []
    return list.find(c => c.id !== 'all')?.id ?? list[0]?.id ?? null
  }, [categories.data])

  const [category, setCategory] = useState(null)
  const activeCategory = category ?? firstCategory

  const items = useMemo(
    () => (menu.data ?? [])
      .filter(p => p.category === activeCategory)
      // Dev-only MP test product floats to the top for quick payment testing.
      // (It only exists in the dev seed, so this is a no-op in production.)
      .sort((a, b) => {
        const rank = id => id === 'p_test' ? 0 : id === 'p_test_low' ? 1 : id === 'p_test_oos' ? 2 : 3
        return rank(a.id) - rank(b.id)
      }),
    [menu.data, activeCategory]
  )

  const totalItems = Object.values(cart).reduce((s, n) => s + n, 0)
  const totalPrice = useMemo(
    () => (menu.data ?? []).reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0),
    [menu.data, cart]
  )

  function setQty(id, delta, stock) {
    const cur = cart[id] || 0
    const next = Math.min(stock, Math.max(0, cur + delta))
    onCartChange({ ...cart, [id]: next })
  }

  if (menu.isLoading || categories.isLoading) {
    return <Loading label="Cargando menú…" />
  }
  if (menu.isError || categories.isError) {
    return (
      <ErrorPanel
        title="No se pudo cargar el menú"
        message="Verificá tu conexión y volvé a intentar."
        onRetry={() => { menu.refetch(); categories.refetch() }}
      />
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {event && (
        <div style={{
          padding: '10px 20px', background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>🎪</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{event.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{event.venue}</div>
          </div>
        </div>
      )}

      <div className="pill-tabs">
        {(categories.data ?? []).filter(c => c.id !== 'all').map(cat => (
          <button
            key={cat.id}
            className={`pill-tab${activeCategory === cat.id ? ' active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="screen-body" style={{ flex: 1, overflowY: 'auto' }}>
        {items.map(p => {
          const qty = cart[p.id] || 0
          const oos = p.stock === 0
          const atMax = qty >= p.stock
          const lowStock = p.stock > 0 && p.stock <= 5
          return (
            <div key={p.id} className={`product-card${oos ? ' out-of-stock' : ''}`}>
              <div className="product-emoji">
                <ProductImage product={p} size={40} />
              </div>
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-sub">{p.subtitle}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div className="product-price">{fmt(p.price)}</div>
                  {oos && <span className="badge-danger">Agotado</span>}
                  {lowStock && !oos && <span className="low-stock">Solo {p.stock} disponibles</span>}
                </div>
              </div>
              <div className="product-right">
                {!oos && (
                  qty === 0 ? (
                    <button
                      onClick={() => setQty(p.id, 1, p.stock)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--accent)', color: 'var(--accent-on)',
                        fontSize: 20, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >+</button>
                  ) : (
                    <div className="stepper">
                      <button className={qty > 0 ? 'active' : ''} onClick={() => setQty(p.id, -1, p.stock)}>−</button>
                      <span className="qty">{qty}</span>
                      <button className={atMax ? '' : 'active'} disabled={atMax} onClick={() => setQty(p.id, 1, p.stock)}>+</button>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      {totalItems > 0 && (
        <div className="cart-bar" onClick={onCheckout}>
          <div className="cart-info">
            <div className="cart-label">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</div>
            <div className="cart-total">{fmt(totalPrice)}</div>
          </div>
          <div className="cart-cta">Ver pedido →</div>
        </div>
      )}

      {totalItems === 0 && (
        <div style={{
          margin: '0 20px 20px',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0,
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
