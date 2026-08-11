import { useState, useEffect } from 'react'
import api from '../../api/axios'
import './TasaCambio.css'

function TasaCambio() {
  const [tasaActual, setTasaActual] = useState(null)
  const [nuevaTasa, setNuevaTasa] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [tasaReferencia, setTasaReferencia] = useState(null)
  const [cargandoReferencia, setCargandoReferencia] = useState(false)
  const [errorReferencia, setErrorReferencia] = useState('')

  useEffect(() => {
    cargarTasa()
    obtenerTasaReferencia()
  }, [])

  async function cargarTasa() {
    try {
      const { data } = await api.get('/prices')
      setTasaActual(data)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'No se pudo cargar la tasa actual' })
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function obtenerTasaReferencia() {
    setCargandoReferencia(true)
    setErrorReferencia('')
    
    // Intentar múltiples fuentes en orden
    const fuentes = [
      {
        nombre: 'ExchangeRate-API',
        url: 'https://open.er-api.com/v6/latest/USD',
        extraer: (data) => data?.rates?.VES
      },
      {
        nombre: 'DolarToday',
        url: 'https://s3.amazonaws.com/dolartoday/data.json',
        extraer: (data) => data?.USD?.promedio
      },
      {
        nombre: 'BCV (no oficial)',
        url: 'https://ve.dolar-api.com/api/rate/usd/ves',
        extraer: (data) => data?.price
      }
    ]

    for (const fuente of fuentes) {
      try {
        const response = await fetch(fuente.url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        const valor = fuente.extraer(data)
        
        if (valor && !isNaN(valor) && valor > 0) {
          setTasaReferencia({
            valor: Number(valor),
            fuente: fuente.nombre,
            fecha: new Date().toISOString()
          })
          setCargandoReferencia(false)
          return // Éxito, salir
        }
      } catch (error) {
        console.log(`Fuente ${fuente.nombre} falló:`, error.message)
        continue // Intentar siguiente fuente
      }
    }

    // Si todas fallaron
    setErrorReferencia('No se pudo obtener tasa de referencia de ninguna fuente')
    setTasaReferencia(null)
    setCargandoReferencia(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMensaje({ tipo: '', texto: '' })
    
    if (!nuevaTasa || Number(nuevaTasa) <= 0) {
      setMensaje({ tipo: 'error', texto: 'Por favor ingresa una tasa válida' })
      return
    }

    setGuardando(true)

    try {
      await api.patch('/prices/tasa-cambio', { usd_a_ves: Number(nuevaTasa) })
      setMensaje({ 
        tipo: 'exito', 
        texto: '✅ Tasa actualizada correctamente' 
      })
      setNuevaTasa('')
      await cargarTasa()
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000)
    } catch (err) {
      setMensaje({ 
        tipo: 'error', 
        texto: err.response?.data?.message || 'Error al actualizar la tasa' 
      })
    } finally {
      setGuardando(false)
    }
  }

  function usarTasaReferencia() {
    if (tasaReferencia?.valor) {
      setNuevaTasa(tasaReferencia.valor.toString())
    }
  }

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando información de tasa...</p>
      </div>
    )
  }

  return (
    <div className="tasa-cambio-container">
      <div className="section-header">
        <h2>💱 Tasa de Cambio</h2>
        <p className="section-description">
          Administra la tasa de cambio para conversiones de moneda
        </p>
      </div>

      {/* Tarjeta de tasa actual */}
      <div className="tasa-actual-card">
        <div className="tasa-info">
          <div className="tasa-valor">
            <span className="label">Tasa Actual</span>
            <span className="valor">
              {tasaActual 
                ? `${Number(tasaActual.usd_a_ves).toFixed(2)} Bs/USD` 
                : 'No disponible'}
            </span>
          </div>
          {tasaActual?.updated_at && (
            <div className="tasa-meta">
              <span className="fecha-actualizacion">
                📅 Actualizada: {new Date(tasaActual.updated_at).toLocaleString('es-VE', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>
          )}
        </div>
        
        {/* Tasa de referencia automática */}
        <div className="tasa-referencia">
          <h4>📊 Tasa de Referencia del Mercado</h4>
          
          {cargandoReferencia ? (
            <div className="loading-small">
              <div className="spinner-small"></div>
              Consultando tasas del mercado...
            </div>
          ) : errorReferencia ? (
            <div className="referencia-error">
              <p className="no-disponible">{errorReferencia}</p>
              <button 
                className="btn-refrescar"
                onClick={obtenerTasaReferencia}
              >
                🔄 Reintentar
              </button>
            </div>
          ) : tasaReferencia ? (
            <div className="referencia-info">
              <div className="referencia-valor">
                {tasaReferencia.valor.toFixed(2)} Bs/USD
              </div>
              <div className="referencia-fuente">
                Fuente: {tasaReferencia.fuente}
              </div>
              <div className="referencia-acciones">
                <button 
                  className="btn-usar-tasa"
                  onClick={usarTasaReferencia}
                >
                  Usar esta tasa
                </button>
              </div>
            </div>
          ) : (
            <p className="no-disponible">Tasa de referencia no disponible</p>
          )}
          
          <button 
            className="btn-refrescar"
            onClick={obtenerTasaReferencia}
            disabled={cargandoReferencia}
          >
            {cargandoReferencia ? 'Consultando...' : '🔄 Actualizar tasa de referencia'}
          </button>
        </div>
      </div>

      {/* Mensajes de feedback */}
      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario de actualización */}
      <div className="form-container">
        <h3>Actualizar Tasa Manualmente</h3>
        <form onSubmit={handleSubmit} className="tasa-form">
          <div className="input-group">
            <label htmlFor="nuevaTasa">Nueva tasa (Bs. por USD)</label>
            <div className="input-wrapper">
              <span className="input-prefix">Bs.</span>
              <input
                id="nuevaTasa"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={nuevaTasa}
                onChange={(e) => setNuevaTasa(e.target.value)}
                required
              />
              <span className="input-suffix">/ USD</span>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <span className="spinner-small"></span>
                  Guardando...
                </>
              ) : (
                '💾 Actualizar Tasa'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TasaCambio