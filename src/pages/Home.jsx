import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './Home.css'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function Home() {
  const [stats, setStats] = useState(null)
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const carruselRef = useRef(null)

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

  function scrollCarrusel(direccion) {
    carruselRef.current?.scrollBy({ left: direccion * 320, behavior: 'smooth' })
  }

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero__content">
          <span className="eyebrow">
            <span className="dot dot--teal" /><span className="dot dot--indigo" />
            Distribución farmacéutica · Venezuela
          </span>
          <h1>Todo el pedido de tu droguería, en un solo lugar.</h1>
          <p>
            Catálogo activo, precio en USD y en Bs. siempre visible, y el
            estado de cada orden a la vista. Así trabajamos con nuestros
            clientes desde hace años — ahora, también en línea.
          </p>
          <div className="hero__cta">
            <Link to="/login" className="btn btn--teal">Iniciar sesión</Link>
            <Link to="/registro" className="btn btn--ghost">Crear cuenta</Link>
          </div>
        </div>

        <div className="pastillero" aria-hidden="true">
          {DIAS.map((dia, i) => (
            <div className="pastillero__slot" key={i} style={{ '--i': i }}>
              <span className="pastillero__dia">{dia}</span>
              {(i === 1 || i === 4) && <span className="pastillero__pill" />}
            </div>
          ))}
        </div>
      </section>

      {/* BENTO: datos reales + beneficios */}
      <section className="bento">
        <span className="eyebrow">
          <span className="dot dot--teal" /><span className="dot dot--indigo" />
          En este momento
        </span>
        <h2>Un compartimento para cada parte del pedido.</h2>

        <div className="bento__grid">
          <div className="bento__tile bento__tile--stat">
            <span className="bento__number">{cargando ? '—' : stats.productos}</span>
            <span className="bento__label">productos activos en catálogo</span>
          </div>

          <div className="bento__tile bento__tile--stat">
            <span className="bento__number">{cargando ? '—' : stats.marcas}</span>
            <span className="bento__label">marcas disponibles</span>
          </div>

          <div className="bento__tile bento__tile--stat bento__tile--teal">
            <span className="bento__number">
              {cargando ? '—' : stats.tasa.toFixed(2)}
            </span>
            <span className="bento__label">Bs. por USD, tasa vigente</span>
          </div>

          <div className="bento__tile bento__tile--wide">
            <h3>Precio en USD y Bs., siempre visible</h3>
            <p>Cada producto muestra su equivalente en bolívares con la tasa del día — sin cálculos de más.</p>
          </div>

          <div className="bento__tile bento__tile--wide">
            <h3>Seguimiento de cada pedido</h3>
            <p>Desde que confirmás la orden hasta que queda finalizada, con el detalle completo de lo que pediste.</p>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="catalogo">
        <div className="catalogo__header">
          <div>
            <span className="eyebrow">
              <span className="dot dot--teal" /><span className="dot dot--indigo" />
              Catálogo
            </span>
            <h2>Algunos de nuestros productos</h2>
          </div>
          <div className="catalogo__nav">
            <button onClick={() => scrollCarrusel(-1)} aria-label="Anterior">‹</button>
            <button onClick={() => scrollCarrusel(1)} aria-label="Siguiente">›</button>
          </div>
        </div>

        {cargando ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="carrusel" ref={carruselRef}>
            {productos.map((producto) => (
              <div key={producto.id} className="carrusel__card">
                <img src={producto.foto_url || '/placeholder.png'} alt={producto.nombre} />
                <h4>{producto.nombre}</h4>
                <p className="carrusel__marca">{producto.marcas?.nombre}</p>
                <p className="carrusel__precio">${producto.precio_usd.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        <Link to="/catalogo" className="ver-todo">Ver catálogo completo →</Link>
      </section>

      {/* ABOUT — cierra el loop con el hero */}
      <section className="about">
        <span className="eyebrow eyebrow--light">
          <span className="dot dot--teal" /><span className="dot dot--indigo" />
          Quiénes somos
        </span>
        <h2>Droguería Carrisán, C.A.</h2>
        <p>
          Distribuimos productos farmacéuticos y de cuidado personal a
          farmacias y comercios, con un catálogo siempre activo y precios
          claros en ambas monedas. Esta plataforma es la forma más rápida de
          hacer tu pedido y llevar el control de tu cuenta con nosotros.
        </p>
        <span className="about__rif">RIF J-40068410-2</span>
      </section>

      <footer className="footer">
        <span>Droguería Carrisán, C.A.</span>
        <Link to="/login" className="btn btn--ghost btn--small">Iniciar sesión</Link>
      </footer>
    </div>
  )
}

export default Home