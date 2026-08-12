import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Ayuda.css'

// Preguntas frecuentes — mismas de tu FAQ.jsx original
const preguntas = [
  {
    pregunta: '¿Cómo me registro en la plataforma?',
    respuesta: 'El registro es gestionado por nuestro equipo. Contáctanos a ventas@carrisan.com y te crearemos una cuenta con los precios según tu perfil comercial.'
  },
  {
    pregunta: '¿Cómo realizo un pedido?',
    respuesta: 'Navega por el catálogo, agrega productos al carrito, revisa tu orden y confírmala. Recibirás una notificación con el número de orden.'
  },
  {
    pregunta: '¿Cuáles son los tiempos de entrega?',
    respuesta: 'El despacho se coordina directamente con cada cliente. Los tiempos varían según ubicación y disponibilidad de productos.'
  },
  {
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta: 'Trabajamos con transferencia bancaria y pago móvil. Los detalles de pago se envían al confirmar la orden.'
  },
  {
    pregunta: '¿Puedo ver mis precios personalizados?',
    respuesta: 'Sí. Al iniciar sesión, el catálogo muestra los precios según tu etiqueta (mayorista, distribuidor, etc.). También puedes consultar tu estado de cuenta.'
  },
  {
    pregunta: '¿Cómo sé si mi orden fue procesada?',
    respuesta: 'Puedes ver el estado de tus órdenes en "Mis Órdenes". También recibirás notificaciones cuando el estado cambie.'
  },
  {
    pregunta: '¿Tienen política de devolución?',
    respuesta: 'Sí. Las devoluciones aplican por productos vencidos o defectuosos. Debes notificarlo dentro de las 48 horas posteriores a la entrega.'
  }
]

// Tabs superiores — anclan a las secciones de la misma página (scroll),
// igual que los accesos "Farmacia / Telemedicina / ..." de referencia.
const tabs = [
  { id: 'pedido', label: 'Tu Pedido', icon: '📦' },
  { id: 'cuenta', label: 'Tu Cuenta', icon: '👤' },
  { id: 'pagos', label: 'Pagos', icon: '💳' },
  { id: 'faq', label: 'Preguntas', icon: '💬' },
]

// Secciones con lista de enlaces (ícono + título + descripción + chevron)
const secciones = [
  {
    id: 'pedido',
    titulo: '¿Cómo podemos ayudarte hoy?',
    items: [
      { icon: '📍', label: 'Rastrea Tu Pedido', desc: 'Consulta el estado de tu orden en tiempo real.', slug: 'rastrear' },
      { icon: '✏️', label: 'Editar o Cancelar un Pedido', desc: 'Modifica tu orden mientras aún esté en proceso.', slug: 'editar-cancelar' },
      { icon: '🔁', label: 'Pedidos Retrasados', desc: 'Qué hacer si tu pedido está tardando más de lo esperado.', slug: 'retrasados' },
      { icon: '📦', label: 'Artículos Faltantes', desc: 'Reporta productos que no llegaron en tu entrega.', slug: 'faltantes' },
      { icon: '🔄', label: 'Volver a Pedir', desc: 'Repite una orden anterior en un solo paso.', slug: 'volver-a-pedir' },
    ],
  },
  {
    id: 'cuenta',
    titulo: 'Servicios adicionales de tu cuenta',
    items: [
      { icon: '🆔', label: 'Crear o Editar tu Cuenta', desc: 'Actualiza tus datos comerciales y de contacto.', slug: 'crear-editar' },
      { icon: '🔑', label: 'Recuperar Contraseña', desc: 'Restablece tu acceso con tu RIF o cédula.', slug: 'recuperar-contrasena' },
      { icon: '📊', label: 'Estado de Cuenta y Línea de Crédito', desc: 'Revisa tus facturas, pagos y crédito disponible.', to: '/estado-cuenta' },
    ],
  },
  {
    id: 'pagos',
    titulo: 'Pagos',
    items: [
      { icon: '💵', label: 'Métodos de Pago Aceptados', desc: 'Transferencia bancaria y pago móvil.', slug: 'metodos' },
      { icon: '🧾', label: 'Comprobantes y Facturas', desc: 'Dónde encontrar tus comprobantes de pago.', slug: 'facturas' },
      { icon: '⚠️', label: 'Problemas con un Pago', desc: 'Qué hacer si tu pago no fue reflejado.', slug: 'problemas' },
    ],
  },
]

// Cards horizontales ("Para todas tus necesidades")
const tarjetas = [
  {
    imagen: '/ayuda/card-catalogo.jpg',
    titulo: 'Catálogo completo',
    desc: 'Explora todas nuestras líneas de productos con precios según tu perfil comercial.',
    boton: 'Ver catálogo',
    to: '/catalogo',
  },
  {
    imagen: '/ayuda/card-estado-cuenta.jpg',
    titulo: 'Estado de Cuenta',
    desc: 'Consulta tus facturas, pagos registrados y línea de crédito disponible.',
    boton: 'Ver estado de cuenta',
    to: '/estado-cuenta',
  },
  {
    imagen: '/ayuda/card-contacto.jpg',
    titulo: 'Habla con nosotros',
    desc: '¿Tienes una consulta puntual? Escríbenos directamente.',
    boton: 'Contactar',
    to: '/contacto',
  },
]

// Enlaces útiles (lista final)
const enlacesUtiles = [
  { icon: '✉️', label: 'Escríbenos', desc: 'ventas@carrisan.com', href: 'mailto:ventas@carrisan.com', externo: true },
  { icon: '🛒', label: 'Ver catálogo completo', desc: 'Todos nuestros productos y líneas.', to: '/catalogo' },
  { icon: 'ℹ️', label: 'Quiénes Somos', desc: 'Conoce más sobre Droguería Carrisán.', to: '/quienes-somos' },
  { icon: '📄', label: 'Términos y Condiciones', desc: 'Condiciones de uso de la plataforma.', to: '/terminos' },
]

// ---------------------------------------------------------
// Fila con ícono + título + descripción + chevron (o ícono externo)
// ---------------------------------------------------------
function AyudaRow({ icon, label, desc, to, slug, href, externo, categoriaId }) {
  const contenido = (
    <>
      <span className="ayuda-row__icon">{icon}</span>
      <span className="ayuda-row__texto">
        <span className="ayuda-row__label">{label}</span>
        {desc && <span className="ayuda-row__desc">{desc}</span>}
      </span>
      <span className="ayuda-row__flecha">
        {externo ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        )}
      </span>
    </>
  )

  if (href) {
    return <a href={href} className="ayuda-row">{contenido}</a>
  }
  if (to) {
    return <Link to={to} className="ayuda-row">{contenido}</Link>
  }
  return (
    <Link to={`/ayuda/${categoriaId}/${slug}`} className="ayuda-row">
      {contenido}
    </Link>
  )
}

