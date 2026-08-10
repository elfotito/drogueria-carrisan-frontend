import { useState } from 'react'
import { Link } from 'react-router-dom'
import preguntasFrecuentes from '../data/faqData'
import './Faq.css'

function Faq() {
  const [abierta, setAbierta] = useState(null)

  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1 className="faq-titulo">Preguntas Frecuentes</h1>
        <p className="faq-subtitulo">
          Respuestas rápidas sobre pedidos, pagos y tu cuenta.
        </p>

        <div className="faq-list">
          {preguntasFrecuentes.map((item, index) => (
            <div key={index} className="faq-item">
              <button
                type="button"
                className="faq-item__pregunta"
                onClick={() => setAbierta(abierta === index ? null : index)}
                aria-expanded={abierta === index}
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

        <p className="faq-footer">
          ¿No encontraste tu respuesta?{' '}
          <Link to="/ayuda">Visita el Centro de Ayuda</Link> o{' '}
          <a href="mailto:ventas@carrisan.com">escríbenos</a>.
        </p>
      </div>
    </div>
  )
}

export default Faq