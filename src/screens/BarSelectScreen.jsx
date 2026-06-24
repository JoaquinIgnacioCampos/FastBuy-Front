import { useBars } from '../hooks/useBars.js'
import { Loading, ErrorPanel } from '../components/QueryStates.jsx'

export default function BarSelectScreen({ onSelect }) {
  const { data: bars, isLoading, isError, refetch } = useBars()

  if (isLoading) return <Loading label="Cargando barras…" />
  if (isError)   return <ErrorPanel title="No se pudieron cargar las barras" message="Verificá tu conexión e intentá de nuevo." onRetry={refetch} />

  return (
    <div className="screen-body">
      <div className="section-title">¿En qué barra trabajás hoy?</div>
      {(bars ?? []).map(bar => (
        <div
          key={bar.id}
          className="info-card"
          role="button"
          tabIndex={0}
          onClick={() => onSelect(bar)}
          onKeyDown={e => e.key === 'Enter' && onSelect(bar)}
          style={{ margin: '0 16px 10px', cursor: 'pointer' }}
        >
          <div style={{ fontWeight: 700, fontSize: 15 }}>{bar.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{bar.location}</div>
        </div>
      ))}
    </div>
  )
}
