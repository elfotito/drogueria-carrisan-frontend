import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import faqCategorias from '../data/faqData'
import BottomNav from '../components/BottomNav'
import './FAQ.css'

// ---------------------------------------------------------
// Íconos inline (SVG) — mismo lenguaje visual que Ayuda.jsx
// ---------------------------------------------------------
const ICONOS = {
  pedido: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" />
    </svg>
  ),
  camion: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="6" width="14" height="11" rx="1" />
      <path d="M15 9h4l3 3v5h-7z" /><circle cx="6" cy="19.5" r="1.6" /><circle cx="17.5" cy="19.5" r="1.6" />
    </svg>
  ),
  cuenta: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  pagos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  chevronAbajo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  buscar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  cerrar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18" /><path d="M6 6l12 12" />
    </svg>
  ),
}

// ---------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------
function CategoriaPill({ categoria, activa, onClick }) {
  return (
    <button
      type="button"
      className={`faq-pill ${activa ? 'faq-pill--activa' : ''}`}
      onClick={onClick}
    >
      <span className="faq-pill__icono">{ICONOS[categoria.icono]}</span>
      <span className="faq-pill__label">{categoria.titulo}</span>
    </button>
  )
}

function FaqItem({ item, abierta, onToggle }) {
  return (
    <div className="faq-fila">
      <button type="button" className="faq-fila__boton" onClick={onToggle} aria-expanded={abierta}>
        <span className="faq-fila__pregunta">{item.pregunta}</span>
        <span className={`faq-fila__chevron ${abierta ? 'faq-fila__chevron--abierto' : ''}`}>
          {ICONOS.chevronAbajo}
        </span>
      </button>
      {abierta && (
        <div className="faq-fila__respuesta">
          <p>{item.respuesta}</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------
// Página principal
// ---------------------------------------------------------
function Faq() {
  const [categoriaActiva, setCategoriaActiva] = useState(faqCategorias[0].id)
  const [busqueda, setBusqueda] = useState('')
  const [abiertaKey, setAbiertaKey] = useState(null)

  const buscando = busqueda.trim().length > 0

  // Resultados de búsqueda: recorre todas las categorías, sin importar cuál está activa
  const resultados = useMemo(() => {
    if (!buscando) return []
    const q = busqueda.trim().toLowerCase()
    const out = []
    faqCategorias.forEach((cat) => {
      cat.preguntas.forEach((item, i) => {
        if (item.pregunta.toLowerCase().includes(q) || item.respuesta.toLowerCase().includes(q)) {
          out.push({ ...item, key: `${cat.id}-${i}`, categoriaTitulo: cat.titulo })
        }
      })
    })
    return out
  }, [busqueda, buscando])

  const categoria = faqCategorias.find((c) => c.id === categoriaActiva)

  const toggle = (key) => setAbiertaKey(abiertaKey === key ? null : key)

  return (
    <div className="faq-page">
      {/* Header azul con título — mismo patrón que Ayuda */}
      <div className="faq-header">
        <h1>Preguntas Frecuentes</h1>
        <p>Respuestas rápidas sobre pedidos, envíos, pagos y tu cuenta.</p>
      </div>

      <div className="faq-container">
        {/* Buscador */}
        <div className="faq-buscador">
          <span className="faq-buscador__icono">{ICONOS.buscar}</span>
          <input
            type="text"
            placeholder="Busca tu pregunta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {buscando && (
            <button type="button" className="faq-buscador__limpiar" onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda">
              {ICONOS.cerrar}
            </button>
          )}
        </div>

        {buscando ? (
          // ---------- Resultados de búsqueda ----------
          <section className="faq-card">
            <h2 className="faq-card__titulo">
              {resultados.length > 0
                ? `${resultados.length} resultado${resultados.length === 1 ? '' : 's'} para "${busqueda}"`
                : `Sin resultados para "${busqueda}"`}
            </h2>

            {resultados.length > 0 ? (
              <div className="faq-lista">
                {resultados.map((item) => (
                  <div key={item.key}>
                    <span className="faq-fila__etiqueta">{item.categoriaTitulo}</span>
                    <FaqItem item={item} abierta={abiertaKey === item.key} onToggle={() => toggle(item.key)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="faq-sin-resultados">
                Prueba con otras palabras o revisa el{' '}
                <Link to="/ayuda">Centro de Ayuda</Link> para más temas.
              </p>
            )}
          </section>
        ) : (
          <>
            {/* Pills de categoría — scroll horizontal en mobile */}
            <div className="faq-pills">
              {faqCategorias.map((c) => (
                <CategoriaPill
                  key={c.id}
                  categoria={c}
                  activa={categoriaActiva === c.id}
                  onClick={() => {
                    setCategoriaActiva(c.id)
                    setAbiertaKey(null)
                  }}
                />
              ))}
            </div>

            {/* Card de la categoría activa */}
            <section className="faq-card">
              <h2 className="faq-card__titulo">{categoria.titulo}</h2>
              <div className="faq-lista">
                {categoria.preguntas.map((item, i) => {
                  const key = `${categoria.id}-${i}`
                  return (
                    <FaqItem key={key} item={item} abierta={abiertaKey === key} onToggle={() => toggle(key)} />
                  )
                })}
              </div>
            </section>
          </>
        )}

        {/* Banner de contacto final — mismo patrón que Ayuda */}
        <div className="faq-banner">
          <h2 className="faq-banner__titulo">¿No encontraste tu respuesta?</h2>
          <div className="faq-banner__acciones">
            <Link to="/ayuda" className="faq-banner__cta faq-banner__cta--secundario">Centro de Ayuda</Link>
            <a href="mailto:ventas@carrisan.com" className="faq-banner__cta">Escríbenos</a>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default Faq