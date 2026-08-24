// src/data/beneficios.jsx
//
// Contenido del modal informativo de "Beneficios". Uso:
//
//   import beneficiosInfo from '../data/beneficios'
//   import ModalInformativo from '../components/ModalInformativo'
//
//   <ModalInformativo titulo={beneficiosInfo.titulo} abierto={abierto} onCerrar={cerrar}>
//     <beneficiosInfo.Contenido />
//   </ModalInformativo>

import { CreditCard, TrendingUp, Truck, Bell, FileText, MessageCircle } from 'lucide-react'
import './contenidoInformativo.css'

const ITEMS = [
  {
    icono: <CreditCard size={18} />,
    titulo: 'Línea de crédito propia',
    texto: 'Compra a crédito hasta tu límite disponible, sin pagar de inmediato. El monto se libera automáticamente en cuanto verificamos tu pago.',
  },
  {
    icono: <TrendingUp size={18} />,
    titulo: 'Ampliación automática',
    texto: 'Si tu historial de compra lo respalda, puedes solicitar un aumento de tu línea de crédito directamente desde "Estado de cuenta", sin trámites adicionales.',
  },
  {
    icono: <Truck size={18} />,
    titulo: 'Delivery gratis', // TODO: confirmar condición exacta (¿todas las cuentas o solo algunas?)
    texto: 'Clientes que califican reciben despacho sin costo adicional en sus pedidos.',
  },
  {
    icono: <Bell size={18} />,
    titulo: 'Seguimiento en tiempo real',
    texto: 'Te notificamos dentro de la plataforma cada vez que tu pedido cambia de estado, desde que lo confirmas hasta que llega a tu puerta.',
  },
  {
    icono: <FileText size={18} />,
    titulo: 'Facturas y estado de cuenta claros',
    texto: 'Consulta y descarga tus facturas y comprobantes de pago cuando quieras, con tu historial completo de movimientos.',
  },
  {
    icono: <MessageCircle size={18} />,
    titulo: 'Atención directa por orden',
    texto: 'Cada orden tiene su propio canal de contacto para resolver dudas, reportar novedades o hacer seguimiento puntual.',
  },
]

function Contenido() {
  return (
    <ul className="contenido-info__lista">
      {ITEMS.map((item, i) => (
        <li key={i} className="contenido-info__item">
          <span className="contenido-info__icono">{item.icono}</span>
          <div>
            <strong>{item.titulo}</strong>
            <p>{item.texto}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

const beneficiosInfo = {
  titulo: 'Beneficios de tu cuenta',
  Contenido,
}

export default beneficiosInfo
