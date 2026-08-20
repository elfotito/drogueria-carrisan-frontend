import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Check, ChevronDown, Play, Star, HeartHandshake,
} from 'lucide-react'
import './Landing.css'

  const BASE_URL = 'https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages'
  
  const urls = {
    hero: `${BASE_URL}/hero.png?width=1200&quality=60&format=webp`,
    financiamiento: `${BASE_URL}/financiamientocarrisan.png?width=800&quality=40&format=webp`,
    descuento: `${BASE_URL}/descuentoxvolumen.png?width=800&quality=40&format=webp`,
    precios: `${BASE_URL}/precioscompetitivos.png?width=800&quality=40&format=webp`,
    registrate: `${BASE_URL}/registrate.png?width=800&quality=40&format=webp`,
    pedidoenlinea: `${BASE_URL}/pedidoenlinea.png?width=800&quality=40&format=webp`,
    recibe: `${BASE_URL}/recibe.png?width=800&quality=60&format=webp`,
    cadena: `${BASE_URL}/cadena.png?width=800&quality=60&format=webp`,
    deliverydc: `${BASE_URL}/deliverydc.png?width=800&quality=40&format=webp`,
    encargada: `${BASE_URL}/encargada.png?width=800&quality=40&format=webp`,
    equipomedico: `${BASE_URL}/equipomedico.png?width=800&quality=40&format=webp`,
    victor: `${BASE_URL}/victor.png?width=800&quality=60`,
    tratohecho: `${BASE_URL}/financiamiento.png?width=400&quality=40&format=webp`,
    lineahospitalariaa: `${BASE_URL}/lineahospitalariaa.png?width=400&quality=40&format=webp`,
  }

  const img = (path, width = 800) => {
  return `${BASE_URL}/${path}?width=${width}&quality=80`
}

const ImagePlaceholder = ({ label, className }) => {
  return (
    <div className={className} style={{ 
      backgroundColor: '#e0e0e0', 
      padding: '40px', 
      textAlign: 'center',
      color: '#888'
    }}>
      {label || 'Imagen'}
    </div>
  )
}
 



function Carrusel({ items, renderItem, claseContenedor, claseTarjeta }) {
  const [activo, setActivo] = useState(0)
  const scrollRef = useRef(null)

  function manejarScroll() {
    const el = scrollRef.current
    if (!el) return
    const ancho = el.clientWidth
    const indice = Math.round(el.scrollLeft / ancho)
    setActivo(indice)
  }

  function irA(indice) {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: indice * el.clientWidth, behavior: 'smooth' })
    setActivo(indice)
  }

  return (
    <>
      <div
        ref={scrollRef}
        className={`landing-carrusel ${claseContenedor}`}
        onScroll={manejarScroll}
      >
        {items.map((item, i) => (
          <div key={i} className={`landing-carrusel__item ${claseTarjeta}`}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      <div className="landing-carrusel__dots" role="tablist" aria-label="Paginación">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activo}
            aria-label={`Ir a la tarjeta ${i + 1}`}
            className={i === activo ? 'landing-carrusel__dot landing-carrusel__dot--activo' : 'landing-carrusel__dot'}
            onClick={() => irA(i)}
          />
        ))}
      </div>
    </>
  )
}

const BENEFICIOS = [
  'Catalogo Integral Unificado',
  'Logística de Entrega Prioritaria',
  'Pedidos Flexibles y Sin Mínimos Exigentes',
  'Seguridad y Garantía Sanitaria 100% Certificada',
  'Línea de Crédito B2B para todo tipo de empresa',
]

const AHORROS = [
  {
    titulo: 'Descuento por Volumen y Escala',
    texto: 'Reduce tu costo por unidad al comprar por empaque cerrado o bulto. Mientras más consolides, mejor es tu margen.',
    link: 'Ver escalas de precio',
    imagen: urls.descuento,
  },
  {
    titulo: 'Financiamiento B2B a 7 Días',
    texto: 'Ahorra en costo de oportunidad: recibe tu inventario hoy, genera ingresos con tus pacientes y paga a los 7 días sin intereses.',
    link: 'Más información sobre el crédito',
    imagen: urls.financiamiento,
  }, 
  {
    titulo: 'Precios Directos de Distribución',
    texto: 'Sin intermediarios. Accede a precios especiales de origen y ofertas semanales en líneas comerciales y hospitalarias seleccionadas.',
    link: 'Ver ofertas del mes',
    imagen: urls.precios,
  },
]

const PASOS = [
  {
    numero: 1,
    titulo: 'Crea tu Cuenta B2B',
    texto: 'Un proceso 100% gratuito y rápido. Vincula tu farmacia, clínica o registro médico para habilitar tus precios preferenciales de distribución.',
    imagen: urls.registrate,
  },
  {
    numero: 2,
    titulo: 'Arma tu Pedido en Tiempo Real',
    texto: 'Explora el catálogo comercial y hospitalario, consulta el inventario disponible al instante y genera tu orden a cualquier hora.',
    imagen: urls.pedidoenlinea,
  },
  {
    numero: 3,
    titulo: 'Recibe y Paga a los 7 Días',
    texto: 'Despachamos de forma prioritaria directo a tu establecimiento para que utilices tu mercancía y gestiones tu pago con tu línea de crédito.',
    imagen: urls.recibe,
  },
]

const TESTIMONIOS = [
  { 
    texto: 'El crédito a 7 días transformó nuestro flujo de caja. Ahora podemos mantener los anaqueles llenos y vender el producto antes de pagar la factura.', 
    autor: 'Dra. Elena R. — Propietaria de Farmacia' 
  },
  { 
    texto: 'Consultar el inventario disponible en tiempo real y hacer pedidos a cualquier hora eliminó las esperas por cotizaciones en WhatsApp. Ganamos semanas de trabajo.', 
    autor: 'Lic. Marcos T. — Administración de Centro Médico' 
  },
  { 
    texto: 'Poder pedir exactamente las ampollas y la insumos que necesito para mis cirugías sin la presión de un volumen mínimo es una ventaja enorme.', 
    autor: 'Dr. Gustavo M. — Cirujano General' 
  },
  { 
    texto: 'Consolidamos nuestras compras en un solo lugar. Conseguimos desde medicamentos de alta rotación hasta la línea hospitalaria, siempre con despacho puntual.', 
    autor: 'Dra. Carmen S. — Directora de Clínica' 
  },
]
const MAS_EXPLORAR = [
  {
    titulo: 'Línea Quirúrgica y Hospitalaria',
    texto: 'Accede a un catálogo especializado en anestesia, fluidoterapia y material médico-quirúrgico para clínicas y centros médicos.',
    imagen: urls.lineahospitalariaa,
  },
  {
    titulo: 'Programa de Crédito B2B',
    texto: 'Obtén financiamiento a 7 días diseñado para respaldar el flujo de caja de pequeñas empresas y médicos independientes.',
    imagen: urls.tratohecho,
  },
  {
    titulo: 'Gestion de Entregas personalizadas',
    texto: 'Atención prioritaria y logística ágil para reposición inmediata de insumos a distintas direcciones de la ciudad',
    imagen: urls.deliverydc,
  },
]

const FAQS = [
  {
    pregunta: '¿Qué requisitos necesito para abrir una cuenta B2B?',
    respuesta: 'Solo necesitas el RIF comercial o profesional, copia de la cédula del representante legal, y el registro o permiso sanitario correspondiente (SACS) para validar tu establecimiento.',
  },
  { 
    pregunta: '¿Cómo puedo consultar precios y disponibilidad de inventario?', 
    respuesta: 'Al iniciar sesión en nuestro portal, tendrás acceso inmediato a precios actualizados en tiempo real y tu pedido sera confirmado con las cantidades disponibles en cuestion de minutos' 
  },
  { 
    pregunta: '¿Cómo funciona el crédito a 7 días y quiénes aplican?', 
    respuesta: 'Es una facilidad otorgada a pequeñas farmacias, clínicas y médicos registrados. Te despachamos el pedido de inmediato y dispones de 7 días continuos para liquidar tu orden' 
  },
  { 
    pregunta: '¿Existe un monto mínimo o volumen exigido para comprar?', 
    respuesta: 'No. Nos adaptamos a tu escala operativa real: puedes solicitar desde unidades o empaques individuales hasta bultos cerrados sin penalizaciones por volumen.' 
  },
  { 
    pregunta: '¿A qué zonas despachan y cuáles son los tiempos de entrega?', 
    respuesta: 'Contamos con cobertura de despacho en Valencia y ciudades aledañas. Los despachos nacionales se envian entre 24 horas a la agencia de envios de su preferencia.' 
  },
]


