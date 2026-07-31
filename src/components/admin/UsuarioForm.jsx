import { useState } from 'react'
import api from '../../api/axios'

function UsuarioForm({ usuario, onClose, onGuardado }) {
  const esEdicion = Boolean(usuario)

  const [email, setEmail] = useState(usuario?.email || '')
  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [etiqueta, setEtiqueta] = useState(usuario?.etiqueta || '')
  const [password, setPassword] = useState('')
  const [activo, setActivo] = useState(usuario?.activo ?? true)
  const [lineaCredito, setLineaCredito] = useState(usuario?.linea_credito ?? 0)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      if (esEdicion) {
        const payload = {
          nombre,
          etiqueta,
          activo,
          linea_credito: Number(lineaCredito),
          ...(password && { password }),
        }
        await api.patch(`/users/${usuario.id}`, payload)
      } else {
        await api.post('/users', { email, password, nombre, etiqueta })
      }
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el usuario')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={esEdicion}
              required
            />
          </label>

          <label>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </label>

          <label>
            Etiqueta
            <input value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} />
          </label>

          <label>
            {esEdicion ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!esEdicion}
            />
          </label>

          {esEdicion && (
            <>
              <label>
                Línea de crédito (USD)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={lineaCredito}
                  onChange={(e) => setLineaCredito(e.target.value)}
                />
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                />
                Activo
              </label>
            </>
          )}

          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UsuarioForm