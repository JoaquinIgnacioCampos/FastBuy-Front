import { useState } from 'react'
import { useLoginBartender } from '../hooks/useLoginBartender.js'

export default function LoginScreen({ onCustomer, onBartenderLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const loginMutation = useLoginBartender()

  const isStaff = username.trim().length > 0 && password.length > 0

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!isStaff) {
      onCustomer()
      return
    }

    try {
      const session = await loginMutation.mutateAsync({ username: username.trim(), password })
      onBartenderLogin(session)
    } catch {
      setError('Credenciales inválidas')
    }
  }

  const loading = loginMutation.isPending

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 28px 28px', gap: 28, overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center' }}>
        <div className="brand-mark">FastBuy</div>
        <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 6 }}>Pedí desde tu lugar</div>
      </div>

      {/* Login form */}
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', marginBottom: 6, display: 'block' }}>
            Usuario
          </label>
          <input
            type="text"
            autoComplete="username"
            placeholder="Usuario de bartender (opcional)"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(null) }}
            style={{
              width: '100%', padding: '13px 14px',
              background: 'var(--surface2)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text)',
              fontSize: 16, outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', marginBottom: 6, display: 'block' }}>
            Contraseña
          </label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña (opcional)"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(null) }}
            style={{
              width: '100%', padding: '13px 14px',
              background: 'var(--surface2)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text)',
              fontSize: 16, outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
          />
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-dim)', border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            fontSize: 13, color: 'var(--danger)', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--accent-on)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'fb-spin 0.7s linear infinite' }} />
              Entrando…
            </span>
          ) : isStaff ? 'Entrar como bartender' : 'Entrar al evento →'}
        </button>

        <div style={{ fontSize: 12, color: 'var(--text-mute)', textAlign: 'center', lineHeight: 1.5 }}>
          {isStaff
            ? 'Se verificará con el servidor.'
            : 'Dejá los campos vacíos para entrar como cliente.'}
        </div>
      </form>
    </div>
  )
}
