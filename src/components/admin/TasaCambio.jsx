import { useState, useEffect } from 'react'
import api from '../../api/axios'

function TasaCambio() {
  const [tasaActual, setTasaActual] = useState(null)
  const [nuevaTasa, setNuevaTasa] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cargarTasa()
  }, [])

  async function cargarTasa() {
    try {
      const { data } = await api.get('/prices')
      setTasaActual(data)
    } catch (err) {
      setError('No se pudo cargar la tasa actual')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMensaje('')
    setError('')
    setGuardando(true)

    try {
      await api.patch('/prices/tasa-cambio', { usd_a_ves: Number(nuevaTasa) })
      setMensaje('Tasa actualizada correctamente')
      setNuevaTasa('')
      await cargarTasa() // refrescamos para mostrar la nueva tasa y fecha
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la tasa')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <p>Cargando tasa...</p>

  return (
    <div>
      <h2>Tasa de Cambio</h2>

      {tasaActual && (
        <p>
          Tasa actual: <strong>{tasaActual.usd_a_ves} Bs./USD</strong>
          {' '}(actualizada el {new Date(tasaActual.updated_at).toLocaleString('es-VE')})
        </p>
      )}

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Nueva tasa (Bs. por USD)"
          value={nuevaTasa}
          onChange={(e) => setNuevaTasa(e.target.value)}
          required
        />
        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Actualizar tasa'}
        </button>
      </form>
    </div>
  )
}

export default TasaCambio