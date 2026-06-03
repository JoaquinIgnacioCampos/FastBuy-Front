export function Loading({ label = 'Cargando…' }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', gap: 16,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--accent)', borderTopColor: 'transparent',
        animation: 'fb-spin 0.8s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{label}</div>
    </div>
  )
}

export function ErrorPanel({
  title = 'Sin conexión al servidor',
  message = 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.',
  onRetry,
}) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', gap: 16, textAlign: 'center',
    }}>
      <span style={{ fontSize: 40 }}>⚠️</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--danger)' }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          {message}
        </div>
      </div>
      {onRetry && (
        <button
          className="btn-secondary"
          style={{ width: '100%', maxWidth: 280 }}
          onClick={onRetry}
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
