import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import DashboardMobile from '../components/DashboardMobile'
import HomeCarrusel from '../components/HomeCarrusel'
import './Home.css'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [productos, setProductos] = useState([])
  const [ofertas, setOfertas] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Si hay sesión activa, no hace falta cargar los datos del landing
    // público (stats/productos del hero) — se renderiza el dashboard.
    if (user) {
      setCargando(false)
      return
    }

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
        setTasaVes(resTasa.data.usd_a_ves)
        setProductos(activos.slice(0, 12))
        setOfertas(activos.filter((p) => p.descuento_activo).slice(0, 12))
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [user])

  // Usuario logueado -> dashboard mobile (bottom nav + accesos rápidos)
  // en vez del landing público. Todos los hooks de arriba ya se ejecutaron,
  // así que este return condicional no viola las reglas de hooks.
  if (user) {
    return <DashboardMobile user={user} />
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

      {/* VITRINA — bloques estilo Walmart, mismo componente que usa el dashboard */}
      <HomeCarrusel
        titulo="Ofertas destacadas"
        productos={ofertas}
        tasaVes={tasaVes}
        verTodoTo="/catalogo"
        cargando={cargando}
      />
      <HomeCarrusel
        titulo="Algunos de nuestros productos"
        productos={productos}
        tasaVes={tasaVes}
        verTodoTo="/catalogo"
        cargando={cargando}
      />

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