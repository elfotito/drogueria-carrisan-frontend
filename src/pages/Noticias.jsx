import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import BottomNav from '../components/BottomNav'
import Footer from '../components/Footer'
import { NOTICIAS_ADS } from '../config/noticiasAds'
import './Noticias.css'

const CADA_N_NOTICIAS = 6
const ETIQUETAS_AD = {
  promocionado: 'Promocionado',
  patrocinado: 'Patrocinado',
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function elegirAdAleatorio(pool, ultimoId) {
  if (pool.length === 0) return null
  if (pool.length === 1) return pool[0]
  let candidato
  do {
    candidato = pool[Math.floor(Math.random() * pool.length)]
  } while (candidato.id === ultimoId)
  return candidato
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

  const [destacada, ...resto] = noticias

  // Intercala un ad cada CADA_N_NOTICIAS noticias reales del grid.
  // La destacada nunca cuenta ni puede ser un ad.
  const feed = useMemo(() => {
    if (NOTICIAS_ADS.length === 0) {
      return resto.map((noticia) => ({ tipo: 'noticia', data: noticia }))
    }
    const resultado = []
    let ultimoAdId = null
    resto.forEach((noticia, i) => {
      resultado.push({ tipo: 'noticia', data: noticia })
      const esCorte = (i + 1) % CADA_N_NOTICIAS === 0
      if (esCorte) {
        const ad = elegirAdAleatorio(NOTICIAS_ADS, ultimoAdId)
        if (ad) {
          ultimoAdId = ad.id
          resultado.push({ tipo: 'ad', data: ad })
        }
      }
    })
    return resultado
  }, [resto])

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

        {!cargando && !error && noticias.length === 0 && (
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
                <img src={destacada.imagen} alt={destacada.titulo} className="noticias-pagina__destacada-img" loading="lazy" />
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

        {!cargando && !error && feed.length > 0 && (
          <div className="noticias-pagina__grid">
            {feed.map((item) =>
              item.tipo === 'ad' ? (
                <NoticiaAdCard key={`ad-${item.data.id}`} ad={item.data} />
              ) : (
                
                  <a
                  key={item.data.link}
                  href={item.data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="noticias-pagina__card"
                >
                  <div className="noticias-pagina__card-img-wrap">
                    {item.data.imagen ? (
                      <img src={item.data.imagen} alt={item.data.titulo} className="noticias-pagina__img" loading="lazy" />
                    ) : (
                      <div className="noticias-pagina__img noticias-pagina__img--placeholder" aria-hidden="true">📰</div>
                    )}
                    <span className="noticias-pagina__fuente-badge noticias-pagina__fuente-badge--sm">
                      {item.data.fuente || 'Fuente externa'}
                    </span>
                  </div>
                  <div className="noticias-pagina__texto">
                    <span className="noticias-pagina__fecha">{formatearFecha(item.data.fecha)}</span>
                    <h3 className="noticias-pagina__card-titulo">{item.data.titulo}</h3>
                    {item.data.resumen && <p className="noticias-pagina__resumen">{item.data.resumen}</p>}
                  </div>
                </a>
              )
            )}
          </div>
        )}
      </div>

      <div className="noticias-pagina__espaciador" aria-hidden="true" />
      <BottomNav />
      <Footer />
    </div>
  )
}

function NoticiaAdCard({ ad }) {
  const esExterno = ad.link?.startsWith('http')
  const contenido = (
    <>
      <div className="noticias-pagina__card-img-wrap">
        {ad.imagen ? (
          <img src={ad.imagen} alt={ad.titulo} className="noticias-pagina__img" loading="lazy" />
        ) : (
          <div className="noticias-pagina__img noticias-pagina__img--placeholder" aria-hidden="true">📣</div>
        )}
        <span className="noticias-pagina__fuente-badge noticias-pagina__fuente-badge--sm noticias-pagina__fuente-badge--ad">
          {ETIQUETAS_AD[ad.tipo] || 'Promocionado'}
        </span>
      </div>
      <div className="noticias-pagina__texto">
        <h3 className="noticias-pagina__card-titulo">{ad.titulo}</h3>
        {ad.resumen && <p className="noticias-pagina__resumen">{ad.resumen}</p>}
      </div>
    </>
  )

  return esExterno ? (
    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="noticias-pagina__card noticias-pagina__card--ad">
      {contenido}
    </a>
  ) : (
    <Link to={ad.link} className="noticias-pagina__card noticias-pagina__card--ad">
      {contenido}
    </Link>
  )
}

export default Noticias