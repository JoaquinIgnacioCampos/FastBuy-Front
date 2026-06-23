import { useState } from 'react'
import { usePaymentAccount, useLinkPaymentAccount, useUnlinkPaymentAccount } from '../hooks/usePaymentAccount.js'
import { Loading, ErrorPanel } from '../components/QueryStates.jsx'

export default function PaymentSetupScreen({ eventId, eventName, onBack, backLabel = '← Volver al panel' }) {
  const [token, setToken] = useState('')
  const { data: account, isLoading, isError, refetch } = usePaymentAccount(eventId)
  const linkMutation   = useLinkPaymentAccount(eventId)
  const unlinkMutation = useUnlinkPaymentAccount(eventId)

  if (isLoading) return <Loading label="Cargando configuración…" />
  if (isError)   return <ErrorPanel title="No se pudo cargar" onRetry={refetch} />

  const linked = account?.linked

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '20px 24px', gap: 20, overflowY: 'auto',
      }}>
        {/* Header */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Mercado Pago
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>Configurar pagos</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>{eventName}</div>
        </div>

        {linked ? (
          <LinkedCard
            account={account}
            onUnlink={() => unlinkMutation.mutate()}
            loading={unlinkMutation.isPending}
          />
        ) : (
          <LinkForm
            token={token}
            onTokenChange={setToken}
            onLink={() => linkMutation.mutate(token)}
            loading={linkMutation.isPending}
            error={linkMutation.isError ? 'Token inválido o sin acceso a Mercado Pago.' : null}
          />
        )}
      </div>

      <div style={{ padding: '12px 24px 28px', borderTop: '1px solid var(--border)' }}>
        <button className="btn-secondary" onClick={onBack}>
          {backLabel}
        </button>
      </div>
    </div>
  )
}

function LinkedCard({ account, onUnlink, loading }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: 'var(--accent-dim)', border: '1px solid var(--accent)',
        borderRadius: 'var(--radius-sm)', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>Cuenta conectada</span>
        </div>
        {account.mpEmail && (
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{account.mpEmail}</div>
        )}
        {account.linkedAt && (
          <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>
            Conectado el {new Date(account.linkedAt).toLocaleDateString('es-AR')}
          </div>
        )}
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
        Los pagos del evento se acreditarán en esta cuenta de Mercado Pago.
      </div>

      <button
        className="btn-secondary"
        onClick={onUnlink}
        disabled={loading}
        style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
      >
        {loading ? 'Desconectando…' : 'Desconectar cuenta'}
      </button>
    </div>
  )
}

function LinkForm({ token, onTokenChange, onLink, loading, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
        Conectá una cuenta de Mercado Pago para que los pagos del evento se acrediten directamente ahí.
      </div>

      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '14px 16px',
        fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Cómo obtener el token:</div>
        <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li>Entrá a <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>mercadopago.com.ar/developers</span></li>
          <li>Creá una aplicación → Checkout Pro</li>
          <li>Copiá el <strong>Production access token</strong></li>
          <li>Pegalo acá abajo</li>
        </ol>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', marginBottom: 6, display: 'block' }}>
          Access token
        </label>
        <input
          type="password"
          placeholder="APP_USR-…"
          value={token}
          onChange={e => onTokenChange(e.target.value)}
          style={{
            width: '100%', padding: '13px 14px',
            background: 'var(--surface2)', border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text)',
            fontSize: 14, fontFamily: 'monospace', outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
        />
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-dim)', border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px',
          fontSize: 13, color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={onLink}
        disabled={loading || !token.trim()}
      >
        {loading ? 'Conectando…' : 'Conectar cuenta'}
      </button>
    </div>
  )
}
