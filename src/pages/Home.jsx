import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './Home.css'

function Home() {
  const [stats, setStats] = useState(null)
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const carruselRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resProductos, resMarcas, resTasa] = await Promise.all([
          api.get('/products'),
          api.get('/marcas'),
          api.get('/prices'),
        ])
        const activos = resProductos.data.filter((p) => p.activo)
        setStats({
          productos: activos.length,
          marcas: resMarcas.data.length,
          tasa: resTasa.data.usd_a_ves,
        })
        setProductos(activos.slice(0, 8))
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  // Animaciones al hacer scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    observerRef.current = observer

    return () => observer.disconnect()
  }, [cargando]) // se vuelve a conectar cuando los datos están listos

  function scrollCarrusel(direccion) {
    carruselRef.current?.scrollBy({ left: direccion * 320, behavior: 'smooth' })
  }

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero__content">
          <span className="hero__tag">Distribución farmacéutica · Venezuela</span>
          <h1>
            Medicamentos, insumos y misceláneos al mayor,{' '}
            <span className="hero__highlight">en un solo pedido</span>
          </h1>
          <p className="hero__text">
            Droguería Carrisán abastece a centros quirúrgicos, unidades estéticas,
            farmacias, fundaciones y clínicas con precios claros en USD y Bs.
            y seguimiento de orden en tiempo real.
          </p>
          <div className="hero__cta">
            <Link to="/login" className="btn btn--primary">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="btn btn--outline-dark">
              Solicitar acceso
            </Link>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__card hero__card--1">
            <span className="hero__card-icon">💊</span>
            <span className="hero__card-text">Línea Hospitalaria</span>
          </div>
          <div className="hero__card hero__card--2">
            <span className="hero__card-icon">🏥</span>
            <span className="hero__card-text">Centros quirúrgicos</span>
          </div>
          <div className="hero__card hero__card--3">
            <span className="hero__card-icon">💉</span>
            <span className="hero__card-text">Insumos médicos</span>
          </div>
          <div className="hero__card hero__card--4">
            <span className="hero__card-icon">📦</span>
            <span className="hero__card-text">Pedidos al mayor</span>
          </div>
        </div>
      </section>

      {/* LÍNEAS DE NEGOCIO */}
      <section className="lineas reveal">
        <h2 className="section-title">Nuestras líneas de distribución</h2>
        <div className="lineas__grid">
          <div className="linea-card linea-card--hospitalaria">
            <span className="linea-card__icon">🏨</span>
            <h3>Línea Hospitalaria</h3>
            <p>
              Medicamentos, soluciones y material médico‑quirúrgico para centros
              quirúrgicos, clínicas y unidades estéticas.
            </p>
            <ul className="linea-card__list">
              <li>Centros quirúrgicos</li>
              <li>Unidades de cirugía estética</li>
              <li>Clínicas privadas</li>
            </ul>
          </div>
          <div className="linea-card linea-card--farmacia">
            <span className="linea-card__icon">💊</span>
            <h3>Línea Farmacia</h3>
            <p>
              Productos de venta al público, OTC y fórmulas para farmacias,
              fundaciones y clínicas de atención primaria.
            </p>
            <ul className="linea-card__list">
              <li>Farmacias independientes</li>
              <li>Cadenas de farmacias</li>
              <li>Fundaciones y ONG</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ESTADÍSTICAS + CONFIANZA */}
      <section className="stats reveal">
        <div className="stats__grid">
          <div className="stats__card">
            <span className="stats__number">
              {cargando ? '—' : stats.productos}
            </span>
            <span className="stats__label">productos activos</span>
          </div>
          <div className="stats__card">
            <span className="stats__number">
              {cargando ? '—' : stats.marcas}
            </span>
            <span className="stats__label">marcas disponibles</span>
          </div>
          <div className="stats__card stats__card--tasa">
            <span className="stats__number">
              {cargando ? '—' : stats.tasa.toFixed(2)}
            </span>
            <span className="stats__label">Bs. por USD · tasa BCV</span>
          </div>
          <div className="stats__card stats__card--textual">
            <p>
              Precios en <strong>USD y Bs.</strong> siempre visibles.
              Seguimiento de cada orden desde que la confirmás.
            </p>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="catalogo reveal">
        <div className="catalogo__header">
          <h2 className="section-title">Productos destacados</h2>
          <Link to="/catalogo" className="link-arrow">
            Ver catálogo completo →
          </Link>
        </div>

        {cargando ? (
          <p className="catalogo__loading">Cargando productos...</p>
        ) : (
          <div className="carrusel" ref={carruselRef}>
            {productos.map((producto) => (
              <div key={producto.id} className="carrusel__card">
                <img
                  src={producto.foto_url || '/placeholder.png'}
                  alt={producto.nombre}
                  className="carrusel__img"
                />
                <h4 className="carrusel__nombre">{producto.nombre}</h4>
                <p className="carrusel__marca">{producto.marcas?.nombre}</p>
                <p className="carrusel__precio">
                  ${producto.precio_usd.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="catalogo__nav">
          <button
            onClick={() => scrollCarrusel(-1)}
            aria-label="Anterior"
            className="carousel-btn"
          >
            ‹
          </button>
          <button
            onClick={() => scrollCarrusel(1)}
            aria-label="Siguiente"
            className="carousel-btn"
          >
            ›
          </button>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className="about reveal">
        <div className="about__content">
          <span className="about__label">Quiénes somos</span>
          <h2 className="about__title">Droguería Carrisán, C.A.</h2>
          <p>
            Somos un distribuidor farmacéutico venezolano con enfoque en
            abastecimiento al mayor. Nuestra plataforma digital permite a
            nuestros clientes realizar pedidos, revisar precios actualizados y
            hacer seguimiento de cada orden en tiempo real.
          </p>
          <div className="about__info">
            <span className="about__rif">RIF J-40068410-2</span>
            <span className="about__location">Venezuela</span>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final reveal">
        <h2>¿Listo para hacer tu pedido?</h2>
        <p>Accedé a nuestro catálogo completo, precios al día y control total de tus órdenes.</p>
        <div className="cta-final__buttons">
          <Link to="/login" className="btn btn--primary btn--large">
            Iniciar sesión
          </Link>
          <Link to="/registro" className="btn btn--outline-light btn--large">
            Crear cuenta nueva
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <span>© Droguería Carrisán, C.A. — Todos los derechos reservados.</span>
        <Link to="/login" className="footer__link">
          Portal de clientes
        </Link>
      </footer>
    </div>
  )
}

export default Home