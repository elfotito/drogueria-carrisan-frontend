// src/data/financiamiento.js
//
// El bloque de ampliación refleja tal cual la lógica real de
// estadocuenta.controller.js (UMBRALES_AMPLIACION + calcularComprasTrimestre):
// se compara tu promedio de compra mensual de los últimos 3 meses contra
// tu línea de crédito actual. Si cambias esos umbrales en el backend,
// actualiza también UMBRALES_AMPLIACION y el texto de abajo para que no
// queden desincronizados.

// Copia estructurada de UMBRALES_AMPLIACION del backend — la usa
// AmpliacionEstadoCuenta.jsx para dibujar la barra de progreso de cada nivel.
export const UMBRALES_AMPLIACION = [
  { factor: 1.5, porcentaje: 50 },
  { factor: 1.0, porcentaje: 30 },
  { factor: 0.5, porcentaje: 15 },
]

const financiamientoInfo = {
  etiqueta: 'Crédito',
  etiquetaIcono: 'CreditCard',
  titulo: '¿Cómo funciona tu financiamiento?',
  subtitulo: 'Tu línea de crédito, cómo se calcula tu deuda y cómo puede crecer automáticamente.',
  tipo: 'secciones',
  contenido: [
    {
      subtitulo: '¿Qué es tu línea de crédito?',
      texto: 'Es el monto máximo disponible para hacer pedidos sin pagarlos de inmediato. Cada orden a crédito descuenta de esa línea, y el monto se libera automáticamente en cuanto verificamos tu pago.',
    },
    {
      subtitulo: '¿Cómo se calcula tu deuda actual?',
      texto: 'Sumamos todas tus órdenes activas que aún no han sido verificadas como pagadas (sin contar las canceladas). Ese es el monto que ves reflejado como "Deuda actual" en tu estado de cuenta.',
    },
    {
      subtitulo: '¿Cómo aumentar tu línea de crédito?',
      texto: 'Calificas para una ampliación automática según tu promedio de compra mensual de los últimos 3 meses: si alcanza el 150% de tu línea actual, tu línea sube un 50%; si alcanza el 100%, sube un 30%; y si alcanza el 50%, sube un 15%. Si calificas, puedes solicitar la ampliación con un clic desde "Estado de cuenta" — se aplica al instante, sin esperar aprobación manual.',
    },
  ],
}

export default financiamientoInfo