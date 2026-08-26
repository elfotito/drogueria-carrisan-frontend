import { useEffect } from 'react'
import {
  X,
  CreditCard,
  TrendingUp,
  Truck,
  Bell,
  FileText,
  MessageCircle,
  Users,
  ShieldCheck,
  Package,
  MapPin,
  Warehouse,
  Stethoscope,
  Percent,
  Network,
  CheckCircle2,
  Layers,
  Boxes,
} from 'lucide-react'
import './InfoModal.css'

// Mapa de nombres de ícono (string, para poder usarlos desde archivos .js
// sin JSX) a los componentes reales de lucide-react.
const ICONOS = {
  CreditCard,
  TrendingUp,
  Truck,
  Bell,
  FileText,
  MessageCircle,
  Users,
  ShieldCheck,
  Package,
  MapPin,
  Warehouse,
  Stethoscope,
  Percent,
  Network,
  CheckCircle2,
  Layers,
  Boxes,
}

function Icono({ nombre, size = 18 }) {
  const Comp = ICONOS[nombre]
  if (!Comp) return null
  return <Comp size={size} />
}

// ---------------------------------------------------------------
// Renderizadores por tipo de contenido
// ---------------------------------------------------------------

function ListaConIcono({ items }) {
  return (
    <ul className="info-modal__lista">
      {items.map((item, i) => (
        <li key={i} className="info-modal__lista-item">
          <span className="info-modal__lista-icono">
            <Icono nombre={item.icono} />
          </span>
          <div>
            <strong>{item.titulo}</strong>
            <p>{item.texto}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Secciones({ items }) {
  return (
    <>
      {items.map((sec, i) => (
        <section key={i} className="info-modal__seccion">
          {sec.subtitulo && <h3>{sec.subtitulo}</h3>}
          <p>{sec.texto}</p>
        </section>
      ))}
    </>
  )
}

function Pasos({ items }) {
  return (
    <ol className="info-modal__pasos">
      {items.map((paso, i) => (
        <li key={i} className="info-modal__paso">
          <span className="info-modal__paso-numero">{i + 1}</span>
          <div>
            {paso.titulo && <strong>{paso.titulo}</strong>}
            <p>{paso.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Checklist({ items }) {
  return (
    <ul className="info-modal__checklist">
      {items.map((item, i) => (
        <li key={i}>
          <CheckCircle2 size={16} className="info-modal__check-icono" />
          <span>{typeof item === 'string' ? item : item.texto}</span>
        </li>
      ))}
    </ul>
  )
}

function RenderContenido({ data }) {
  if (!data) return null
  switch (data.tipo) {
    case 'lista':
      return <ListaConIcono items={data.contenido} />
    case 'secciones':
      return <Secciones items={data.contenido} />
    case 'pasos':
      return <Pasos items={data.contenido} />
    case 'checklist':
      return <Checklist items={data.contenido} />
    default:
      return null
  }
}

// ---------------------------------------------------------------
// Modal
// ---------------------------------------------------------------

// Uso con datos planos (.js) — lo normal para contenido nuevo:
//   import descuentoInfo from '../data/descuentoVolumenEscala'
//   <InfoModal abierto={abierto} onCerrar={cerrar} data={descuentoInfo} />
//
// Uso con contenido libre (children) — para casos que no encajen
// en los tipos soportados (lista, secciones, pasos, checklist):
//   <InfoModal abierto={abierto} onCerrar={cerrar} titulo="Título">
//     <p>Lo que sea…</p>
//   </InfoModal>
function InfoModal({ abierto, titulo, data, onCerrar, children }) {
  useEffect(() => {
    if (!abierto) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  const tituloFinal = titulo || data?.titulo

  return (
    <div className="info-modal-overlay" onClick={onCerrar}>
      <div
        className="info-modal"
        role="dialog"
        aria-modal="true"
        aria-label={tituloFinal}
        onClick={(e) => e.stopPropagation()}
      >
                <button type="button" className="info-modal__cerrar" onClick={onCerrar} aria-label="Cerrar">
          <X size={18} strokeWidth={2.4} />
        </button>

        <div className="info-modal__header">
          {data?.etiqueta && (
            <span className="info-modal__etiqueta">
              {data.etiquetaIcono && <Icono nombre={data.etiquetaIcono} size={13} />}
              {data.etiqueta}
            </span>
          )}
          {tituloFinal && <h2 className="info-modal__titulo">{tituloFinal}</h2>}
          {data?.subtitulo && <p className="info-modal__subtitulo">{data.subtitulo}</p>}
        </div>

        <div className="info-modal__divisor" />

        <div className="info-modal__cuerpo">
          {data ? <RenderContenido data={data} /> : children}
        </div>

        <div className="info-modal__divisor" />

        <div className="info-modal__pie">
          <button type="button" className="info-modal__boton-entendido" onClick={onCerrar}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoModal
