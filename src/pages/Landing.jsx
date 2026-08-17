import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Check, ChevronDown, Play, Star, HeartHandshake,
} from 'lucide-react'
import './Landing.css'

// Dependencia: npm install lucide-react (ya usada en el resto del proyecto)

// ---------------------------------------------------------------------
// TODO: reemplazar cada <ImagePlaceholder /> por la imagen real cuando
// esté lista, y cada href="#" por el enlace/acción definitivos.
// Se dejó el texto exacto de las capturas de referencia como base;
// ajústalo libremente sin romper la estructura de cada sección.
// ---------------------------------------------------------------------

function ImagePlaceholder({ label, className = '' }) {
  return (
    <div className={`landing-img-placeholder ${className}`}>
      <span>{label}</span>
    </div>
  )
}

// Carrusel con paginado de circulitos — en móvil es scroll horizontal con
// snap (cada tarjeta ocupa el ancho visible); en desktop, .landing.css
// convierte el mismo contenedor en un grid y oculta los dots.
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
  'Linea de Credito personalizada',
  'Abastecimiento a tu Medida',
  'Entregas gratis y rápidas',
  'Soluciones de Suministro Médico',
  'Farmacéuticos con licencia',
]

const AHORROS = [
  {
    titulo: 'Ahorros Prime',
    texto: 'Ahorra hasta el 80%* con descuentos exclusivos para miembros Prime.',
    link: 'Más información sobre ahorros Prime',
  },
  {
    titulo: 'RxPass',
    texto: 'Los miembros Prime obtienen todos los medicamentos elegibles que tomen por una suscripción de $5 al mes.**',
    link: 'Más información sobre RxPass',
  },
  {
    titulo: 'Cupones',
    texto: 'Aplicamos automáticamente los cupones del fabricante elegibles al proceder al pago.',
    link: 'Más información sobre cupones',
  },
]

const PASOS = [
  {
    numero: 1,
    titulo: 'Sign up for Amazon Pharmacy',
    texto: 'It’s simple. And free, always. Sign in or sign up to get started.',
  },
  {
    numero: 2,
    titulo: 'We’ll get your prescription',
    texto: 'We can work with your insurance and current pharmacy to get your prescription.',
  },
  {
    numero: 3,
    titulo: 'Get your meds delivered',
    texto: 'Have a question? Our pharmacists are available 24/7.',
  },
]

const TESTIMONIOS = [
  { texto: 'Menos viajes a la farmacia y un servicio más confiable que el que recibía en la farmacia de antes', autor: 'Anita F.' },
  { texto: 'Comprar en Amazon es muy sencillo. No tengo que esperar en la cola y cuando hago el pedido llega a mi puerta.', autor: 'Louis D.' },
  { texto: 'Ya no tengo que acudir a la consulta de mi médico para resurtir mis medicamentos. Amazon Pharmacy se encarga de todo.', autor: 'Meredith M.' },
  { texto: 'Es muy fácil comprar mis medicamentos con receta y luego recibirlos rápidamente en mi domicilio.', autor: 'Kathleen F.' },
]

const MAS_EXPLORAR = [
  {
    titulo: 'One Medical membership',
    texto: 'Get on-demand medical care for $9/mo with Prime, or book a visit at our 200+ offices.',
  },
  {
    titulo: 'One Medical Pay-per-visit',
    texto: 'No-commitment telehealth, as low as $29 per visit.',
  },
]

