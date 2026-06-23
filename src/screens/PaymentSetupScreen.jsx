import { useEffect } from 'react'
import { usePaymentAccount, useUnlinkPaymentAccount } from '../hooks/usePaymentAccount.js'
import { Loading, ErrorPanel } from '../components/QueryStates.jsx'

export default function PaymentSetupScreen({
  eventId, eventName, adminToken,
  onBack, backLabel = '← Volver al panel',
  hideFooter = false,
}) {
  const { data: account, isLoading, isError, refetch } = usePaymentAccount(eventId)
  const unlinkMutation = useUnlinkPaymentAccount(eventId)

  // After the MP OAuth callback the backend redirects to /admin?mp_linked=true.
  // Detect it, strip the param, and refetch so the LinkedCard appears immediately.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mp_linked') === 'true') {
      window.history.replaceState({}, '', window.location.pathname)
      refetch()
    }
    if (params.get('mp_error')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          <OAuthLinkForm eventId={eventId} adminToken={adminToken} />
        )}
      </div>

      {!hideFooter && (
        <div style={{ padding: '12px 24px 28px', borderTop: '1px solid var(--border)' }}>
          <button className="btn-secondary" onClick={onBack}>
            {backLabel}
          </button>
        </div>
      )}
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

function OAuthLinkForm({ eventId, adminToken }) {
  function handleConnect() {
    const params = new URLSearchParams({
      eventId,
      token: adminToken ?? '',
    })
    window.location.href = `/api/auth/mp/connect?${params}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
        Conectá una cuenta de Mercado Pago para que los pagos del evento se acrediten directamente ahí.
      </div>

      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
        fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6,
      }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Cómo funciona:</div>
          <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <li>Hacé clic en <strong>Conectar con Mercado Pago</strong></li>
            <li>Iniciá sesión con tu cuenta de Mercado Pago</li>
            <li>Aprobá el acceso a FastBuy</li>
            <li>Listo — los pagos del evento se acreditan en tu cuenta</li>
          </ol>
        </div>
        <div style={{
          borderTop: '1px solid var(--border)', paddingTop: 10,
          fontSize: 12, color: 'var(--text-mute)',
        }}>
          ⚠️ Necesitás una <strong>cuenta vendedor</strong> de Mercado Pago (no alcanza con una cuenta personal). Si aún no la tenés, creála en mercadopago.com.ar antes de continuar.
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={handleConnect}
        style={{ background: 'var(--mp)', color: '#fff' }}
      >
        Conectar con Mercado Pago
      </button>
    </div>
  )
}