// ---------------------------------------------------------
// Acordeón de FAQ
// ---------------------------------------------------------
function FaqAcordeon() {
  const [abierta, setAbierta] = useState(null)

  return (
    <div className="ayuda-rows">
      {preguntas.map((item, index) => (
        <div key={index} className="ayuda-row ayuda-row--faq">
          <button
            type="button"
            className="ayuda-row__faq-btn"
            onClick={() => setAbierta(abierta === index ? null : index)}
          >
            <span className="ayuda-row__texto">
              <span className="ayuda-row__label">{item.pregunta}</span>
            </span>
            <span className={`ayuda-row__flecha ayuda-row__flecha--faq ${abierta === index ? 'ayuda-row__flecha--abierta' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          {abierta === index && (
            <p className="ayuda-row__respuesta">{item.respuesta}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------
// Página principal
// ---------------------------------------------------------
function Ayuda() {
  return (
    <div className="ayuda-page">
      {/* Tabs superiores — anclan a las secciones de abajo */}
      <nav className="ayuda-tabs">
        {tabs.map((tab) => (
          <a key={tab.id} href={`#${tab.id}`} className="ayuda-tabs__item">
            <span className="ayuda-tabs__icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </a>
        ))}
      </nav>

      <div className="ayuda-container">
        {/* Franja de aviso */}
        <div className="ayuda-strip">
          <span className="ayuda-strip__icon">💬</span>
          <p className="ayuda-strip__texto">
            <strong>¿Tienes una consulta puntual?</strong> Escríbenos y te respondemos directo.
          </p>
          <a href="mailto:ventas@carrisan.com" className="ayuda-strip__link">Escríbenos</a>
        </div>

        {/* Hero oscuro */}
        <div className="ayuda-hero">
          <div className="ayuda-hero__contenido">
            <h1>Todo tu inventario farmacéutico, en un solo lugar</h1>
            <p>Explora nuestro catálogo completo con precios según tu perfil comercial.</p>
            <Link to="/catalogo" className="ayuda-hero__cta">Ver catálogo</Link>
          </div>
        </div>

        {/* Secciones con listas (Tu Pedido / Tu Cuenta / Pagos) */}
        {secciones.map((seccion, index) => (
          <section key={seccion.id} id={seccion.id} className="ayuda-card">
            <h2>{seccion.titulo}</h2>
            <div className="ayuda-rows">
              {seccion.items.map((item) => (
                <AyudaRow key={item.label} {...item} categoriaId={seccion.id} />
              ))}
            </div>

            {/* Banner de imagen + explicador de pasos, después de "Tu Pedido" */}
            {index === 0 && (
              <>
                <div className="ayuda-banner-img">
                  <img src="/ayuda/banner-principal.jpg" alt="Droguería Carrisán" loading="lazy" />
                </div>

                <div className="ayuda-pasos">
                  <h2>Comprar con nosotros es simple</h2>
                  <div className="ayuda-pasos__item">
                    <span className="ayuda-pasos__icon">🛍️</span>
                    <div>
                      <h3>Realiza tu pedido desde el catálogo</h3>
                      <p>Elige tus productos con los precios de tu perfil comercial.</p>
                    </div>
                  </div>
                  <div className="ayuda-pasos__item">
                    <span className="ayuda-pasos__icon">🛒</span>
                    <div>
                      <h3>Agrega tu orden y confírmala</h3>
                      <p>Revisa el carrito y confirma cuando esté listo.</p>
                    </div>
                  </div>
                  <div className="ayuda-pasos__item">
                    <span className="ayuda-pasos__icon">🚚</span>
                    <div>
                      <h3>Coordina la entrega con nuestro equipo</h3>
                      <p>Te contactamos para acordar el despacho.</p>
                    </div>
                  </div>
                </div>

                <div className="ayuda-tarjetas">
                  <h2>Para todas tus necesidades</h2>
                  <div className="ayuda-tarjetas__scroll">
                    {tarjetas.map((tarjeta) => (
                      <div key={tarjeta.titulo} className="ayuda-tarjeta">
                        <div className="ayuda-tarjeta__media">
                          <img src={tarjeta.imagen} alt={tarjeta.titulo} loading="lazy" />
                        </div>
                        <h3>{tarjeta.titulo}</h3>
                        <p>{tarjeta.desc}</p>
                        <Link to={tarjeta.to} className="ayuda-tarjeta__btn">{tarjeta.boton}</Link>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        ))}

        {/* Preguntas Frecuentes */}
        <section id="faq" className="ayuda-card">
          <h2>Preguntas Frecuentes</h2>
          <FaqAcordeon />
        </section>

        {/* Enlaces Útiles */}
        <section className="ayuda-card">
          <h2>Enlaces Útiles</h2>
          <div className="ayuda-rows">
            {enlacesUtiles.map((item) => (
              <AyudaRow key={item.label} {...item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Ayuda