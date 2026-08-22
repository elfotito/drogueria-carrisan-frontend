import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './Valoraciones.css'

// ---------------------------------------------------------------
// Sección de valoraciones para ProductoDetalle.jsx. Uso:
//
//   import Valoraciones from '../components/Valoraciones'
//   ...
//   <Valoraciones productoId={producto.id} />
//
// Autocontenido: carga la lista + si el usuario ya calificó, y
// maneja el formulario. No necesita props aparte del id.
// ---------------------------------------------------------------

function Estrellas({ valor, tamaño = 16 }) {
  return (
    <div className="valoraciones-estrellas" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={tamaño}
          fill={n <= Math.round(valor) ? '#f59e0b' : 'none'}
          color={n <= Math.round(valor) ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </div>
  )
}

function SelectorEstrellas({ valor, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="valoraciones-selector">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Calificar con ${n} estrella${n > 1 ? 's' : ''}`}
        >
          <Star
            size={26}
            fill={n <= (hover || valor) ? '#f59e0b' : 'none'}
            color={n <= (hover || valor) ? '#f59e0b' : '#d1d5db'}
          />
        </button>
      ))}
    </div>
  )
}

function formatFecha(fechaISO) {
  return new Date(fechaISO).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Valoraciones({ productoId }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [datos, setDatos] = useState({ promedio: 0, total: 0, valoraciones: [] })
  const [miValoracion, setMiValoracion] = useState(null)
  const [cargando, setCargando] = useState(true)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [estrellasNuevas, setEstrellasNuevas] = useState(0)
  const [comentarioNuevo, setComentarioNuevo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoId])

  async function cargar() {
    setCargando(true)
    try {
      const { data } = await api.get(`/products/${productoId}/valoraciones`)
      setDatos(data)
    } catch (err) {
      console.error('Error al cargar valoraciones:', err)
    }

    if (user) {
      try {
        const { data } = await api.get(`/products/${productoId}/valoraciones/mia`)
        setMiValoracion(data)
      } catch (err) {
        console.error('Error al consultar valoración propia:', err)
      }
    }
    setCargando(false)
  }

  async function handleEnviar(e) {
    e.preventDefault()
    if (estrellasNuevas === 0) {
      setError('Selecciona una calificación')
      return
    }
    setError('')
    setEnviando(true)
    try {
      const { data } = await api.post(`/products/${productoId}/valoraciones`, {
        estrellas: estrellasNuevas,
        comentario: comentarioNuevo,
      })
      setMiValoracion(data)
      setMostrarForm(false)
      cargar() // refresca lista + promedio
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar la valoración')
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return null

  return (
    <div className="valoraciones-seccion">
      <div className="valoraciones-resumen">
        <h2>Valoraciones</h2>
        {datos.total > 0 ? (
          <div className="valoraciones-resumen__cifra">
            <Estrellas valor={datos.promedio} tamaño={18} />
            <span className="valoraciones-resumen__numero">{datos.promedio}</span>
            <span className="valoraciones-resumen__total">
              ({datos.total} valoración{datos.total !== 1 ? 'es' : ''})
            </span>
          </div>
        ) : (
          <p className="valoraciones-vacio">Sé el primero en valorar este producto.</p>
        )}
      </div>

      {!user ? (
        <button type="button" className="valoraciones-btn-outline" onClick={() => navigate('/login')}>
          Inicia sesión para valorar
        </button>
      ) : miValoracion ? (
        <div className="valoraciones-propia">
          <p className="valoraciones-propia__label">Tu valoración</p>
          <Estrellas valor={miValoracion.estrellas} />
          {miValoracion.comentario && <p className="valoraciones-propia__comentario">{miValoracion.comentario}</p>}
        </div>
      ) : mostrarForm ? (
        <form className="valoraciones-form" onSubmit={handleEnviar}>
          <SelectorEstrellas valor={estrellasNuevas} onChange={setEstrellasNuevas} />
          <textarea
            placeholder="Comparte tu experiencia con este producto (opcional)"
            value={comentarioNuevo}
            onChange={(e) => setComentarioNuevo(e.target.value)}
            rows={3}
            maxLength={500}
          />
          {error && <p className="valoraciones-error">{error}</p>}
          <div className="valoraciones-form__acciones">
            <button type="button" onClick={() => setMostrarForm(false)} className="valoraciones-btn-outline">
              Cancelar
            </button>
            <button type="submit" className="valoraciones-btn-primario" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Publicar valoración'}
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="valoraciones-btn-outline" onClick={() => setMostrarForm(true)}>
          Dejar una valoración
        </button>
      )}

      {datos.valoraciones.length > 0 && (
        <div className="valoraciones-lista">
          {datos.valoraciones.map((v) => (
            <div key={v.id} className="valoraciones-item">
              <div className="valoraciones-item__top">
                <span className="valoraciones-item__nombre">{v.users?.nombre || 'Cliente'}</span>
                <span className="valoraciones-item__fecha">{formatFecha(v.created_at)}</span>
              </div>
              <Estrellas valor={v.estrellas} tamaño={14} />
              {v.comentario && <p className="valoraciones-item__comentario">{v.comentario}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Valoraciones
