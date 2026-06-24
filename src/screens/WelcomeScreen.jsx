import { useEvents, classifyEvent } from '../hooks/useEvents.js'
import { Loading, ErrorPanel } from '../components/QueryStates.jsx'
import { formatEventDate } from '../lib/format.js'

export default function WelcomeScreen({ onLogin, onBack }) {
  const { data: events, isLoading, isError, refetch } = useEvents()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            position: 'absolute', top: 14, left: 14, zIndex: 20,
            fontSize: 12, fontWeight: 600, color: 'var(--text-mute)',
            padding: '6px 10px', borderRadius: 99,
            border: '1px solid var(--border)', background: 'var(--surface2)',
          }}
        >
          ‹ Salir
        </button>
      )}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '32px 28px 28px', gap: 20,
        overflowY: 'auto',
      }}>
        <Brand />
        <EventsList
          events={events}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onSelect={onLogin}
        />
        <div style={{ fontSize: 12, color: 'var(--text-mute)', textAlign: 'center', lineHeight: 1.5 }}>
          Tocá un evento en vivo para entrar.
        </div>
      </div>
    </div>
  )
}

function Brand() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="brand-mark">FastBuy</div>
      <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 6 }}>Pedí desde tu lugar</div>
    </div>
  )
}

function EventsList({ events, isLoading, isError, onRetry, onSelect }) {
  if (isLoading) {
    return (
      <div style={{ width: '100%', padding: '24px 0' }}>
        <Loading label="Buscando eventos…" />
      </div>
    )
  }
  if (isError) {
    return (
      <div style={{ width: '100%' }}>
        <ErrorPanel
          title="No se pudieron cargar los eventos"
          message="Verificá tu conexión y volvé a intentar."
          onRetry={onRetry}
        />
      </div>
    )
  }
  if (!events || events.length === 0) {
    return (
      <div style={{
        width: '100%', padding: '20px 16px', textAlign: 'center',
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>No hay eventos disponibles</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Volvé más tarde.</div>
        <button className="btn-secondary" style={{ fontSize: 13 }} onClick={onRetry}>Reintentar</button>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Eventos
      </div>
      {events.map(event => (
        <EventCard key={event.id} event={event} onSelect={onSelect} />
      ))}
    </div>
  )
}

function EventCard({ event, onSelect }) {
  const status = classifyEvent(event)
  const isLive = status === 'live'

  const badge = isLive
    ? { label: 'En vivo',       color: 'var(--accent)',    bg: 'var(--accent-dim)' }
    : status === 'upcoming'
      ? { label: 'Próximamente', color: 'var(--text-dim)',  bg: 'var(--surface3)' }
      : { label: 'Finalizado',   color: 'var(--text-mute)', bg: 'var(--surface3)' }

  return (
    <button
      type="button"
      onClick={isLive ? () => onSelect(event) : undefined}
      disabled={!isLive}
      style={{
        textAlign: 'left', width: '100%',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 16px',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        cursor: isLive ? 'pointer' : 'default',
        opacity: isLive ? 1 : 0.55,
        transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
      }}
      onMouseEnter={isLive ? e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)' } : undefined}
      onMouseLeave={isLive ? e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' } : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{event.name}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 99, flexShrink: 0,
          background: badge.bg, color: badge.color,
        }}>{badge.label}</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{event.venue}</div>
      <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 2 }}>
        {formatEventDate(event.startsAt)} · {event.hours}
      </div>
    </button>
  )
}
