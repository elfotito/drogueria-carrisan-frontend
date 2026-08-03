import { useState } from 'react'

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

function FAQ() {
  const [abierta, setAbierta] = useState(null)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Preguntas Frecuentes</h1>

      <div style={{ marginTop: '30px' }}>
        {preguntas.map((item, index) => (
          <div key={index} style={{ marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <button
              onClick={() => setAbierta(abierta === index ? null : index)}
              style={{
                width: '100%',
                padding: '15px',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {abierta === index ? '▼' : '▶'} {item.pregunta}
            </button>
            
            {abierta === index && (
              <div style={{ padding: '0 15px 15px 30px' }}>
                <p>{item.respuesta}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQