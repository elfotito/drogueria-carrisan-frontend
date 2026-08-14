 import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import DashboardMobile from '../components/DashboardMobile'
import HomeCarrusel from '../components/HomeCarrusel'
import './Home.css'

function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [ofertas, setOfertas] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Si hay sesión activa, no hace falta cargar los datos del landing
    // público — se renderiza el dashboard.
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
        setOfertas(activos.filter((p) => p.descuento_activo).slice(0, 10))
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
      {/* HERO — imagen de fondo a pantalla completa (placeholder) */}
      <section className="home-hero">
        <div className="home-hero__imagen-placeholder" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span>Imagen de portada — bodega / equipo Carrisán</span>
        </div>
        <div className="home-hero__overlay" />

        <div className="home-hero__contenido">
          <p className="home-eyebrow">Droguería Carrisán · Distribución B2B en Venezuela</p>
          <h1>Todo el pedido de tu droguería, en un solo lugar.</h1>
          <p className="home-hero__texto">
            Catálogo activo, precio en USD y en Bs. siempre visible, y el estado de cada orden a la
            vista. Así trabajamos con nuestros clientes desde hace años — ahora, también en línea.
          </p>
          <div className="home-hero__cta">
            <Link to="/registro" className="home-btn home-btn--primario">Crear cuenta</Link>
            <Link to="/catalogo" className="home-btn home-btn--fantasma">Ver catálogo</Link>
          </div>
        </div>
      </section>

      {/* Franja de datos reales */}
      <section className="home-franja">
        <div className="home-franja__item">
          <span className="home-franja__valor">{cargando ? '—' : stats.productos}</span>
          <span className="home-franja__label">productos activos</span>
        </div>
        <div className="home-franja__item">
          <span className="home-franja__valor">{cargando ? '—' : stats.marcas}</span>
          <span className="home-franja__label">marcas disponibles</span>
        </div>
        <div className="home-franja__item">
          <span className="home-franja__valor">{cargando ? '—' : stats.tasa.toFixed(2)}</span>
          <span className="home-franja__label">Bs. por USD, tasa vigente</span>
        </div>
      </section>

      <div className="home-container">
        {/* Card destacada — teaser a Quiénes Somos */}
        <section className="home-destacada">
          <div className="home-destacada__imagen-placeholder" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span>Imagen — equipo Carrisán</span>
          </div>
          <div className="home-destacada__texto">
            <p className="home-eyebrow">Desde 2010</p>
            <h2>Una empresa familiar, cerca de quienes cuidan la salud</h2>
            <p>
              Somos una empresa venezolana, familiar desde el primer día. Conocé nuestra historia,
              lo que nos define y por qué farmacias y clínicas confían en nosotros.
            </p>
            <Link to="/quienes-somos" className="home-link-flecha">Conocé quiénes somos →</Link>
          </div>
        </section>

        {/* Qué hacemos */}
        <section className="home-seccion home-seccion--imagen">
          <div className="home-seccion__imagen-placeholder" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span>Imagen — catálogo / bodega</span>
          </div>
          <div className="home-seccion__texto">
            <h2>Qué hacemos</h2>
            <p>
              Distribuimos productos farmacéuticos y material médico-quirúrgico a farmacias, clínicas
              y distribuidores en toda Venezuela. Nuestra plataforma te deja armar tu pedido, ver el
              precio en USD y en Bs. con la tasa del día, y darle seguimiento hasta que llega a tu
              puerta — todo desde tu cuenta.
            </p>
          </div>
        </section>

        {/* Nuestras líneas */}
        <section className="home-seccion">
          <h2>Nuestras líneas</h2>
          <div className="home-lineas">
            <div className="home-linea-card">
              <div className="home-linea-card__imagen-placeholder" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
              <h3>Línea Farmacia</h3>
              <p>Medicamentos y productos de cuidado personal de los laboratorios más reconocidos.</p>
            </div>
            <div className="home-linea-card">
              <div className="home-linea-card__imagen-placeholder" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
              <h3>Línea Hospitalaria</h3>
              <p>Insumos y material médico-quirúrgico para clínicas e instituciones de salud.</p>
            </div>
          </div>
          <p className="home-lineas__nota">
            Creá tu cuenta para acceder al catálogo completo de ambas líneas con tus precios.
          </p>
        </section>
      </div>

      {/* Teaser de catálogo — vista limitada para invitados */}
      <HomeCarrusel
        titulo="Ofertas destacadas"
        productos={ofertas}
        tasaVes={tasaVes}
        verTodoTo="/catalogo"
        cargando={cargando}
      />

      <div className="home-container">
        {/* Cómo empezar */}
        <section className="home-pasos">
          <h2>¿Cómo empiezo a comprar?</h2>
          <div className="home-pasos__grid">
            <div className="home-paso">
              <span className="home-paso__numero">1</span>
              <h3>Creá tu cuenta</h3>
              <p>Contanos sobre tu farmacia, clínica o negocio. Es gratis y toma un par de minutos.</p>
            </div>
            <div className="home-paso">
              <span className="home-paso__numero">2</span>
              <h3>Explorá el catálogo</h3>
              <p>Con tu cuenta activa, vas a ver tus precios y disponibilidad en tiempo real.</p>
            </div>
            <div className="home-paso">
              <span className="home-paso__numero">3</span>
              <h3>Hacé tu pedido</h3>
              <p>Armá tu carrito y seguí cada orden desde que la confirmás hasta que llega.</p>
            </div>
          </div>
        </section>
      </div>

      {/* CTA final */}
      <section className="home-cta-final">
        <h2>Creá tu cuenta y empezá a pedir</h2>
        <p>Sumate a las farmacias y clínicas que ya trabajan con nosotros.</p>
        <Link to="/registro" className="home-btn home-btn--primario home-btn--grande">Crear cuenta gratis</Link>
        <p className="home-cta-final__login">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </section>

      {/* FOOTER — única forma de navegar a páginas públicas sin BottomNav */}
      <footer className="home-footer">
        <div className="home-footer__marca">
          <span className="home-footer__nombre">Droguería Carrisán, C.A.</span>
          <span className="home-footer__rif">RIF J-40068410-2</span>
        </div>

        <nav className="home-footer__columna">
          <span className="home-footer__titulo">Plataforma</span>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/registro">Crear cuenta</Link>
          <Link to="/login">Iniciar sesión</Link>
        </nav>

        <nav className="home-footer__columna">
          <span className="home-footer__titulo">Información</span>
          <Link to="/quienes-somos">Quiénes somos</Link>
          <Link to="/ayuda">Ayuda</Link>
          <a href="mailto:ventas@carrisan.com">Contacto</a>
        </nav>

        <nav className="home-footer__columna">
          <span className="home-footer__titulo">Legal</span>
          <Link to="/terminos">Términos y Condiciones</Link>
          <Link to="/privacidad">Aviso de Privacidad</Link>
        </nav>

        <div className="home-footer__copy">
          © {new Date().getFullYear()} Droguería Carrisán, C.A. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}

export default Home