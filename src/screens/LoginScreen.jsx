import { useState } from 'react'
import { useLoginBartender } from '../hooks/useLoginBartender.js'
import { useLoginAdmin }     from '../hooks/useLoginAdmin.js'

const ROLE_LABELS = {
  bartender: { title: 'Bartender', submit: 'Entrar como bartender', role: 'bartender' },
  admin:     { title: 'Organizador',  submit: 'Entrar como organizador', role: 'admin'     },
}

export default function LoginScreen({
  role = 'bartender',
  onLogin,
  onChangeRole,
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)

  const bartenderMutation = useLoginBartender()
  const adminMutation     = useLoginAdmin()
  const mutation          = role === 'admin' ? adminMutation : bartenderMutation

  const config  = ROLE_LABELS[role] ?? ROLE_LABELS.bartender
  const loading = mutation.isPending
  const canSubmit = username.trim().length > 0 && password.length > 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    try {
      const session = await mutation.mutateAsync({ username: username.trim(), password })
      onLogin(session)
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Sin conexión al servidor. Verificá tu internet e intentá de nuevo.')
      } else {
        setError('Usuario o contraseña incorrectos.')
      }
    }
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 28px 28px', gap: 28, overflowY: 'auto',
    }}>
      {/* Brand + role context */}
      <div style={{ textAlign: 'center' }}>
        <div className="brand-mark">FastBuy</div>
        <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 6 }}>
          Acceso — {config.title}
        </div>
      </div>

      {/* Credential form */}
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', marginBottom: 6, display: 'block' }}>
            Usuario
          </label>
          <input
            type="text"
            autoComplete="username"
            placeholder="Nombre de usuario"
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
            placeholder="Contraseña"
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
          disabled={loading || !canSubmit}
          style={{ marginTop: 4 }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--accent-on)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'fb-spin 0.7s linear infinite' }} />
              Entrando…
            </span>
          ) : config.submit}
        </button>

        {onChangeRole && (
          <button
            type="button"
            onClick={onChangeRole}
            style={{
              fontSize: 13, color: 'var(--text-dim)', background: 'none',
              border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'center',
            }}
          >
            ‹ Cambiar rol
          </button>
        )}
      </form>

    </div>
  )
}
