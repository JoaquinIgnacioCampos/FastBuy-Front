import { useState } from 'react'
import PaymentSetupScreen from './PaymentSetupScreen'

const TABS = [
  { id: 'payments', label: '💳 Pagos' },
  { id: 'qr',       label: '📲 QR del evento' },
  { id: 'metrics',  label: '📊 Métricas',  soon: true },
]

export default function AdminScreen({ eventId, eventName }) {
  const [tab, setTab] = useState('payments')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="pill-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`pill-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            style={t.soon && tab !== t.id ? { opacity: 0.6 } : undefined}
          >
            {t.label}
            {t.soon && (
              <span style={{
                marginLeft: 5, fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                background: 'var(--warn-dim)', color: 'var(--warn)',
                borderRadius: 99, padding: '1px 5px', verticalAlign: 'middle',
              }}>
                PRONTO
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'payments' && (
        <PaymentSetupScreen
          eventId={eventId}
          eventName={eventName}
          hideFooter
        />
      )}

      {tab === 'qr' && <QRTab eventId={eventId} eventName={eventName} />}

      {tab === 'metrics' && <MetricsTab />}
    </div>
  )
}

function QRTab({ eventName }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '24px 24px', gap: 20, overflowY: 'auto',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          QR del evento
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>Código de acceso</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>{eventName}</div>
      </div>

      {/* QR placeholder */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        padding: '32px 24px',
        background: 'var(--surface2)', border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius)',
      }}>
        <div style={{
          width: 140, height: 140,
          background: 'var(--surface3)', borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, border: '1px solid var(--border-strong)',
        }}>
          📲
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>QR pendiente de configuración</div>
          <div style={{ fontSize: 12, color: 'var(--text-mute)', lineHeight: 1.5 }}>
            Desde acá podrás generar el código QR que los asistentes escanean para entrar al evento.
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-mute)', lineHeight: 1.6 }}>
        El QR lleva a los asistentes directamente a la pantalla del evento en FastBuy, sin necesidad de buscar el evento manualmente.
      </div>
    </div>
  )
}

function MetricsTab() {
  const placeholders = [
    { icon: '💰', label: 'Recaudación total',    value: '—' },
    { icon: '📦', label: 'Pedidos completados',  value: '—' },
    { icon: '⏱',  label: 'Tiempo promedio',      value: '—' },
    { icon: '🍺', label: 'Producto más pedido',  value: '—' },
  ]

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '24px 24px', gap: 20, overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Análisis
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>Métricas del evento</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
          background: 'var(--warn-dim)', color: 'var(--warn)',
          borderRadius: 99, padding: '4px 10px', flexShrink: 0, marginTop: 2,
        }}>
          PRÓXIMA VERSIÓN
        </span>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {placeholders.map(m => (
          <div key={m.label} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '14px 16px',
            opacity: 0.55,
          }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-mute)' }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 3, lineHeight: 1.3 }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '14px 16px',
        fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.6, opacity: 0.7,
      }}>
        Las métricas en tiempo real — ventas por barra, tiempos de preparación y más — estarán disponibles en la próxima versión de FastBuy.
      </div>
    </div>
  )
}
