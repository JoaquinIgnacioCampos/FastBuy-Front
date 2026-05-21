import { BARS } from '../data'

export default function BarSelectScreen({ onSelect }) {
  return (
    <div className="screen-body">
      <div className="section-title">¿En qué barra trabajás hoy?</div>
      {BARS.map(bar => (
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
