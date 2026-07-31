import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './Home.css'

function Home() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const carruselRef = useRef(null)

  useEffect(() => {
    api.get('/products')
      .then((res) => setProductos(res.data.filter((p) => p.activo).slice(0, 8)))
      .catch((err) => console.error(err))
      .finally(() => setCargando(false))
  }, [])

  function scrollCarrusel(direccion) {
    carruselRef.current?.scrollBy({ left: direccion * 320, behavior: 'smooth' })
  }

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero__content">
          <span className="home-eyebrow">
            <span className="dot dot--teal" /><span className="dot dot--indigo" />
            Distribución farmacéutica · Venezuela
          </span>
          <h1>Tu droguería, siempre a la mano.</h1>
          <p>
            Catálogo actualizado, precios en USD y Bs. al día, y el estado de
            tus pedidos en un solo lugar. Así trabajamos con nuestros clientes
            desde hace años — ahora, también en línea.
          </p>
          <div className="home-hero__cta">
            <Link to="/login" className="btn btn--teal">Iniciar sesión</Link>
            <Link to="/registro" className="btn btn--ghost">Crear cuenta</Link>
          </div>
        </div>

        <div className="home-hero__stack" aria-hidden="true">
          <div className="capsule capsule--1" />
          <div className="capsule capsule--2" />
          <div className="capsule capsule--3" />
        </div>
      </section>

      <section className="home-pillars">
        <div className="pillar">
          <h3>Catálogo al día</h3>
          <p>Productos activos, por marca, con foto y descripción — buscá lo que necesitás en segundos.</p>
        </div>
        <div className="pillar">
          <h3>Precio en USD y Bs.</h3>
          <p>La tasa se actualiza desde administración, así el monto en bolívares nunca queda desactualizado.</p>
        </div>
        <div className="pillar">
          <h3>Seguimiento de pedidos</h3>
          <p>Cada orden queda registrada con su detalle — sabés en todo momento en qué va tu pedido.</p>
        </div>
      </section>

      <section className="home-catalogo">
        <div className="home-section-header">
          <div>
            <span className="home-eyebrow">
              <span className="dot dot--teal" /><span className="dot dot--indigo" />
              Catálogo
            </span>
            <h2>Algunos de nuestros productos</h2>
          </div>
          <div className="home-carrusel-nav">
            <button onClick={() => scrollCarrusel(-1)} aria-label="Anterior">‹</button>
            <button onClick={() => scrollCarrusel(1)} aria-label="Siguiente">›</button>
          </div>
        </div>

        {cargando ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="home-carrusel" ref={carruselRef}>
            {productos.map((producto) => (
              <div key={producto.id} className="home-producto-card">
                <img src={producto.foto_url || '/placeholder.png'} alt={producto.nombre} />
                <h4>{producto.nombre}</h4>
                <p className="home-producto-marca">{producto.marcas?.nombre}</p>
                <p className="home-producto-precio">${producto.precio_usd.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        <Link to="/catalogo" className="home-ver-todo">Ver catálogo completo →</Link>
      </section>

      <section className="home-about">
        <span className="home-eyebrow">
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
      </section>

      <footer className="home-footer">
        <div>
          <strong>Droguería Carrisán, C.A.</strong>
          <span>J-40068410-2</span>
        </div>
        <Link to="/login" className="btn btn--ghost btn--small">Iniciar sesión</Link>
      </footer>
    </div>
  )
}

export default Home