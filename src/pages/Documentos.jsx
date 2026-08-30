import { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import LayoutPaginaPrincipal from '../components/paginas-principales/Layoutpaginaprincipal'
import { NAV_UNIFICADO } from '../components/paginas-principales/NavUnificado'
import { Download, Clock } from 'lucide-react'
import './Documentos.css'

// Mismo catálogo que TIPOS_DOCUMENTO del backend, solo para pintar las
// opciones — si agregas un tipo nuevo allá, replica la entrada acá.
const TIPOS = [
  { id: 'rif', label: 'RIF', automatica: true, desc: 'Descarga inmediata, válida por 72 horas' },
  { id: 'estado_cuenta', label: 'Estado de cuenta', automatica: false, desc: 'Te lo enviamos a tu correo' },
  { id: 'referencia_comercial', label: 'Referencia comercial', automatica: false, desc: 'Te lo enviamos a tu correo' },
  { id: 'otro', label: 'Otro documento', automatica: false, desc: 'Cuéntanos qué necesitas' },
]

// ── RIF: mismo documento para todos los clientes, enlace fijo en Drive ──
// "uc?export=download" hace que Drive sirva el archivo directo en vez de
// abrir la vista previa (dispara la descarga automáticamente).
const RIF_FILE_ID = '1urzfao8FWFlvjCTXtz42KZNZX-uTJm9i'
const RIF_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${RIF_FILE_ID}`

const RIF_VENTANA_MS = 72 * 60 * 60 * 1000 // 72h disponible para descargar
const RIF_ENFRIAMIENTO_MS = 72 * 60 * 60 * 1000 // + 72h inhabilitado
const RIF_STORAGE_KEY = 'doc_rif_ultima_solicitud'

const NOVENTA_DIAS_MS = 90 * 24 * 60 * 60 * 1000

// ── Utilidades de tiempo ────────────────────────────────────────────
function descomponerTiempo(ms) {
  if (ms <= 0) return { dias: 0, horas: 0, minutos: 0 }
  const dias = Math.floor(ms / (1000 * 60 * 60 * 24))
  const horas = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return { dias, horas, minutos }
}

function formatoCorto({ dias, horas, minutos }) {
  if (dias > 0) return `${dias}d ${horas}h ${minutos}m`
  if (horas > 0) return `${horas}h ${minutos}m`
  return `${minutos}m`
}

// Cronómetro simple y discreto: solo días/horas/minutos, se refresca cada minuto.
function Cronometro({ hasta, texto }) {
  const [ahora, setAhora] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])

  const restante = hasta - ahora
  if (restante <= 0) return null

  return (
    <p className="doc-cronometro">
      <Clock size={12} />
      <span>{texto} {formatoCorto(descomponerTiempo(restante))}</span>
    </p>
  )
}

// ── Estado del RIF, controlado en el navegador (mismo archivo para     ──
// todos, no depende de que el backend guarde una URL por solicitud).
// Si más adelante el backend empieza a devolver `fecha_expiracion` real
// por solicitud, este hook es el único lugar que habría que ajustar.
function useEstadoRif(registrarSolicitud) {
  const [ultimaSolicitud, setUltimaSolicitud] = useState(() => {
    const guardado = localStorage.getItem(RIF_STORAGE_KEY)
    return guardado ? Number(guardado) : null
  })
  const [, forzarTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => forzarTick((n) => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const ahora = Date.now()
  const expiraEn = ultimaSolicitud ? ultimaSolicitud + RIF_VENTANA_MS : null
  const habilitaEn = ultimaSolicitud ? ultimaSolicitud + RIF_VENTANA_MS + RIF_ENFRIAMIENTO_MS : null

  let estado = 'disponible' // puede solicitarse
  if (expiraEn && ahora < expiraEn) estado = 'descargable'
  else if (habilitaEn && ahora < habilitaEn) estado = 'enfriamiento'

  function descargar() {
    const a = document.createElement('a')
    a.href = RIF_DOWNLOAD_URL
    a.rel = 'noreferrer'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  function solicitar() {
    const ts = Date.now()
    setUltimaSolicitud(ts)
    localStorage.setItem(RIF_STORAGE_KEY, String(ts))
    descargar()
    // Dejamos registro en el backend para que quede en el historial del
    // admin, sin bloquear la descarga si la solicitud tarda o falla.
    registrarSolicitud?.('rif')?.catch(() => {})
  }

  return { estado, expiraEn, habilitaEn, descargar, solicitar }
}

function TarjetaTipo({ tipo, onSolicitar, enviando, rif }) {
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

  // RIF: la tarjeta cambia de estado sola (solicitar → descargar → enfriamiento)
  if (tipo.id === 'rif') {
    return (
      <div className="doc-tipo">
        <p className="doc-tipo__label">{tipo.label}</p>
        <p className="doc-tipo__desc">{tipo.desc}</p>

        {rif.estado === 'descargable' && (
          <>
            <button className="doc-tipo__btn doc-tipo__btn--descargar" onClick={rif.descargar}>
              <Download size={14} /> Descargar
            </button>
            <Cronometro hasta={rif.expiraEn} texto="Disponible por" />
          </>
        )}

        {rif.estado === 'enfriamiento' && (
          <>
            <button className="doc-tipo__btn" disabled>
              Solicitar
            </button>
            <Cronometro hasta={rif.habilitaEn} texto="Disponible de nuevo en" />
          </>
        )}

        {rif.estado === 'disponible' && (
          <button className="doc-tipo__btn" onClick={rif.solicitar}>
            Solicitar
          </button>
        )}
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

  return (
    <div className="doc-card">
      <div className="doc-card__top">
        <span className="doc-card__nombre">{tipo?.label || solicitud.tipo_documento}</span>
        <span className={`doc-card__estado doc-card__estado--${solicitud.estado}`}>
          {solicitud.estado === 'pendiente' && 'En revisión'}
          {solicitud.estado === 'aprobada' && (solicitud.es_automatica ? 'Entregado' : 'Aprobada')}
          {solicitud.estado === 'rechazada' && 'Rechazada'}
        </span>
      </div>

      {solicitud.descripcion && <p className="doc-card__desc">{solicitud.descripcion}</p>}

      {solicitud.estado === 'aprobada' && solicitud.es_automatica && (
        <p className="doc-card__nota">Disponible para descarga arriba, mientras esté vigente</p>
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

// Intenta leer la fecha de creación sin importar cómo la llame el backend.
// Ajusta esta lista si tu API usa otro nombre de campo.
function obtenerFechaCreacion(solicitud) {
  const valor = solicitud.fecha_creacion || solicitud.created_at || solicitud.createdAt
  return valor ? new Date(valor) : null
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

  const rif = useEstadoRif((tipo) => api.post('/documentos', { tipo_documento: tipo }).then(cargar))

  // Solo mostramos actividad de los últimos 90 días; pasado ese tiempo se
  // consideran limpiadas de la vista. El borrado real en la base de datos
  // necesita un job en el backend — avísame si quieres que lo armemos.
  const solicitudesRecientes = useMemo(() => {
    const limite = Date.now() - NOVENTA_DIAS_MS
    return solicitudes.filter((s) => {
      const fecha = obtenerFechaCreacion(s)
      return !fecha || fecha.getTime() >= limite
    })
  }, [solicitudes])

  return (
    <LayoutPaginaPrincipal activo="documentos" titulo="Documentos" nav={NAV_UNIFICADO}>
      <div className="doc-page">
        <div className="doc-tipos">
          {TIPOS.map((tipo) => (
            <TarjetaTipo
              key={tipo.id}
              tipo={tipo}
              onSolicitar={handleSolicitar}
              enviando={enviando}
              rif={rif}
            />
          ))}
        </div>

        {!cargando && solicitudesRecientes.length > 0 && (
          <div className="doc-historial">
            <h2 className="doc-historial__titulo">Actividad reciente</h2>
            <div className="doc-lista">
              {solicitudesRecientes.map((s) => (
                <SolicitudCard key={s.id} solicitud={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </LayoutPaginaPrincipal>
  )
}

export default Documentos
