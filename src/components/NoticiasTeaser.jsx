import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './NoticiasTeaser.css'

const CANTIDAD_TEASER = 4

function formatearFecha(fechaISO) {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
}

function NoticiasTeaser() {
  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api
      .get('/noticias')
      .then((res) => setNoticias(Array.isArray(res.data) ? res.data.slice(0, CANTIDAD_TEASER) : []))
      .catch((err) => console.error('Error al cargar noticias:', err))
      .finally(() => setCargando(false))
  }, [])

  if (!cargando && noticias.length === 0) return null

  return (
    <section className="noticias-teaser">
      <div className="noticias-teaser__header">
        <h2 className="noticias-teaser__titulo">Noticias del sector farmacéutico</h2>
        <Link to="/noticias" className="noticias-teaser__ver-todas">Ver todas</Link>
      </div>

      <div className="noticias-teaser__lista">
        {cargando
          ? Array.from({ length: CANTIDAD_TEASER }).map((_, i) => (
              <div key={i} className="noticias-teaser__card noticias-teaser__card--skeleton" />
            ))
          : noticias.map((noticia) => (
              <a
                key={noticia.link}
                href={noticia.link}
                target="_blank"
                rel="noopener noreferrer"
                className="noticias-teaser__card"
              >
                {noticia.imagen ? (
                  <img
                    src={noticia.imagen}
                    alt=""
                    className="noticias-teaser__img"
                    loading="lazy"
                  />
                ) : (
                  <div className="noticias-teaser__img noticias-teaser__img--placeholder" aria-hidden="true">📰</div>
                )}
                <div className="noticias-teaser__texto">
                  <span className="noticias-teaser__fecha">{formatearFecha(noticia.fecha)}</span>
                  <h3 className="noticias-teaser__card-titulo">{noticia.titulo}</h3>
                </div>
              </a>
            ))}
      </div>
    </section>
  )
}

export default NoticiasTeaser