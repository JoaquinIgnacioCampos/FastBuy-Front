import { useMemo, useState } from 'react'
import { useEvents, classifyEvent } from '../hooks/useEvents.js'
import { Loading, ErrorPanel } from '../components/QueryStates.jsx'

export default function WelcomeScreen({ onLogin, onBartender }) {
  const [step, setStep] = useState('pick-event')
  const [phone, setPhone] = useState('')
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [loading, setLoading] = useState(false)
  const { data: events, isLoading, isError, refetch } = useEvents()

  const selectedEvent = useMemo(
    () => (events ?? []).find(e => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  )
  const selectedEventIsLive =
    !!selectedEvent && classifyEvent(selectedEvent) === 'live'

  function goToPhoneStep() {
    if (!selectedEventIsLive) return
    setStep('enter-phone')
  }

  function backToPicker() {
    setStep('pick-event')
    setPhone('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 8) return
    if (!selectedEventIsLive) return
    setLoading(true)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setTimeout(() => onLogin(selectedEvent), 1000)
  }

  if (step === 'enter-phone' && selectedEventIsLive) {
    return (
      <PhoneStep
        event={selectedEvent}
        phone={phone}
        onPhoneChange={setPhone}
        loading={loading}
        onBack={backToPicker}
        onSubmit={handleSubmit}
        onBartender={onBartender}
      />
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '32px 28px 16px', gap: 20,
        overflowY: 'auto',
      }}>
        <Brand />
        <EventsList
          events={events}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          selectedId={selectedEventId}
          onSelect={setSelectedEventId}
        />
        <div style={{ fontSize: 12, color: 'var(--text-mute)', textAlign: 'center', lineHeight: 1.5 }}>
          Tocá un evento en vivo para continuar.
        </div>
      </div>

      <div style={{
        padding: '12px 28px 28px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <button
          type="button"
          className="btn-primary"
          disabled={!selectedEventIsLive}
          onClick={goToPhoneStep}
        >
          {selectedEventIsLive ? `Continuar a ${selectedEvent.name} →` : 'Elegí un evento en vivo'}
        </button>
      </div>
    </div>
  )
}

function Brand() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 22,
        background: 'var(--accent)', color: 'var(--accent-on)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38, fontWeight: 900, margin: '0 auto 16px',
        boxShadow: '0 0 40px var(--accent-glow)',
      }}>F</div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>FastBuy</div>
      <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 4 }}>Pedí desde tu lugar</div>
    </div>
  )
}

function PhoneStep({ event, phone, onPhoneChange, loading, onBack, onSubmit, onBartender }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'stretch', padding: '20px 28px 16px', gap: 20,
        overflowY: 'auto',
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'var(--text-dim)', padding: '6px 10px',
            borderRadius: 99, border: '1px solid var(--border)', background: 'var(--surface2)',
          }}
        >
          ‹ Cambiar evento
        </button>

        <Brand />

        <div style={{
          background: 'var(--accent)', color: 'var(--accent-on)',
          borderRadius: 'var(--radius-sm)', padding: '12px 14px',
          boxShadow: '0 0 0 3px var(--accent-glow), 0 6px 24px -8px var(--accent-glow)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.78 }}>
            Evento elegido
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{event.name}</div>
          <div style={{ fontSize: 13, marginTop: 2, opacity: 0.82 }}>{event.venue}</div>
          <div style={{ fontSize: 12, marginTop: 1, opacity: 0.7 }}>{event.hours}</div>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', marginBottom: 6, display: 'block' }}>
              Tu número de celular
            </label>
            <input
              type="tel"
              autoFocus
              placeholder="+54 9 11 ···· ····"
              value={phone}
              onChange={e => onPhoneChange(e.target.value)}
              style={{
                width: '100%', padding: '13px 14px',
                background: 'var(--surface2)', border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                fontSize: 16, outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || phone.replace(/\D/g, '').length < 8}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--accent-on)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                Ingresando…
              </span>
            ) : 'Entrar al evento →'}
          </button>
        </form>

        <div style={{ fontSize: 12, color: 'var(--text-mute)', textAlign: 'center', lineHeight: 1.5 }}>
          Al continuar aceptás los términos del evento.
        </div>

        {/* Bartender entry point — scoped to the selected event. */}
        <div style={{
          marginTop: 8, paddingTop: 16,
          borderTop: '1px dashed var(--border)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ¿Sos del staff?
          </div>
          <button
            type="button"
            onClick={onBartender}
            className="tap-press"
            style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text)',
              padding: '10px 18px', borderRadius: 99,
              border: '1px solid var(--border-strong)',
              background: 'var(--surface2)',
            }}
          >
            Entrar como Bartender 🍹
          </button>
        </div>
      </div>
    </div>
  )
}

function EventsList({ events, isLoading, isError, onRetry, selectedId, onSelect }) {
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
        borderRadius: 'var(--radius-sm)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>No hay eventos disponibles</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
          Volvé más tarde.
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Eventos
      </div>
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          selected={event.id === selectedId}
          onSelect={() => onSelect(event.id)}
        />
      ))}
    </div>
  )
}

function EventCard({ event, selected, onSelect }) {
  const status = classifyEvent(event)
  const isLive = status === 'live'
  const isSelected = selected && isLive

  const styles = isSelected
    ? {
        background: 'var(--accent)',
        border: '1px solid var(--accent)',
        boxShadow: '0 0 0 3px var(--accent-glow), 0 6px 24px -8px var(--accent-glow)',
        color: 'var(--accent-on)',
      }
    : {
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
      }

  const badge = isLive
    ? isSelected
      ? { label: 'Elegido', color: 'var(--accent-on)', bg: 'rgba(255,255,255,0.22)' }
      : { label: 'En vivo', color: 'var(--accent)',    bg: 'var(--accent-dim)' }
    : status === 'upcoming'
      ? { label: 'Próximamente', color: 'var(--text-dim)',  bg: 'var(--surface3)' }
      : { label: 'Finalizado',   color: 'var(--text-mute)', bg: 'var(--surface3)' }

  const subColor = isSelected ? 'rgba(10,20,7,0.78)' : 'var(--text-dim)'
  const subMuteColor = isSelected ? 'rgba(10,20,7,0.6)' : 'var(--text-mute)'

  return (
    <button
      type="button"
      onClick={isLive ? onSelect : undefined}
      disabled={!isLive}
      style={{
        textAlign: 'left', width: '100%',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 16px',
        cursor: isLive ? 'pointer' : 'default',
        opacity: isLive ? 1 : 0.55,
        transition: 'background 0.18s, box-shadow 0.18s, transform 0.12s',
        transform: isSelected ? 'translateY(-1px)' : 'none',
        ...styles,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'inherit' }}>{event.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 99,
            background: badge.bg, color: badge.color,
          }}>{badge.label}</span>
          {isSelected && (
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--accent-on)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800,
            }}>✓</span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 13, color: subColor }}>{event.venue}</div>
      <div style={{ fontSize: 12, color: subMuteColor, marginTop: 2 }}>{event.hours}</div>
    </button>
  )
}
