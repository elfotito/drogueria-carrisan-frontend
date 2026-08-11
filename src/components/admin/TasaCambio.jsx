import { useState, useEffect } from 'react'
import api from '../../api/axios'
import './TasaCambio.css' 

function TasaCambio() {
  const [tasaActual, setTasaActual] = useState(null)
  const [nuevaTasa, setNuevaTasa] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [tasaBCV, setTasaBCV] = useState(null)
  const [cargandoBCV, setCargandoBCV] = useState(false)

  useEffect(() => {
    cargarTasa()
    obtenerTasaAutomatica()
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

  async function obtenerTasaAutomatica() {
    setCargandoBCV(true)
    try {
      // Opción 1: API del BCV
      const response = await fetch('https://bcv-api.deno.dev/api/latest')
      const data = await response.json()
      setTasaBCV({
        valor: data.usd,
        fuente: 'BCV',
        fecha: data.fecha
      })
    } catch (error) {
      // Opción 2: API alternativa si la primera falla
      try {
        const response = await fetch('https://exchangemonitor.net/api/ves')
        const data = await response.json()
        setTasaBCV({
          valor: data.promedio,
          fuente: 'Monitor Dólar',
          fecha: new Date().toISOString()
        })
      } catch (error2) {
        console.error('No se pudo obtener tasa automática:', error2)
        setTasaBCV(null)
      }
    } finally {
      setCargandoBCV(false)
    }
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

  function usarTasaAutomatica() {
    if (tasaBCV) {
      setNuevaTasa(tasaBCV.valor.toString())
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
              {tasaActual ? `${tasaActual.usd_a_ves.toFixed(2)} Bs/USD` : 'No disponible'}
            </span>
          </div>
          {tasaActual && (
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
          <h4>📊 Tasa de Referencia</h4>
          {cargandoBCV ? (
            <div className="loading-small">
              <div className="spinner-small"></div>
              Consultando tasa oficial...
            </div>
          ) : tasaBCV ? (
            <div className="referencia-info">
              <div className="referencia-valor">
                {tasaBCV.valor.toFixed(2)} Bs/USD
              </div>
              <div className="referencia-fuente">
                Fuente: {tasaBCV.fuente}
              </div>
              <button 
                className="btn-usar-tasa"
                onClick={usarTasaAutomatica}
              >
                Usar esta tasa
              </button>
            </div>
          ) : (
            <p className="no-disponible">Tasa de referencia no disponible</p>
          )}
          <button 
            className="btn-refrescar"
            onClick={obtenerTasaAutomatica}
            disabled={cargandoBCV}
          >
            🔄 Actualizar tasa de referencia
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