const roles = [
  {
    id:    'user',
    icon:  '🎟️',
    label: 'Entrar al evento',
    sub:   'Buscá tu evento y pedí desde tu lugar',
    color: 'var(--accent)',              // green
    dim:   'var(--accent-dim)',
  },
  {
    id:    'bartender',
    icon:  '🍹',
    label: 'Soy bartender',
    sub:   'Gestioná los pedidos de tu barra',
    color: 'var(--bartender-accent)',    // blue
    dim:   'var(--bartender-accent-dim)',
  },
  {
    id:    'admin',
    icon:  '🎪',
    label: 'Soy organizador',
    sub:   'Configurá pagos y métricas del evento',
    color: 'var(--admin-accent)',        // orange
    dim:   'var(--admin-accent-dim)',
  },
]

export default function RolePickerScreen({ onRole }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px 36px', gap: 32,
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center' }}>
        <div className="brand-mark">FastBuy</div>
        <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 6 }}>
          ¿Cómo querés ingresar?
        </div>
      </div>

      {/* Role cards */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {roles.map((r, i) => (
          <RoleCard key={r.id} role={r} primary={i === 0} onSelect={onRole} />
        ))}
      </div>
    </div>
  )
}

function RoleCard({ role: r, primary, onSelect }) {
  return (
    <button
      onClick={() => onSelect(r.id)}
      className="tap-press"
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 20px',
        background: primary ? r.dim : 'var(--surface2)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${r.color}`,
        borderRadius: 'var(--radius)',
        color: 'var(--text)',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        transition: 'background 0.14s, box-shadow 0.14s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = r.dim
        e.currentTarget.style.boxShadow = `0 0 0 1px ${r.color}40`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = primary ? r.dim : 'var(--surface2)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <span style={{
        fontSize: 26, lineHeight: 1, flexShrink: 0,
        width: 40, height: 40, borderRadius: 'var(--radius-sm)',
        background: r.dim,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {r.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{r.label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2, lineHeight: 1.4 }}>
          {r.sub}
        </div>
      </div>
      <span style={{ color: r.color, fontSize: 16, flexShrink: 0 }}>›</span>
    </button>
  )
}
