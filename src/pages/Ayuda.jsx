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

// Categorías de ayuda. Cada ítem es un link a /ayuda/:categoriaSlug/:itemSlug
// (rutas que aún no existen — se crean cuando haya contenido real).
// La categoría "faq" es especial: en vez de navegar, despliega el
// acordeón de preguntas/respuestas inline.
const categorias = [
  {
    id: 'pedido',
    titulo: 'Tu Pedido',
    icon: '📦',
    items: [
      { label: 'Rastrea Tu Pedido', slug: 'rastrear' },
      { label: 'Editar o Cancelar un Pedido', slug: 'editar-cancelar' },
      { label: 'Sustituciones para Artículos de Retiro y Entrega', slug: 'sustituciones' },
      { label: 'Pedidos Cancelados', slug: 'cancelados' },
      { label: 'Pedidos Retrasados', slug: 'retrasados' },
      { label: 'Artículos Faltantes', slug: 'faltantes' },
      { label: 'Pedido No Recibido', slug: 'no-recibido' },
      { label: 'Volver a Pedir', slug: 'volver-a-pedir' },
    ],
  },
  {
    id: 'faq',
    titulo: 'Preguntas Frecuentes',
    icon: '💬',
    esFaq: true,
  },
  {
    id: 'cuenta',
    titulo: 'Tu Cuenta',
    icon: '👤',
    items: [
      { label: 'Crear o Editar tu Cuenta', slug: 'crear-editar' },
      { label: 'Recuperar Contraseña', slug: 'recuperar-contrasena' },
      { label: 'Estado de Cuenta y Línea de Crédito', slug: 'estado-de-cuenta' },
    ],
  },
  {
    id: 'pagos',
    titulo: 'Pagos',
    icon: '💳',
    items: [
      { label: 'Métodos de Pago Aceptados', slug: 'metodos' },
      { label: 'Comprobantes y Facturas', slug: 'facturas' },
      { label: 'Problemas con un Pago', slug: 'problemas' },
    ],
  },
]

// ---------------------------------------------------------
// Acordeón de FAQ (anidado dentro de la categoría "faq")
// ---------------------------------------------------------
function FaqAcordeon() {
  const [abierta, setAbierta] = useState(null)

  return (
    <div className="faq-list">
      {preguntas.map((item, index) => (
        <div key={index} className="faq-item">
          <button
            type="button"
            className="faq-item__pregunta"
            onClick={() => setAbierta(abierta === index ? null : index)}
          >
            <span>{item.pregunta}</span>
            <span className={`faq-item__chevron ${abierta === index ? 'faq-item__chevron--abierto' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </button>

          {abierta === index && (
            <div className="faq-item__respuesta">
              <p>{item.respuesta}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------
// Categoría individual del accordion principal
// ---------------------------------------------------------
function CategoriaAyuda({ categoria, abierta, onToggle }) {
  return (
    <div className="ayuda-categoria">
      <button
        type="button"
        className="ayuda-categoria__header"
        onClick={onToggle}
      >
        <span className="ayuda-categoria__icon">{categoria.icon}</span>
        <span className="ayuda-categoria__titulo">{categoria.titulo}</span>
        <span className={`ayuda-categoria__chevron ${abierta ? 'ayuda-categoria__chevron--abierto' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>

      {abierta && (
        <div className="ayuda-categoria__body">
          {categoria.esFaq ? (
            <FaqAcordeon />
          ) : (
            <ul className="ayuda-links-list">
              {categoria.items.map((item) => (
                <li key={item.slug}>
                  <Link to={`/ayuda/${categoria.id}/${item.slug}`} className="ayuda-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------
// Página principal
// ---------------------------------------------------------
function Ayuda() {
  const [categoriaAbierta, setCategoriaAbierta] = useState('pedido')

  function toggleCategoria(id) {
    setCategoriaAbierta((actual) => (actual === id ? null : id))
  }

  return (
    <div className="ayuda-page">
      <div className="ayuda-container">
        {/* Banner de contacto */}
        <div className="ayuda-banner">
          <h1 className="ayuda-banner__titulo">¿No encontraste lo que buscabas?</h1>
          <a href="mailto:ventas@carrisan.com" className="ayuda-banner__cta">
            Escríbenos
          </a>
        </div>

        {/* Accordion de categorías */}
        <div className="ayuda-categorias">
          {categorias.map((categoria) => (
            <CategoriaAyuda
              key={categoria.id}
              categoria={categoria}
              abierta={categoriaAbierta === categoria.id}
              onToggle={() => toggleCategoria(categoria.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Ayuda
