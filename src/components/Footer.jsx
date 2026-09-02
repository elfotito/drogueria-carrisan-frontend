import { Link } from 'react-router-dom'
import logoBlanco from '../assets/minilogo blanco sin fondo.png'
import './Footer.css'

const COLUMNAS = [
  {
    titulo: 'Ayuda',
    enlaces: [
      { texto: 'Centro de ayuda', to: '/ayuda' },
      { texto: 'Cómo comprar', to: '/ayuda#como-comprar' },
      { texto: 'Preguntas frecuentes', to: '/ayuda#faq' },
      { texto: 'Contacto', to: '/contacto' },
    ],
  },
  {
    titulo: 'Mi cuenta',
    enlaces: [
      { texto: 'Mis órdenes', to: '/orders' },
      { texto: 'Direcciones', to: '/direcciones' },
      { texto: 'Ofertas', to: '/ofertas' },
      { texto: 'Presupuesto', to: '/presupuesto' },
    ],
  },
  {
    titulo: 'Droguería Carrisán',
    enlaces: [
      { texto: 'Quiénes Somos', to: '/quienes-somos' },
      { texto: 'Catálogo', to: '/catalogo' },
      { texto: 'Términos y Condiciones', to: '/terminos' },
      { texto: 'Privacidad', to: '/privacidad' },
    ],
  },
]

const CONTACTO = 'contacto@carrisan.com'

function Footer() {
  const anioActual = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-top">
        {/* Bloque de marca + contacto */}
        <div className="footer-marca">
          <img src={logoBlanco} alt="Droguería Carrisán" className="footer-logo" />
          <p className="footer-tagline">Distribución farmacéutica y hospitalaria</p>
          <ul className="footer-contacto">
            <li>
              <span className="footer-contacto__icon" aria-hidden="true">✉</span>
              <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>
            </li>
          </ul>
        </div>

        {/* Columnas de enlaces */}
        <div className="footer-columnas">
          {COLUMNAS.map((col) => (
            <div key={col.titulo} className="footer-col">
              <h3>{col.titulo}</h3>
              <ul>
                {col.enlaces.map((e) => (
                  <li key={e.texto}>
                    <Link to={e.to}>{e.texto}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Barra legal */}
      <div className="footer-base">
        <span>© {anioActual} Droguería Carrisán, C.A. Todos los derechos reservados.</span>
        <div className="footer-base__links">
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/ayuda">Ayuda</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
