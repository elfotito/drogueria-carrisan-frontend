// src/data/financiamiento.jsx
//
// Contenido del modal informativo "¿Cómo funciona tu financiamiento?".
// El bloque de ampliación refleja tal cual la lógica real de
// estadocuenta.controller.js (UMBRALES_AMPLIACION + calcularPromedioMensual):
// se compara tu promedio de compra mensual de los últimos 3 meses contra
// tu línea de crédito actual. Si cambias esos umbrales en el backend,
// actualiza también la tabla de abajo para que no queden desincronizados.
//
// Uso:
//   import financiamientoInfo from '../data/financiamiento'
//   <ModalInformativo titulo={financiamientoInfo.titulo} abierto={abierto} onCerrar={cerrar}>
//     <financiamientoInfo.Contenido />
//   </ModalInformativo>

import './contenidoInformativo.css'

function Contenido() {
  return (
    <>
      <section className="contenido-info__seccion">
        <h3>¿Qué es tu línea de crédito?</h3>
        <p>
          Es el monto máximo disponible para hacer pedidos sin pagarlos de inmediato.
          Cada orden a crédito descuenta de esa línea, y el monto se libera
          automáticamente en cuanto verificamos tu pago.
        </p>
      </section>

      <section className="contenido-info__seccion">
        <h3>¿Cómo se calcula tu deuda actual?</h3>
        <p>
          Sumamos todas tus órdenes activas que aún no han sido verificadas como
          pagadas (sin contar las canceladas). Ese es el monto que ves reflejado
          como "Deuda actual" en tu estado de cuenta.
        </p>
      </section>

      <section className="contenido-info__seccion">
        <h3>¿Cómo aumentar tu línea de crédito?</h3>
        <p>
          Calificas para una ampliación automática si tu promedio de compra mensual
          de los últimos 3 meses alcanza cierto porcentaje de tu línea actual:
        </p>
        <table className="contenido-info__tabla">
          <thead>
            <tr>
              <th>Tu promedio mensual es al menos…</th>
              <th>Aumento</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>150% de tu línea actual</td>
              <td>+50%</td>
            </tr>
            <tr>
              <td>100% de tu línea actual</td>
              <td>+30%</td>
            </tr>
            <tr>
              <td>50% de tu línea actual</td>
              <td>+15%</td>
            </tr>
          </tbody>
        </table>
        <p>
          Si calificas, puedes solicitar la ampliación con un clic desde
          "Estado de cuenta" — se aplica al instante, sin esperar aprobación manual.
        </p>
      </section>
    </>
  )
}

const financiamientoInfo = {
  titulo: '¿Cómo funciona tu financiamiento?',
  Contenido,
}

export default financiamientoInfo
