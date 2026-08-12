import { useState, useEffect, useCallback } from 'react'
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
  const [actualizacionAutomatica, setActualizacionAutomatica] = useState(true)
  const [proximaActualizacion, setProximaActualizacion] = useState(null)

  useEffect(() => {
    cargarTasa()
    verificarActualizacionAutomatica()
    
    // Revisar cada minuto si debe actualizar
    const intervalo = setInterval(verificarActualizacionAutomatica, 60000)
    
    return () => clearInterval(intervalo)
  }, [])

  // Cargar tasa actual desde el backend
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

  // Verificar si estamos en horario de actualización
  function verificarActualizacionAutomatica() {
    const ahora = new Date()
    const diaSemana = ahora.getDay() // 0=domingo, 1=lunes, ..., 6=sábado
    const horaVenezuela = obtenerHoraVenezuela(ahora)
    const horas = horaVenezuela.getHours()
    const minutos = horaVenezuela.getMinutes()
    const dia = horaVenezuela.getDay()
    
    // Es fin de semana?
    const esFinDeSemana = dia === 0 || dia === 6
    
    // Horario BCV: lunes a viernes entre 3pm y 5pm
    const enHorarioBCV = !esFinDeSemana && horas >= 15 && horas < 17
    
    // Calcular próxima actualización
    const proxima = calcularProximaActualizacion(horaVenezuela)
    setProximaActualizacion(proxima)
    
    if (enHorarioBCV && actualizacionAutomatica) {
      // Verificar si ya actualizamos hoy
      const ultimaActualizacion = localStorage.getItem('ultima_actualizacion_tasa')
      const hoy = horaVenezuela.toDateString()
      
      if (ultimaActualizacion !== hoy) {
        console.log('🕒 Horario BCV detectado, actualizando tasa automáticamente...')
        obtenerTasaYActualizar()
      }
    }
  }

  // Obtener hora de Venezuela (UTC-4)
  function obtenerHoraVenezuela(fecha) {
    // Venezuela está en UTC-4
    const offsetVenezuela = -4 * 60 // minutos
    const offsetLocal = fecha.getTimezoneOffset()
    const diferencia = offsetVenezuela - offsetLocal
    return new Date(fecha.getTime() + diferencia * 60000)
  }

  // Calcular próxima actualización
  function calcularProximaActualizacion(fechaVzla) {
    const dia = fechaVzla.getDay()
    const horas = fechaVzla.getHours()
    
    let proxima = new Date(fechaVzla)
    
    if (dia === 0) {
      // Domingo -> próximo lunes 3pm
      proxima.setDate(proxima.getDate() + 1)
      proxima.setHours(15, 0, 0, 0)
    } else if (dia === 6) {
      // Sábado -> próximo lunes 3pm
      proxima.setDate(proxima.getDate() + 2)
      proxima.setHours(15, 0, 0, 0)
    } else if (horas < 15) {
      // Antes de las 3pm -> hoy 3pm
      proxima.setHours(15, 0, 0, 0)
    } else if (horas >= 17) {
      // Después de las 5pm
      if (dia === 5) {
        // Viernes después de 5pm -> próximo lunes 3pm
        proxima.setDate(proxima.getDate() + 3)
      } else {
        // Otros días -> mañana 3pm
        proxima.setDate(proxima.getDate() + 1)
      }
      proxima.setHours(15, 0, 0, 0)
    } else {
      // Entre 3pm y 5pm, ya está en horario
      proxima.setHours(17, 0, 0, 0)
    }
    
    return proxima
  }

  // Obtener tasa de referencia y actualizar automáticamente
  async function obtenerTasaYActualizar() {
    setCargandoReferencia(true)
    setErrorReferencia('')
    
    const tasa = await consultarTasaExterna()
    
    if (tasa) {
      setTasaReferencia({
        valor: tasa.valor,
        fuente: tasa.fuente,
        fecha: new Date().toISOString()
      })
      
      // Actualizar automáticamente en el backend
      try {
        await api.patch('/prices/tasa-cambio', { usd_a_ves: Number(tasa.valor) })
        
        // Guardar que ya actualizamos hoy
        const ahoraVzla = obtenerHoraVenezuela(new Date())
        localStorage.setItem('ultima_actualizacion_tasa', ahoraVzla.toDateString())
        
        setMensaje({ 
          tipo: 'exito', 
          texto: `✅ Tasa actualizada automáticamente: ${tasa.valor.toFixed(2)} Bs/USD (Fuente: ${tasa.fuente})` 
        })
        
        await cargarTasa()
        
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000)
      } catch (err) {
        setMensaje({ 
          tipo: 'error', 
          texto: 'Tasa obtenida pero no se pudo guardar automáticamente' 
        })
      }
    }
    
    setCargandoReferencia(false)
  }

  // Consultar APIs externas
  async function consultarTasaExterna() {
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
        nombre: 'DolarAPI',
        url: 'https://ve.dolar-api.com/api/rate/usd/ves',
        extraer: (data) => data?.price
      }
    ]

    for (const fuente of fuentes) {
      try {
        const response = await fetch(fuente.url)
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        
        const data = await response.json()
        const valor = fuente.extraer(data)
        
        if (valor && !isNaN(valor) && valor > 0) {
          return {
            valor: Number(valor).toFixed(2),
            fuente: fuente.nombre
          }
        }
      } catch (error) {
        console.log(`Fuente ${fuente.nombre} falló:`, error.message)
        continue
      }
    }
    
    return null
  }

  // Obtener solo referencia (sin actualizar backend)
  async function obtenerTasaReferencia() {
    setCargandoReferencia(true)
    setErrorReferencia('')
    
    const tasa = await consultarTasaExterna()
    
    if (tasa) {
      setTasaReferencia({
        valor: tasa.valor,
        fuente: tasa.fuente,
        fecha: new Date().toISOString()
      })
    } else {
      setErrorReferencia('No se pudo obtener tasa de referencia de ninguna fuente')
      setTasaReferencia(null)
    }
    
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
      
      // Guardar que ya actualizamos (para no sobreescribir con automática)
      const ahoraVzla = obtenerHoraVenezuela(new Date())
      localStorage.setItem('ultima_actualizacion_tasa', ahoraVzla.toDateString())
      
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

  function usarTasaReferencia() {
    if (tasaReferencia?.valor) {
      setNuevaTasa(tasaReferencia.valor.toString())
    }
  }

  // Formatear próxima actualización
  function formatearProximaActualizacion(fecha) {
    if (!fecha) return 'Calculando...'
    
    const ahora = obtenerHoraVenezuela(new Date())
    const diffMs = fecha.getTime() - ahora.getTime()
    const diffMin = Math.ceil(diffMs / 60000)
    
    if (diffMin <= 0) return 'Ahora'
    if (diffMin < 60) return `en ${diffMin} minutos`
    
    const diffHoras = Math.floor(diffMin / 60)
    const minRestantes = diffMin % 60
    
    if (diffHoras < 24) {
      return `en ${diffHoras}h ${minRestantes}min`
    }
    
    const dias = Math.floor(diffHoras / 24)
    return `en ${dias} día(s)`
  }

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando información de tasa...</p>
      </div>
    )
  }

  const ahoraVzla = obtenerHoraVenezuela(new Date())
  const enHorarioBCV = [1,2,3,4,5].includes(ahoraVzla.getDay()) && 
                       ahoraVzla.getHours() >= 15 && 
                       ahoraVzla.getHours() < 17

  return (
    <div className="tasa-cambio-container">
      <div className="section-header">
        <h2>💱 Tasa de Cambio</h2>
        <p className="section-description">
          Administra la tasa de cambio para conversiones de moneda
        </p>
      </div>

      {/* Estado de actualización automática */}
      <div className={`auto-update-status ${actualizacionAutomatica ? 'activa' : 'inactiva'}`}>
        <div className="auto-update-info">
          <span className="auto-update-icon">
            {actualizacionAutomatica ? '🟢' : '🔴'}
          </span>
          <div>
            <strong>Actualización Automática</strong>
            <span className="auto-update-detalle">
              {actualizacionAutomatica 
                ? `Próxima actualización ${formatearProximaActualizacion(proximaActualizacion)}`
                : 'Desactivada'}
            </span>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={actualizacionAutomatica}
            onChange={(e) => setActualizacionAutomatica(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
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
          {enHorarioBCV && (
            <div className="horario-bcv-badge">
              🏦 En horario BCV (3pm - 5pm)
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
            {cargandoReferencia ? 'Consultando...' : '🔄 Consultar tasa de referencia'}
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