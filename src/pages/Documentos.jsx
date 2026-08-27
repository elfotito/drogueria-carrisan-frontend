import { useState, useEffect } from 'react'
import api from '../api/axios'
import LayoutPaginaPrincipal from '../components/paginas-principales/Layoutpaginaprincipal'
import { NAV_UNIFICADO } from '../components/paginas-principales/NavUnificado'
import { Download } from 'lucide-react'
import './Documentos.css'

// Mismo catálogo que TIPOS_DOCUMENTO del backend, solo para pintar las
// opciones — si agregas un tipo nuevo allá, replica la entrada acá.
const TIPOS = [
  { id: 'rif', label: 'RIF', automatica: true, desc: 'Descarga inmediata, válida por 72 horas' },
  { id: 'estado_cuenta', label: 'Estado de cuenta', automatica: false, desc: 'Te lo enviamos a tu correo' },
  { id: 'referencia_comercial', label: 'Referencia comercial', automatica: false, desc: 'Te lo enviamos a tu correo' },
  { id: 'otro', label: 'Otro documento', automatica: false, desc: 'Cuéntanos qué necesitas' },
]

function tiempoRestante(fechaExpiracion) {
  const ms = new Date(fechaExpiracion) - new Date()
  if (ms <= 0) return null
  const horas = Math.floor(ms / (1000 * 60 * 60))
  const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `${horas}h ${minutos}m`
}

function TarjetaTipo({ tipo, onSolicitar, enviando }) {
  const [mostrarNota, setMostrarNota] = useState(false)
  const [descripcion, setDescripcion] = useState('')

  if (tipo.id === 'otro' && mostrarNota) {
    return (
      <div className="doc-tipo doc-tipo--form">
        <p className="doc-tipo__label">{tipo.label}</p>
        <textarea
          placeholder="¿Qué documento necesitas?"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          className="doc-tipo__textarea"
        />
        <button
          className="doc-tipo__btn"
          onClick={() => onSolicitar(tipo.id, descripcion)}
          disabled={!descripcion.trim() || enviando}
        >
          Enviar solicitud
        </button>
      </div>
    )
  }

  return (
    <div className="doc-tipo">
      <p className="doc-tipo__label">{tipo.label}</p>
      <p className="doc-tipo__desc">{tipo.desc}</p>
      <button
        className="doc-tipo__btn"
        onClick={() => (tipo.id === 'otro' ? setMostrarNota(true) : onSolicitar(tipo.id))}
        disabled={enviando}
      >
        Solicitar
      </button>
    </div>
  )
}

function SolicitudCard({ solicitud }) {
  const tipo = TIPOS.find((t) => t.id === solicitud.tipo_documento)
  const vencida = solicitud.es_automatica && solicitud.fecha_expiracion &&
    new Date(solicitud.fecha_expiracion) < new Date() && !solicitud.url_documento

  return (
    <div className="doc-card">
      <div className="doc-card__top">
        <span className="doc-card__nombre">{tipo?.label || solicitud.tipo_documento}</span>
        <span className={`doc-card__estado doc-card__estado--${solicitud.estado}`}>
          {solicitud.estado === 'pendiente' && 'En revisión'}
          {solicitud.estado === 'aprobada' && (solicitud.es_automatica ? 'Lista' : 'Aprobada')}
          {solicitud.estado === 'rechazada' && 'Rechazada'}
        </span>
      </div>

      {solicitud.descripcion && <p className="doc-card__desc">{solicitud.descripcion}</p>}

      {solicitud.estado === 'aprobada' && solicitud.es_automatica && solicitud.url_documento && (
        <>
          <a href={solicitud.url_documento} target="_blank" rel="noreferrer" className="doc-card__descargar">
            <Download size={15} /> Descargar
          </a>
          <p className="doc-card__vigencia">Disponible por {tiempoRestante(solicitud.fecha_expiracion)}</p>
        </>
      )}

      {solicitud.estado === 'aprobada' && vencida && (
        <p className="doc-card__nota">Enlace vencido — solicítalo de nuevo si lo necesitas</p>
      )}

      {solicitud.estado === 'aprobada' && !solicitud.es_automatica && (
        <p className="doc-card__nota">Lo enviamos a tu correo registrado</p>
      )}

      {solicitud.estado === 'rechazada' && solicitud.nota_admin && (
        <p className="doc-card__nota">{solicitud.nota_admin}</p>
      )}
    </div>
  )
}

function Documentos() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    try {
      const { data } = await api.get('/documentos/mios')
      setSolicitudes(data)
    } catch (err) {
      console.error('Error al cargar documentos', err)
    } finally {
      setCargando(false)
    }
  }

  async function handleSolicitar(tipo_documento, descripcion) {
    setEnviando(true)
    try {
      await api.post('/documentos', { tipo_documento, descripcion })
      cargar()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al solicitar el documento')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutPaginaPrincipal activo="documentos" titulo="Documentos" nav={NAV_UNIFICADO}>
      <div className="doc-page">
        <div className="doc-tipos">
          {TIPOS.map((tipo) => (
            <TarjetaTipo key={tipo.id} tipo={tipo} onSolicitar={handleSolicitar} enviando={enviando} />
          ))}
        </div>

        {!cargando && solicitudes.length > 0 && (
          <div className="doc-lista">
            {solicitudes.map((s) => (
              <SolicitudCard key={s.id} solicitud={s} />
            ))}
          </div>
        )}
      </div>
    </LayoutPaginaPrincipal>
  )
}

export default Documentos