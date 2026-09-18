import { useState, useEffect } from 'react'
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

  return (
    <div className="noticias-pagina">
      <div className="noticias-pagina__container">
        <header className="noticias-pagina__header">
          <h1 className="noticias-pagina__titulo">Noticias del sector farmacéutico</h1>
          <p className="noticias-pagina__subtitulo">Últimas novedades de política, industria y gestión farmacéutica</p>
        </header>

        {cargando && (
          <div className="noticias-pagina__grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="noticias-pagina__card noticias-pagina__card--skeleton" />
            ))}
          </div>
        )}

        {!cargando && error && (
          <p className="noticias-pagina__vacio">No pudimos cargar las noticias en este momento. Intenta de nuevo más tarde.</p>
        )}

        {!cargando && !error && noticias.length === 0 && (
          <p className="noticias-pagina__vacio">No hay noticias disponibles por ahora.</p>
        )}

        {!cargando && !error && noticias.length > 0 && (
          <div className="noticias-pagina__grid">
            {noticias.map((noticia) => (
              <a
                key={noticia.link}
                href={noticia.link}
                target="_blank"
                rel="noopener noreferrer"
                className="noticias-pagina__card"
              >
                {noticia.imagen ? (
                  <img src={noticia.imagen} alt="" className="noticias-pagina__img" loading="lazy" />
                ) : (
                  <div className="noticias-pagina__img noticias-pagina__img--placeholder" aria-hidden="true">📰</div>
                )}
                <div className="noticias-pagina__texto">
                  <span className="noticias-pagina__fuente">{noticia.fuente || 'Fuente externa'} · {formatearFecha(noticia.fecha)}</span>
                  <h2 className="noticias-pagina__card-titulo">{noticia.titulo}</h2>
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