function FaqItem({ pregunta, respuesta }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div className="landing-faq__item">
      <button
        type="button"
        className="landing-faq__pregunta"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
      >
        <span>{pregunta}</span>
        <ChevronDown size={20} className={abierto ? 'landing-faq__chevron landing-faq__chevron--abierto' : 'landing-faq__chevron'} />
      </button>
      {abierto && respuesta && (
        <div className="landing-faq__respuesta">{respuesta}</div>
      )}
    </div>
  )
}

function Landing() {
  return (
    <div className="landing">

      {/* ================================================================ */}
      {/* 1. HERO                                                          */}
      {/* ================================================================ */}
      <section className="landing-hero">
        <div className="landing-hero__contenido">
                <img src={urls.hero} alt="Hero" className="landing-hero__imagen" />
          
          <div className="landing-hero__texto">
            <h1>Respaldamos al Medico Venezolano</h1>
            <p className="landing-hero__subtitulo">La plataforma digital de abastecimiento farmacéutico y hospitalario para clínicas, farmacias, centros quirúrgicos y especialistas.</p>
            
            <div className="landing-hero__acciones">
              <a href="#" className="landing-link">Más información ›</a>
              <a href="#" className="btn-landing btn-landing--primario">Crear Cuenta   |   Iniciar Sesion</a>
              <a href="#" className="landing-link landing-link--secundario">¿Ya eres cliente?</a>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. BENEFICIOS                                                    */}
      {/* ================================================================ */}
      <section className="landing-beneficios">
        <div className="landing-beneficios__header">
          <h2>Beneficios de Droguería Carrisan</h2>
          <a href="#" className="landing-link">Ver todo +</a>
        </div>
        <ul className="landing-beneficios__lista">
          {BENEFICIOS.map((beneficio) => (
            <li key={beneficio} className="landing-beneficios__chip">
              <Check size={16} className="landing-beneficios__check" />
              {beneficio}
            </li>
          ))}
        </ul>
      </section>

      {/* ================================================================ */}
      {/* 3. MÁS FORMAS DE GASTAR MENOS                                    */}
      {/* ================================================================ */}
      <section className="landing-ahorros">
        <h2>Más formas de optimizar tu presupuesto</h2>
        <p className="landing-ahorros__subtitulo">
          Diseñamos soluciones comerciales que protegen la rentabilidad de tu institución.
        </p>
        <div className="landing-ahorros__grid">
          {AHORROS.map((item) => (
              <div key={item.titulo} className="landing-ahorros__card">
                    <img 
                      src={item.imagen}
                      alt={item.titulo}
                      className="landing-ahorros__card-imagen"
                      loading="lazy"
                    />
              <div className="landing-ahorros__card-content">
          <h3 className="landing-ahorros__card-titulo">{item.titulo}</h3>
          <p className="landing-ahorros__card-texto">{item.texto}</p>
          <a href="#" className="landing-link">{item.link} ›</a>
        </div>
        </div>
          ))}
        </div>
        <a href="#" className="btn-landing btn-landing--outline landing-ahorros__cta">
          Explora nuestros descuentos
        </a>
      </section>

      {/* ================================================================ */}
      {/* ================================================================ */}
      {/* 4. NORMATIVA Y FACTURACIÓN FISCAL                                */}
      {/* ================================================================ */}
      <section className="landing-seguros">
                    <img 
                      src={urls.encargada}
                      alt="Imagen Facturación y Permisos"
                      className="landing-seguros__imagen"
                      loading="lazy"
                    />
        <div className="landing-seguros__texto">
          <h2>Facturación fiscal y respaldo sanitario al día</h2>
          <p>Cumplimiento total de la normativa sanitaria venezolana, emisión de facturación clara adaptada a contribuyentes especiales y trazabilidad documentada en cada lote.</p>
          <a href="#" className="btn-landing btn-landing--primario">Ver condiciones comerciales</a>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. LOGÍSTICA Y DESPACHOS PRIORITARIOS                            */}
      {/* ================================================================ */}
      <section className="landing-envios">
        <div className="landing-envios__texto">
          <h2>Cero interrupciones en tu cadena de suministro</h2>
          <p>Entregamos tus medicamentos e insumos quirúrgicos directamente en la puerta de tu clínica o farmacia, con tiempos de respuesta prioritarios para urgencias médicas.</p>
          <a href="#" className="btn-landing btn-landing--primario">Crear Cuenta B2B</a>
          <a href="#" className="landing-link">¿Necesitas un despacho de emergencia?</a>
        </div>
        <div>
        <div className="landing-envios__media">
                    <img 
                      src={urls.cadena}
                      alt="Imagen Despacho B2B"
                      className="landing-envios__imagen"
                      loading="lazy"
                    />
          
          <div className="landing-envios__notificacion">
            <Check size={16} className="landing-envios__notificacion-icono" />
            <div>
              <strong>Orden en ruta de entrega</strong>
              <span>Hoy a las 09:15 AM — Enviado</span>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 6. GESTIÓN MULTIUSUARIO CORPORATIVA                              */}
      {/* ================================================================ */}
      <section className="landing-ayuda-meds">
                    <img 
                      src={urls.equipomedico}
                      alt="Imagen Gestión Multiusuario"
                      className="landing-ayuda-meds__imagen"
                      loading="lazy"
                    />
        <div className="landing-ayuda-meds__texto">
          <span className="landing-badge">NUEVO B2B</span>
          <h2>Gestión en una sola cuenta para tu equipo</h2>
          <p>Permite que tu farmacéutico regente, jefe de compras o departamento de administración gestionen solicitudes, aprueben órdenes y descarguen facturas desde una misma cuenta corporativa.</p>
          <a href="#" className="btn-landing btn-landing--primario">Configurar cuenta institucional</a>
          <div className="landing-ayuda-meds__nota">
            <HeartHandshake size={22} />
            <div>
              <strong>¿Gestionas una red de farmacias o grupo médico?</strong>
              <p>Consolida el abastecimiento de múltiples sedes con atención personalizada. <a href="#">Hablar con un asesor de cuentas</a>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 7. ESTAMOS AQUÍ PARA AYUDARTE                                    */}
      {/* ================================================================ */}
      <section className="landing-ayudarte">
        <div className="landing-ayudarte__texto">
          <h2>Asesoría técnica y respaldo comercial</h2>
          <p>Nuestro equipo de regentes farmacéuticos y especialistas B2B verifica la calidad y trazabilidad de cada despacho. ¿Necesitas un requerimiento especial para tu quirófano o farmacia? Contáctanos directamente.</p>
          <div className="landing-ayudarte__badges">
            <ImagePlaceholder label="P" className="landing-badge-img" />
            <ImagePlaceholder label="B2B" className="landing-badge-img" />
          </div>
        </div>
                    <img 
                      src={urls.victor}
                      alt="Imagen Atención Farmacéutica B2B"
                      className="landing-ayudarte__imagen"
                      loading="lazy"
                    />
      </section>

      
      {/* ================================================================ */}
      {/* 8. CÓMO FUNCIONA                                                 */}
      {/* ================================================================ */}
      <section className="landing-como-funciona">
        <h2>¿Cómo funciona nuestro portal?</h2>
        <a href="#" className="landing-video-link">
          <span className="landing-video-link__icono"><Play size={16} /></span>
          Conoce la plataforma de Droguería Carrisan en 1 minuto
        </a>
        
        <Carrusel
          items={PASOS}
          claseContenedor="landing-como-funciona__grid"
          claseTarjeta="landing-como-funciona__card"
          renderItem={(paso) => (
            <>
              <img 
                src={paso.imagen}  
                alt={paso.titulo}  
                className="landing-como-funciona__imagen"  
                loading="lazy"
              />
              {/* Agregamos clases específicas para el título y el texto */}
              <h3 className="landing-como-funciona__titulo">{paso.numero}. {paso.titulo}</h3>
              <p className="landing-como-funciona__texto">{paso.texto}</p>
            </>
          )}
        />
  
  <a href="#" className="btn-landing btn-landing--solido">Conocer más sobre el proceso de compra</a>
