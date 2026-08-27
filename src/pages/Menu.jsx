import { Link } from 'react-router-dom'
import './Menu.css'




// --- Íconos SVG inline, stroke = currentColor (heredan color del tile) ---
const ICONOS = {
  farmacia: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M5 12h14" />
      <path d="M9 7h6" />
    </svg>
  ),
  hospital: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 21V8l8-5 8 5v13" />
      <path d="M4 21h16" />
      <path d="M12 9v6" />
      <path d="M9 12h6" />
    </svg>
  ),
  ofertas: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 2 12l10 10 10-10L12 2Z" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  plan: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z" />
      <path d="M12 9v6" />
      <path d="M9 12h6" />
    </svg>
  ),
  aliados: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 8a3 3 0 1 0-2.83-4H14a3 3 0 0 0 0 6" />
      <path d="M7 16a3 3 0 1 0 2.83 4H10a3 3 0 0 0 0-6" />
      <path d="M13 10 8 15" />
      <path d="M11 14l2 2" />
    </svg>
  ),
  ayuda: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.3 1-1.3 1.9" />
      <path d="M12 17h.01" />
    </svg>
  ),
  items: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h12v18l-6-4-6 4V3Z" />
    </svg>
  ),
  pedidos: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  ),
  estadoCuenta: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2h9l5 5v15H6V2Z" />
      <path d="M15 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  ),
  faq: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.3 1-1.3 1.9" />
      <path d="M12 17h.01" />
    </svg>
  ),
  contacto: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.1-5.1a8.4 8.4 0 1 1 16.9-3.4Z" />
    </svg>
  ),
  quienesSomos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v5h1" />
    </svg>
  ),
  notificaciones: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 14 18 8Z" />
      <path d="M10.3 20a1.9 1.9 0 0 0 3.4 0" />
    </svg>
  ),
  terminos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2h9l5 5v15H6V2Z" />
      <path d="M15 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  ),
  privacidad: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z" />
    </svg>
  ),
}

// --- Grid principal: 6 accesos destacados ---
// NOTA: /plan-carrisan y /servicios-aliados aún no existen como páginas —
// quedan enlazadas para cuando se construyan.
const GRID_PRINCIPAL = [
  { to: '/farmacia', label: 'Línea Farmacia', icono: 'farmacia', tinte: 'teal' },
  { to: '/hospitalaria', label: 'Línea Hospitalaria', icono: 'hospital', tinte: 'azul' },
  { to: '/ofertas', label: 'Ofertas', icono: 'ofertas', tinte: 'indigo' },
  { to: '/admin', label: 'Plan Carrisán+', icono: 'plan', tinte: 'teal' },
  { to: '/mis-solicitudes/cotizaciones', label: 'Servicios Aliados', icono: 'aliados', tinte: 'azul' },
  { to: '/mis-solicitudes/requerimientos', label: 'Ayuda', icono: 'ayuda', tinte: 'indigo' },
]

// --- Grid secundario: Mi Cuenta ---
const GRID_CUENTA = [
  { to: '/mis-items', label: 'Mis Items', icono: 'items', tinte: 'teal' },
  { to: '/orders', label: 'Mis Órdenes', icono: 'pedidos', tinte: 'azul' },
  { to: '/estado-cuenta', label: 'Mi Estado de Cuenta', icono: 'estadoCuenta', tinte: 'indigo' },
]

// --- Listas inferiores: título + descripción + flecha ---
// Estas dos secciones son un punto de partida — se amplían cuando existan
// las páginas de historial, devoluciones, etc.
const LISTA_SOPORTE = [
  { to: '/ayuda', icono: 'faq', titulo: 'Preguntas Frecuentes', descripcion: 'Resuelve dudas sobre pedidos, pagos y entregas.' },
  { to: '/contacto', icono: 'contacto', titulo: 'Contáctanos', descripcion: 'Habla directo con nuestro equipo comercial.' },
  { to: '/quienes-somos', icono: 'quienesSomos', titulo: 'Quiénes Somos', descripcion: 'Conoce la trayectoria de Droguería Carrisán.' },
]

const LISTA_CUENTA = [
  { to: '/notificaciones', icono: 'notificaciones', titulo: 'Notificaciones', descripcion: 'Revisa alertas de tus pedidos y tu cuenta.' },
  { to: '/terminos', icono: 'terminos', titulo: 'Términos y Condiciones', descripcion: 'Condiciones de uso de la plataforma.' },
  { to: '/privacidad', icono: 'privacidad', titulo: 'Política de Privacidad', descripcion: 'Cómo protegemos y usamos tus datos.' },
]

function MenuTile({ item }) {
  return (
    <Link to={item.to} className="menu-tile">
      <span className={`menu-tile__icono menu-tile__icono--${item.tinte}`}>
        {ICONOS[item.icono]}
      </span>
      <span className="menu-tile__label">{item.label}</span>
    </Link>
  )
}

function MenuListaItem({ item }) {
  return (
    <Link to={item.to} className="menu-lista__item">
      <span className="menu-lista__icono">{ICONOS[item.icono]}</span>
      <span className="menu-lista__texto">
        <span className="menu-lista__titulo">{item.titulo}</span>
        <span className="menu-lista__descripcion">{item.descripcion}</span>
      </span>
      <span className="menu-lista__flecha" aria-hidden="true">›</span>
    </Link>
  )
}

function Menu() {
  return (
    <div className="menu-page">
      <h1 className="menu-page__titulo">Menú</h1>
      <button
            className="close-sidebar"
            onClick={() => setMenuMobileAbierto(false)}
          >
            ✕
          </button>
      <section className="menu-seccion">
        <div className="menu-grid">
          {GRID_PRINCIPAL.map((item) => (
            <MenuTile key={item.label} item={item} />
          ))}
        </div>
      </section>

      <section className="menu-seccion">
        <h2 className="menu-seccion__titulo">Mi Cuenta</h2>
        <div className="menu-grid menu-grid--3col">
          {GRID_CUENTA.map((item) => (
            <MenuTile key={item.label} item={item} />
          ))}
        </div>
      </section>

      <section className="menu-seccion">
        <h2 className="menu-seccion__titulo">Soporte</h2>
        <div className="menu-lista">
          {LISTA_SOPORTE.map((item) => (
            <MenuListaItem key={item.to} item={item} />
          ))}
        </div>
      </section>

      <section className="menu-seccion">
        <h2 className="menu-seccion__titulo">Cuenta y Legal</h2>
        <div className="menu-lista">
          {LISTA_CUENTA.map((item) => (
            <MenuListaItem key={item.to} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Menu