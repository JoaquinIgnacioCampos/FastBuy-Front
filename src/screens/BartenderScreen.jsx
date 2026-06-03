import { useMemo, useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { fmt } from '../lib/format.js'
import { useProductMap } from '../hooks/useMenu.js'
import { useOrders } from '../hooks/useOrders.js'
import { useAdvanceOrder } from '../hooks/useAdvanceOrder.js'
import { useMarkDelivered } from '../hooks/useMarkDelivered.js'
import { ErrorPanel } from '../components/QueryStates.jsx'

function makeResolver(productMap) {
  return ({ pid, q }) => {
    const p = productMap.get(pid)
    return p
      ? { emoji: p.emoji ?? p.image ?? '📦', name: p.name, qty: q }
      : { emoji: '📦', name: pid, qty: q }
  }
}

function itemsAreEqual(a, b) {
  const norm = arr => [...arr].sort((x, y) => x.pid < y.pid ? -1 : 1)
  const na = norm(a), nb = norm(b)
  return na.length === nb.length && na.every((x, i) => x.pid === nb[i].pid && x.q === nb[i].q)
}

// ── Real camera QR scanner ────────────────────────────────────
function QRCameraScanner({ onScan }) {
  const containerRef = useRef(null)
  // 'checking' | 'prompt' | 'scanning' | 'error'
  const [stage, setStage] = useState('checking')
  const [error, setError] = useState(null)
  const cbRef = useRef(onScan)
  cbRef.current = onScan

  useEffect(() => {
    async function checkPerm() {
      try {
        if ('permissions' in navigator) {
          const res = await navigator.permissions.query({ name: 'camera' })
          setStage(res.state === 'granted' ? 'scanning' : 'prompt')
        } else {
          setStage('prompt')
        }
      } catch {
        setStage('prompt')
      }
    }
    checkPerm()
  }, [])

  useEffect(() => {
    if (stage !== 'scanning') return
    const elem = containerRef.current
    if (!elem) return

    const uid = 'fb-qr-' + Math.random().toString(36).slice(2)
    elem.id = uid

    const scanner = new Html5Qrcode(uid, { verbose: false })
    let active = true

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10 },
        (text) => {
          if (!active) return
          active = false
          scanner.stop().catch(() => {}).finally(() => cbRef.current(text))
        },
        () => {}
      )
      .catch(err => {
        if (!active) return
        const msg = err?.message ?? String(err)
        const denied = /NotAllowed|Permission|denied/i.test(msg)
        setError({
          denied,
          msg: denied
            ? 'Permiso denegado. Habilitá la cámara en la configuración del navegador y volvé a intentarlo.'
            : (msg || 'No se pudo acceder a la cámara.'),
        })
        setStage('error')
      })

    return () => {
      active = false
      if (scanner.isScanning) {
        scanner.stop().catch(() => {}).finally(() => { if (elem) elem.innerHTML = '' })
      } else {
        if (elem) elem.innerHTML = ''
      }
    }
  }, [stage])

  if (stage === 'checking') {
    return <div style={{ height: 200, background: 'var(--surface2)', borderRadius: 12 }} />
  }

  if (stage === 'prompt') {
    return (
      <div style={{
        background: 'var(--surface2)', borderRadius: 12,
        padding: '28px 20px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16, textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--accent-dim)', border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>📷</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Acceso a la cámara</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Para escanear el QR del cliente necesitamos acceder a tu cámara.
          </div>
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={() => setStage('scanning')}>
          Habilitar cámara
        </button>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div style={{
        background: 'var(--surface2)', borderRadius: 12,
        padding: '28px 20px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16, textAlign: 'center',
      }}>
        <span style={{ fontSize: 40 }}>{error?.denied ? '🚫' : '📷'}</span>
        <div>
          <div style={{
            fontSize: 14, fontWeight: 700, marginBottom: 6,
            color: error?.denied ? 'var(--danger)' : 'var(--text)',
          }}>
            {error?.denied ? 'Permiso denegado' : 'Error de cámara'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            {error?.msg}
          </div>
        </div>
        {!error?.denied && (
          <button
            className="btn-secondary"
            style={{ width: '100%' }}
            onClick={() => { setError(null); setStage('scanning') }}
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
      <div ref={containerRef} style={{ width: '100%' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { top: 12, left: 12, borderWidth: '3px 0 0 3px', borderRadius: '4px 0 0 0' },
          { top: 12, right: 12, borderWidth: '3px 3px 0 0', borderRadius: '0 4px 0 0' },
          { bottom: 12, left: 12, borderWidth: '0 0 3px 3px', borderRadius: '0 0 0 4px' },
          { bottom: 12, right: 12, borderWidth: '0 3px 3px 0', borderRadius: '0 0 4px 0' },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute', width: 28, height: 28,
            borderStyle: 'solid', borderColor: 'var(--accent)', ...s,
          }} />
        ))}
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────
export default function BartenderScreen({ onBack, scannerPhase, onScannerOpen, onScannerClose, bartenderBar }) {
  const [tab, setTab] = useState('queue')
  const [delivered, setDelivered] = useState([])
  const [scannedOrder, setScannedOrder] = useState(null)
  const productMap = useProductMap()
  const resolveItem = makeResolver(productMap)

  const barId = bartenderBar?.id ?? 'north'

  const ordersQuery = useOrders(barId)
  const advanceMutation = useAdvanceOrder(barId)
  const deliverMutation = useMarkDelivered(barId)

  const allOrders = ordersQuery.data ?? []
  const { queueOnly, preparingOnly, readyOrders } = useMemo(() => {
    const queueOnly     = allOrders.filter(o => o.status === 'queue')
    const preparingOnly = allOrders.filter(o => o.status === 'preparing')
    const readyOrders   = allOrders.filter(o => o.status === 'ready')
    return { queueOnly, preparingOnly, readyOrders }
  }, [allOrders])

  function handleQRScan(text) {
    try {
      const data = JSON.parse(text)
      const matched = readyOrders.find(o => o.id === data.id) ?? readyOrders[0] ?? null
      const itemsMatch = matched ? itemsAreEqual(data.items ?? [], matched.items) : null
      setScannedOrder({
        id: data.id,
        total: data.total,
        items: data.items ?? [],
        matched,
        itemsMatch,
      })
    } catch {
      setScannedOrder({ raw: text, matched: readyOrders[0] ?? null, itemsMatch: null })
    }
  }

  async function handleConfirmDelivery() {
    if (scannedOrder?.matched) {
      try {
        await deliverMutation.mutateAsync(scannedOrder.matched.id)
        setDelivered(prev => [scannedOrder.matched, ...prev])
      } catch { /* mutation error surfaces via ordersQuery on next refetch */ }
    }
    setScannedOrder(null)
    onScannerClose()
  }

  function handleCancelScan() {
    setScannedOrder(null)
    onScannerClose()
  }

  // ── Scanner phase ──────────────────────────────────────────
  if (scannerPhase) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, gap: 16, overflow: 'hidden' }}>

        {scannedOrder ? (
          <>
            {/* Match / mismatch indicator */}
            {scannedOrder.itemsMatch === true && (
              <div style={{
                background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>
                  Pedido verificado · Los productos coinciden
                </span>
              </div>
            )}

            {scannedOrder.itemsMatch === false && (
              <div style={{
                background: 'var(--warn-dim)', border: '1px solid var(--warn)',
                borderRadius: 'var(--radius-sm)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <span style={{ fontSize: 13, color: 'var(--warn)', fontWeight: 700 }}>Los productos no coinciden</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginBottom: 6, fontWeight: 600 }}>QR escaneado</div>
                    {(scannedOrder.items ?? []).map(resolveItem).map((item, i) => (
                      <div key={i} style={{ fontSize: 12, marginBottom: 3 }}>
                        {item.emoji} {item.name} ×{item.qty}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginBottom: 6, fontWeight: 600 }}>Pedido registrado</div>
                    {(scannedOrder.matched?.items ?? []).map(resolveItem).map((item, i) => (
                      <div key={i} style={{ fontSize: 12, marginBottom: 3 }}>
                        {item.emoji} {item.name} ×{item.qty}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {scannedOrder.itemsMatch === null && (
              <div style={{
                background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>QR leído correctamente</span>
              </div>
            )}

            {/* Decoded order card */}
            <div style={{
              background: 'var(--surface2)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)', overflow: 'hidden', flex: 1, overflowY: 'auto',
            }}>
              <div style={{
                padding: '12px 14px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  Pedido #{scannedOrder.id ?? scannedOrder.matched?.id ?? '—'}
                </span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  {scannedOrder.total != null ? fmt(scannedOrder.total) : ''}
                </span>
              </div>
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(scannedOrder.items?.length
                  ? scannedOrder.items.map(resolveItem)
                  : (scannedOrder.matched?.items ?? []).map(resolveItem)
                ).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{item.emoji}</span>
                    <span style={{ flex: 1, fontSize: 14 }}>{item.name}</span>
                    <span style={{
                      background: 'var(--surface3)', borderRadius: 99,
                      padding: '2px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)',
                    }}>×{item.qty}</span>
                  </div>
                ))}
                {scannedOrder.raw && (
                  <p style={{ fontSize: 12, color: 'var(--text-mute)', wordBreak: 'break-all' }}>
                    {scannedOrder.raw}
                  </p>
                )}
              </div>
            </div>

            <button className="btn-primary" onClick={handleConfirmDelivery}>
              Confirmar entrega ✓
            </button>
            <button className="btn-secondary" onClick={handleCancelScan}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Escanear QR del cliente</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
                Apuntá la cámara al código QR
              </div>
            </div>

            <QRCameraScanner onScan={handleQRScan} />

            <button
              className="btn-primary"
              onClick={() => {
                const order = readyOrders[0]
                if (order) {
                  const simulatedQR = JSON.stringify({ id: order.id, total: order.total, items: order.items })
                  handleQRScan(simulatedQR)
                }
              }}
            >
              Simular escaneo exitoso ✓
            </button>
            <button className="btn-secondary" onClick={handleCancelScan}>
              Cancelar
            </button>
          </>
        )}
      </div>
    )
  }

  // ── Order list ─────────────────────────────────────────────
  if (ordersQuery.isError) {
    return (
      <ErrorPanel
        title="Sin conexión al servidor"
        message="No se pudo conectar con el servidor. Verificá que el backend esté corriendo."
        onRetry={ordersQuery.refetch}
      />
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'queue',     label: 'En cola',    count: queueOnly.length + preparingOnly.length },
          { id: 'ready',     label: 'Listos',      count: readyOrders.length },
          { id: 'delivered', label: 'Entregados',  count: delivered.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '12px 8px',
              fontSize: 13, fontWeight: 600,
              color: tab === t.id ? 'var(--accent)' : 'var(--text-mute)',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'color 0.15s',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: tab === t.id ? 'var(--accent)' : 'var(--surface3)',
                color: tab === t.id ? 'var(--accent-on)' : 'var(--text-dim)',
                borderRadius: 99, padding: '1px 6px', fontSize: 11, fontWeight: 700,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="screen-body">
        {tab === 'queue' && (
          (queueOnly.length + preparingOnly.length) === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">☕</div>
              <h3>Sin pedidos</h3>
              <p>La cola está vacía. Esperando nuevos pedidos.</p>
            </div>
          ) : (
            <>
              <SubHeader label="En cola" count={queueOnly.length} hint="Tocá para comenzar a prepararlos" />
              {queueOnly.map(order => (
                <BartenderCard
                  key={order.id}
                  order={order}
                  onAction={() => advanceMutation.mutate(order.id)}
                  actionLabel="Comenzar a preparar"
                  actionColor="var(--accent)"
                />
              ))}

              <SubHeader label="Preparando" count={preparingOnly.length} hint="Marcalos como listos cuando termines" />
              {preparingOnly.map(order => (
                <BartenderCard
                  key={order.id}
                  order={order}
                  onAction={() => advanceMutation.mutate(order.id)}
                  actionLabel="Marcar listo"
                  actionColor="var(--warn)"
                />
              ))}
            </>
          )
        )}

        {tab === 'ready' && (
          readyOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👋</div>
              <h3>Sin listos</h3>
              <p>Los pedidos listos aparecen acá.</p>
            </div>
          ) : (
            readyOrders.map(order => (
              <BartenderCard key={order.id} order={order} onAction={onScannerOpen} actionLabel="Escanear QR 📷" actionColor="var(--mp)" />
            ))
          )
        )}

        {tab === 'delivered' && (
          delivered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>Sin entregados</h3>
              <p>Los pedidos entregados aparecen acá.</p>
            </div>
          ) : (
            delivered.map(order => (
              <BartenderCard key={order.id} order={order} disabled />
            ))
          )
        )}
      </div>
    </div>
  )
}

function SubHeader({ label, count, hint }) {
  return (
    <div style={{
      padding: '12px 16px 4px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <span style={{
          background: 'var(--surface3)', color: 'var(--text-dim)',
          borderRadius: 99, padding: '1px 6px', fontSize: 11, fontWeight: 700,
        }}>{count}</span>
      </div>
      {count > 0 && hint && (
        <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{hint}</div>
      )}
    </div>
  )
}

function BartenderCard({ order, onAction, actionLabel, actionColor, disabled }) {
  const productMap = useProductMap()
  const displayItems = order.items.map(makeResolver(productMap))
  return (
    <div style={{
      margin: '12px 16px',
      background: 'var(--surface)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Pedido #{order.id}</span>
          <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-mute)' }}>⏱ {order.time}</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt(order.total)}</span>
      </div>

      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {displayItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{item.emoji}</span>
            <span style={{ fontSize: 14, flex: 1 }}>{item.name}</span>
            <span style={{
              background: 'var(--surface3)', color: 'var(--text-dim)',
              borderRadius: 99, padding: '2px 8px', fontSize: 12, fontWeight: 700,
            }}>×{item.qty}</span>
          </div>
        ))}
      </div>

      {!disabled && onAction && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onAction}
            style={{
              width: '100%', padding: '10px',
              background: actionColor || 'var(--accent)',
              color: actionColor === 'var(--mp)' ? '#fff' : 'var(--accent-on)',
              borderRadius: 'var(--radius-xs)', fontSize: 13, fontWeight: 700,
              transition: 'opacity 0.15s',
            }}
          >
            {actionLabel}
          </button>
        </div>
      )}

      {disabled && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>✓ Entregado</span>
        </div>
      )}
    </div>
  )
}