</section>

      {/* ================================================================ */}
      {/* 9. OPINIONES DE CLIENTES                                         */}
      {/* ================================================================ */}
      <section className="landing-testimonios">
        <h2>Lo que dicen instituciones y médicos que confían en nosotros</h2>
        <Carrusel
          items={TESTIMONIOS}
          claseContenedor="landing-testimonios__grid"
          claseTarjeta="landing-testimonios__card"
          renderItem={(t) => (
            <>
              <div className="landing-testimonios__estrellas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="#12A594" color="#12A594" />
                ))}
              </div>
              <p>“{t.texto}”</p>
              <span>– {t.autor}</span>
            </>
          )}
        />
      </section>

      {/* ================================================================ */}
      {/* 10. MÁS POR EXPLORAR                                             */}
      {/* ================================================================ */}
      <section className="landing-explorar">
        <h2>Más soluciones para tu institución</h2>
        <p className="landing-explorar__subtitulo">Descubre todos los servicios diseñados para potenciar la operatividad de tu centro de salud o farmacia.</p>
        <div className="landing-explorar__grid">
          {MAS_EXPLORAR.map((item) => (
            <div key={item.titulo} className="landing-explorar__card">
              <img 
                src={item.imagen}  
                alt={item.titulo}  
                className="landing-explorar__card-imagen"  
                loading="lazy"
              />
              <div className="landing-explorar__card-texto">
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
                <a href="#" className="landing-link">Saber más ›</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 11. PREGUNTAS FRECUENTES                                         */}
      {/* ================================================================ */}
      <section className="landing-faq">
        <h2>Preguntas frecuentes</h2>
        <div className="landing-faq__lista">
          {FAQS.map((faq) => (
            <FaqItem key={faq.pregunta} {...faq} />
          ))}
        </div>
        <p className="landing-faq__otras">
          ¿Tienes otras dudas sobre aperturas de cuenta o líneas de crédito? Visita nuestro <a href="#">Centro de Ayuda›</a>
        </p>
      </section>

      {/* ================================================================ */}
      {/* 12. CTA FINAL                                                    */}
      {/* ================================================================ */}
      <section className="landing-cta-final">
        <h2>Abastece tu institución con la droguería que te respalda.</h2>
        <a href="#" className="btn-landing btn-landing--primario">Crear Cuenta | Iniciar Sesión</a>
        <a href="#" className="landing-link landing-link--claro">¿Necesitas ayuda para completar tus recaudos?</a>
      </section>

      {/* ================================================================ */}
      {/* 13. FOOTER                                                       */}
      {/* ================================================================ */}
      <footer className="landing-footer">
        <ImagePlaceholder label="Logo" className="landing-footer__logo" />
        <nav className="landing-footer__nav">
          <Link to="/landing">Inicio</Link>
          <a href="#">Cómo funciona</a>
          <a href="#">Formas de ahorrar</a>
          <Link to="/ayuda">Ayuda</Link>
        </nav>
        <div className="landing-footer__badges">
          <ImagePlaceholder label="Badge 1" className="landing-badge-img" />
          <ImagePlaceholder label="Badge 2" className="landing-badge-img" />
        </div>
        <p className="landing-footer__direccion">
          Droguería Carrisán · Dirección pendiente de definir
        </p>
        <div className="landing-footer__links">
          <Link to="/contacto">Ayuda</Link>
          <span>|</span>
          <span>Fax: pendiente</span>
        </div>
        <a href="#" className="landing-link">Droguería Carrisán para profesionales que emiten recetas ›</a>
        <p className="landing-footer__legal">
          Los nombres que aparecen en la fotografía son con fines ilustrativos.
        </p>
      </footer>
    </div>
  )
}

export default Landing