const FAQS = [
  {
    pregunta: '¿Aceptan mi seguro?',
    respuesta: 'Amazon Pharmacy acepta la mayoría de los planes de seguro. A continuación, indicamos cómo verificar la cobertura de seguro para tu plan específico.',
  },
  { pregunta: '¿Cómo puedo verificar el precio de mi medicamento?', respuesta: '' },
  { pregunta: '¿Cómo transfiero o agrego una receta?', respuesta: '' },
  { pregunta: '¿Qué información necesito proporcionar al profesional que emite mis recetas?', respuesta: '' },
  { pregunta: '¿Dónde entrega y qué tan rápido?', respuesta: '' },
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
          <ImagePlaceholder label="Imagen hero" className="landing-hero__imagen" />
          
          <div className="landing-hero__texto">
            <h1>Abastecimiento a tu Medida</h1>
            <p className="landing-hero__subtitulo">Plataforma B2B para Clinicas, Farmacias y Medicos</p>
            
            <div className="landing-hero__acciones">
              <a href="#" className="landing-link">Más información ›</a>
              <a href="#" className="btn-landing btn-landing--primario">Crear Cuenta | Iniciar Sesion</a>
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
          <h2>Beneficios de Droguería Carrisán</h2>
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
        <h2>Más formas de gastar menos</h2>
        <p className="landing-ahorros__subtitulo">
          Desde cupones hasta ahorros para miembros Prime, trabajamos duro para encontrar precios bajos para ti.
        </p>
        <div className="landing-ahorros__grid">
          {AHORROS.map((item) => (
            <div key={item.titulo} className="landing-ahorros__card">
              <ImagePlaceholder label="Imagen" className="landing-ahorros__card-imagen" />
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
              <a href="#" className="landing-link">{item.link} ›</a>
            </div>
          ))}
        </div>
        <a href="#" className="btn-landing btn-landing--outline landing-ahorros__cta">
          Explore all the ways to save
        </a>
      </section>

      {/* ================================================================ */}
      {/* 4. SEGUROS                                                       */}
      {/* ================================================================ */}
      <section className="landing-seguros">
        <ImagePlaceholder label="Imagen seguros" className="landing-seguros__imagen" />
        <div className="landing-seguros__texto">
          <h2>Se aceptan la mayoría de planes de seguros</h2>
          <p>Calculamos tu copago de forma automática para que nunca tengas que preguntarte qué cobertura tienes.</p>
          <a href="#" className="btn-landing btn-landing--primario">Check if we accept your insurance</a>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. DESPÍDETE DE LAS FILAS                                        */}
      {/* ================================================================ */}
      <section className="landing-envios">
        <div className="landing-envios__media">
          <ImagePlaceholder label="Imagen envío" className="landing-envios__imagen" />
          <div className="landing-envios__notificacion">
            <Check size={16} className="landing-envios__notificacion-icono" />
            <div>
              <strong>Paquete enviado</strong>
              <span>Ayer a las 12:44 AM, Austin, TX</span>
            </div>
          </div>
        </div>
        <div className="landing-envios__texto">
          <h2>Despídete de las filas en la farmacia</h2>
          <p>Entregamos tus medicamentos directamente en tu puerta, con actualizaciones sobre el estado del envío.</p>
          <a href="#" className="btn-landing btn-landing--primario">Sign up | Sign in</a>
          <a href="#" className="landing-link">¿Ya nos enviaste una receta?</a>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 6. AYUDA CON MEDICAMENTOS                                        */}
      {/* ================================================================ */}
      <section className="landing-ayuda-meds">
        <ImagePlaceholder label="Imagen ayuda" className="landing-ayuda-meds__imagen" />
        <div className="landing-ayuda-meds__texto">
          <span className="landing-badge">NUEVO</span>
          <h2>Obtén ayuda con tus medicamentos</h2>
          <p>Deja que alguien de tu confianza administre tus recetas, configure los resurtidos y mantenga actualizada tu información de salud.</p>
          <a href="#" className="btn-landing btn-landing--primario">Invite someone to help with your meds</a>
          <div className="landing-ayuda-meds__nota">
            <HeartHandshake size={22} />
            <div>
              <strong>¿Quieres ayudar a otro adulto?</strong>
              <p>Pídele que te invite desde su configuración de cuenta. <a href="#">Consulta las preguntas frecuentes</a>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 7. ESTAMOS AQUÍ PARA AYUDARTE                                    */}
      {/* ================================================================ */}
      <section className="landing-ayudarte">
        <div className="landing-ayudarte__texto">
          <h2>Estamos aquí para ayudarte</h2>
          <p>Nuestros profesionales de farmacia autorizados revisan cada pedido antes del envío. ¿Quieres preguntarles algo? Comunícate en cualquier momento, de día o de noche.</p>
          <div className="landing-ayudarte__badges">
            <ImagePlaceholder label="Badge 1" className="landing-badge-img" />
            <ImagePlaceholder label="Badge 2" className="landing-badge-img" />
          </div>
        </div>
        <ImagePlaceholder label="Imagen farmacéutica" className="landing-ayudarte__imagen" />
      </section>

      {/* ================================================================ */}
      {/* 8. HOW IT WORKS                                                  */}
      {/* ================================================================ */}
      <section className="landing-como-funciona">
        <h2>How it works</h2>
        <a href="#" className="landing-video-link">
          <span className="landing-video-link__icono"><Play size={16} /></span>
          Discover Amazon Pharmacy (0:47)
        </a>
        <Carrusel
          items={PASOS}
          claseContenedor="landing-como-funciona__grid"
          claseTarjeta="landing-como-funciona__card"
          renderItem={(paso) => (
            <>
              <ImagePlaceholder label={`Paso ${paso.numero}`} className="landing-como-funciona__card-imagen" />
              <h3>{paso.numero}. {paso.titulo}</h3>
              <p>{paso.texto}</p>
            </>
          )}
        />
        <a href="#" className="btn-landing btn-landing--solido">Learn more about how it works</a>
      </section>

      {/* ================================================================ */}
      {/* 9. OPINIONES DE CLIENTES                                         */}
      {/* ================================================================ */}
      <section className="landing-testimonios">
        <h2>Las opiniones de los clientes</h2>
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
              <span>– {t.autor}, cliente de Droguería Carrisán</span>
            </>
          )}
        />
      </section>

      {/* ================================================================ */}
      {/* 10. MORE TO EXPLORE                                              */}
      {/* ================================================================ */}
      <section className="landing-explorar">
        <h2>More to explore</h2>
        <p className="landing-explorar__subtitulo">Discover other ways Droguería Carrisán can help you stay healthy.</p>
        <div className="landing-explorar__grid">
          {MAS_EXPLORAR.map((item) => (
            <div key={item.titulo} className="landing-explorar__card">
              <ImagePlaceholder label="Imagen" className="landing-explorar__card-imagen" />
              <div className="landing-explorar__card-texto">
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
                <a href="#" className="landing-link">Learn more ›</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 11. FAQ                                                          */}
      {/* ================================================================ */}
      <section className="landing-faq">
        <h2>Tal vez te preguntes</h2>
        <div className="landing-faq__lista">
          {FAQS.map((faq) => (
            <FaqItem key={faq.pregunta} {...faq} />
          ))}
        </div>
        <p className="landing-faq__otras">
          Other questions? Visit our <a href="#">Help Center ›</a>
        </p>
      </section>

      {/* ================================================================ */}
      {/* 12. CTA FINAL                                                    */}
      {/* ================================================================ */}
      <section className="landing-cta-final">
        <h2>Entregamos tu medicamento.</h2>
        <a href="#" className="btn-landing btn-landing--primario">Sign up | Sign in</a>
        <a href="#" className="landing-link landing-link--claro">¿Ya nos enviaste una receta?</a>
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
