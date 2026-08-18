import { Link } from 'react-router-dom'
import './Footer.css'

const COLUMNAS = [
  {
    titulo: 'Ayuda',
    enlaces: [
      { texto: 'Centro de ayuda', to: '/ayuda' },
      { texto: 'Cómo comprar', to: '/ayuda#como-comprar' },
      { texto: 'Métodos de pago', to: '/ayuda#pagos' },
      { texto: 'Preguntas frecuentes', to: '/ayuda#faq' },
    ],
  },
  {
    titulo: 'Mi cuenta',
    enlaces: [
      { texto: 'Mis órdenes', to: '/ordenes' },
      { texto: 'Estado de cuenta', to: '/estado-cuenta' },
      { texto: 'Direcciones', to: '/perfil' },
    ],
  },
  {
    titulo: 'Droguería Carrisán',
    enlaces: [
      { texto: 'Sobre nosotros', to: '/nosotros' },
      { texto: 'Catálogo', to: '/catalogo' },
      { texto: 'Contacto', to: '/contacto' },
    ],
  },
]

function Footer() {
  const anioActual = new Date().getFullYear()

  return (
    <footer className="footer">
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

      <div className="footer-base">
        <span>© {anioActual} Droguería Carrisán, C.A. Todos los derechos reservados.</span>
      </div>
    </footer>
  )
}

export default Footer