import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import EnlaceInvalido from './EnlaceInvalido'
import '../../pages/Auth.css'
import '../../pages/RegistroInvita.css'

/**
 * Guard de los formularios por invitación (profesional y honorífico).
 *
 * Estos formularios NO son públicos: solo deben abrirse desde el enlace que
 * el dueño comparte (/registro/invita?t=<token>). El guard valida ese token
 * contra GET /registro-invita/status y, si no es válido (o no viene), muestra
 * la pantalla "Enlace no válido" en lugar del formulario.
 *
 * Es una protección de frontend/UX. El candado de la API es independiente.
 */
function RequiereInvitacion({ children }) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t') || ''
  const [estado, setEstado] = useState('cargando') // cargando | ok | invalido

  // El setState ocurre SOLO en el callback asíncrono, nunca en el cuerpo
  // síncrono del efecto (regla react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!token) return undefined
    let activo = true
    api
      .get('/registro-invita/status', { params: { t: token } })
      .then((res) => {
        if (activo) setEstado(res.data && res.data.valido ? 'ok' : 'invalido')
      })
      .catch(() => {
        if (activo) setEstado('invalido')
      })
    return () => {
      activo = false
    }
  }, [token])

  // Sin token en la URL no hay nada que esperar: siempre bloqueado.
  const estadoReal = token ? estado : 'invalido'

  if (estadoReal === 'cargando') {
    return (
      <div className="auth-page">
        <main className="auth-container reg-invita-container">
          <div className="auth-card">
            <div className="reg-invita__cargando">
              <span className="reg-invita__spinner" aria-hidden="true" />
              <p>Verificando enlace...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (estadoReal === 'invalido') {
    return (
      <div className="auth-page">
        <main className="auth-container reg-invita-container">
          <div className="auth-card">
            <EnlaceInvalido />
          </div>
        </main>
      </div>
    )
  }

  return children
}

export default RequiereInvitacion
