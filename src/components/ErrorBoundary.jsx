import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[FastBuy] Render error:', error, info)
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px', gap: 16, textAlign: 'center',
        }}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--danger)' }}>
              Algo salió mal
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              {import.meta.env.DEV
                ? (this.state.error?.message ?? 'Error inesperado.')
                : 'Ocurrió un error inesperado. Tocá Reintentar para continuar.'}
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%', maxWidth: 280 }}
            onClick={this.reset}
          >
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
