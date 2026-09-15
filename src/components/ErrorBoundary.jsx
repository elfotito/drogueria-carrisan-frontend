import { Component } from 'react'

const CRASH_LOG_KEY = 'app_crash_log'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    const entry = {
      timestamp: new Date().toISOString(),
      message: error?.message || String(error),
      stack: error?.stack || '',
      componentStack: errorInfo?.componentStack || '',
      url: window.location.href,
    }
    try {
      const prev = JSON.parse(localStorage.getItem(CRASH_LOG_KEY) || '[]')
      prev.push(entry)
      if (prev.length > 10) prev.shift()
      localStorage.setItem(CRASH_LOG_KEY, JSON.stringify(prev))
    } catch { /* quota exceeded or private mode — ignore */ }
    console.error('[ErrorBoundary]', entry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          background: '#f7f8fa',
          color: '#1a1a1a',
          textAlign: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 16px rgba(0,0,0,.08)',
            padding: '2rem',
            maxWidth: 420,
            width: '100%',
          }}>
            <h1 style={{ fontSize: '1.3rem', margin: '0 0 .75rem' }}>
              Algo salió mal
            </h1>
            <p style={{ fontSize: '.95rem', color: '#555', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              La app se cerró inesperadamente. Intenta recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#1975d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '.7rem 1.8rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Recargar
            </button>
            {this.state.error?.message && (
              <details style={{ marginTop: '1.25rem', textAlign: 'left' }}>
                <summary style={{ fontSize: '.85rem', color: '#888', cursor: 'pointer' }}>
                  Detalles técnicos
                </summary>
                <p style={{
                  fontSize: '.8rem',
                  color: '#666',
                  fontFamily: 'monospace',
                  margin: '.5rem 0 0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {this.state.error.message}
                </p>
              </details>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
