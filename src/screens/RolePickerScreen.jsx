export default function RolePickerScreen({ onRole }) {
  const roles = [
    {
      id: 'user',
      icon: '🎟️',
      label: 'Entrar al evento',
      sub: 'Buscá tu evento y pedí desde tu lugar',
      primary: true,
    },
    {
      id: 'bartender',
      icon: '🍹',
      label: 'Soy bartender',
      sub: 'Gestioná los pedidos de tu barra',
      primary: false,
    },
    {
      id: 'admin',
      icon: '🎪',
      label: 'Soy organizador',
      sub: 'Configurá pagos y métricas del evento',
      primary: false,
    },
  ]

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px 36px', gap: 32,
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center' }}>
        <div className="brand-mark">FastBuy</div>
        <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 6 }}>¿Cómo querés ingresar?</div>
      </div>

      {/* Role buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {roles.map(r => (
          <button
            key={r.id}
            onClick={() => onRole(r.id)}
            className="tap-press"
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 20px',
              background: r.primary ? 'var(--accent)' : 'var(--surface2)',
              border: r.primary ? 'none' : '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              color: r.primary ? 'var(--accent-on)' : 'var(--text)',
              textAlign: 'left', cursor: 'pointer',
              transition: 'opacity 0.12s, transform 0.1s',
            }}
          >
            <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{r.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{r.label}</div>
              <div style={{
                fontSize: 12, marginTop: 2,
                color: r.primary ? 'var(--accent-on)' : 'var(--text-dim)',
                opacity: r.primary ? 0.85 : 1,
              }}>
                {r.sub}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
