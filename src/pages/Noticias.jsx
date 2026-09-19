import { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import BottomNav from '../components/BottomNav'
import Footer from '../components/Footer'
import './Noticias.css'

function formatearFecha(fechaISO) {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Noticias() {
  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [fuenteActiva, setFuenteActiva] = useState('todas')

  useEffect(() => {
    api
      .get('/noticias')
      .then((res) => setNoticias(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Error al cargar noticias:', err)
        setError(true)
      })
      .finally(() => setCargando(false))
  }, [])

  const fuentes = useMemo(() => {
    const set = new Set()
    noticias.forEach((n) => set.add(n.fuente || 'Fuente externa'))
    return Array.from(set)
  }, [noticias])

  const noticiasFiltradas = useMemo(() => {
    if (fuenteActiva === 'todas') return noticias
    return noticias.filter((n) => (n.fuente || 'Fuente externa') === fuenteActiva)
  }, [noticias, fuenteActiva])

  const [destacada, ...resto] = noticiasFiltradas

  return (
    <div className="noticias-pagina">
      <div className="noticias-pagina__container">
        <header className="noticias-pagina__header">
          <div className="noticias-pagina__eyebrow">
            <span className="noticias-pagina__eyebrow-dot" aria-hidden="true" />
            Noticias
          </div>
          <h1 className="noticias-pagina__titulo">Noticias del sector farmacéutico</h1>
          <p className="noticias-pagina__subtitulo">Últimas novedades de política, industria y gestión farmacéutica</p>

          {fuentes.length > 1 && (
            <div className="noticias-pagina__chips" role="tablist" aria-label="Filtrar por fuente">
              <button
                type="button"
                className={`noticias-pagina__chip${fuenteActiva === 'todas' ? ' noticias-pagina__chip--activo' : ''}`}
                onClick={() => setFuenteActiva('todas')}
              >
                Todas
              </button>
              {fuentes.map((fuente) => (
                <button
                  key={fuente}
                  type="button"
                  className={`noticias-pagina__chip${fuenteActiva === fuente ? ' noticias-pagina__chip--activo' : ''}`}
                  onClick={() => setFuenteActiva(fuente)}
                >
                  {fuente}
                </button>
              ))}
            </div>
          )}
        </header>

        {cargando && (
          <>
            <div className="noticias-pagina__destacada-skeleton" />
            <div className="noticias-pagina__grid">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="noticias-pagina__card noticias-pagina__card--skeleton" />
              ))}
            </div>
          </>
        )}

        {!cargando && error && (
          <p className="noticias-pagina__vacio">No pudimos cargar las noticias en este momento. Intenta de nuevo más tarde.</p>
        )}

        {!cargando && !error && noticiasFiltradas.length === 0 && (
          <p className="noticias-pagina__vacio">No hay noticias disponibles por ahora.</p>
        )}

        {!cargando && !error && destacada && (
          <a
            href={destacada.link}
            target="_blank"
            rel="noopener noreferrer"
            className="noticias-pagina__destacada"
          >
            <div className="noticias-pagina__destacada-img-wrap">
              {destacada.imagen ? (
                <img src={destacada.imagen} alt="" className="noticias-pagina__destacada-img" loading="lazy" />
              ) : (
                <div className="noticias-pagina__destacada-img noticias-pagina__img--placeholder" aria-hidden="true">📰</div>
              )}
              <span className="noticias-pagina__fuente-badge">{destacada.fuente || 'Fuente externa'}</span>
            </div>
            <div className="noticias-pagina__destacada-texto">
              <span className="noticias-pagina__fecha">{formatearFecha(destacada.fecha)}</span>
              <h2 className="noticias-pagina__destacada-titulo">{destacada.titulo}</h2>
              {destacada.resumen && <p className="noticias-pagina__destacada-resumen">{destacada.resumen}</p>}
            </div>
          </a>
        )}

        {!cargando && !error && resto.length > 0 && (
          <div className="noticias-pagina__grid">
            {resto.map((noticia) => (
              
                <a
                key={noticia.link}
                href={noticia.link}
                target="_blank"
                rel="noopener noreferrer"
                className="noticias-pagina__card"
              >
                <div className="noticias-pagina__card-img-wrap">
                  {noticia.imagen ? (
                    <img src={noticia.imagen} alt="" className="noticias-pagina__img" loading="lazy" />
                  ) : (
                    <div className="noticias-pagina__img noticias-pagina__img--placeholder" aria-hidden="true">📰</div>
                  )}
                  <span className="noticias-pagina__fuente-badge noticias-pagina__fuente-badge--sm">
                    {noticia.fuente || 'Fuente externa'}
                  </span>
                </div>
                <div className="noticias-pagina__texto">
                  <span className="noticias-pagina__fecha">{formatearFecha(noticia.fecha)}</span>
                  <h3 className="noticias-pagina__card-titulo">{noticia.titulo}</h3>
                  {noticia.resumen && <p className="noticias-pagina__resumen">{noticia.resumen}</p>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="noticias-pagina__espaciador" aria-hidden="true" />
      <BottomNav />
      <Footer />
    </div>
  )
}

export default Noticias