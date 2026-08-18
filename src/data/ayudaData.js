export const CATEGORIAS_AYUDA = [
  {
    id: 'pedido',
    titulo: 'Pedidos y Catálogo',
    icono: 'pedido',
    items: [
      { label: 'Estado de mi Pedido', slug: 'rastrear', desc: 'Consulta el estatus de preparación y despacho en tiempo real.' },
      { label: 'Modificar u Ordenar de Nuevo', slug: 'editar-repetir', desc: 'Duplica pedidos frecuentes o ajusta items antes del despacho.' },
      { label: 'Líneas Especializadas y MOQ', slug: 'sustituciones', desc: 'Disponibilidad de material hospitalario y fraccionamiento sin mínimos.' },
      { label: 'Inconsistencias o Faltantes', slug: 'faltantes', desc: 'Reporta diferencias entre la factura fiscal y la mercancía recibida.' },
    ],
  },
  {
    id: 'cuenta',
    titulo: 'Cuenta y Verificación',
    icono: 'cuenta',
    items: [
      { label: 'Registro y Carga de RIF / Cédula', slug: 'verificacion', desc: 'Proceso de validación fiscal para activar el botón de compra.' },
      { label: 'Categorías de Cliente y Descuentos', slug: 'etiquetas', desc: 'Cómo se asigna tu tarifa (Mayorista, Institucional o Médico).' },
      { label: 'Gestión de Sedes y Direcciones', slug: 'direcciones', desc: 'Añade múltiples puntos de entrega o sucursales a tu RIF.' },
    ],
  },
  {
    id: 'credito-pagos',
    titulo: 'Crédito y Pagos',
    icono: 'pagos',
    items: [
      { label: 'Línea de Crédito a 7 Días', slug: 'linea-credito', desc: 'Condiciones, límite de crédito aprobado y fechas de corte.' },
      { label: 'Métodos de Pago y Divisas', slug: 'metodos', desc: 'Transferencias en Bs., Pago Móvil, Zelle y depósitos en divisas.' },
      { label: 'Comprobantes de Retención IVA / ISLR', slug: 'facturacion', desc: 'Emisión de comprobantes para Contribuyentes Especiales.' },
    ],
  },
  {
    id: 'logistica',
    titulo: 'Despacho y Entregas',
    icono: 'camion',
    items: [
      { label: 'Zonas de Cobertura y Horarios', slug: 'cobertura', desc: 'Rutas de entrega en Valencia y envíos a nivel nacional.' },
      { label: 'Criterio para Delivery Gratuito', slug: 'delivery-gratis', desc: 'Monto mínimo de orden para exoneración de flete.' },
      { label: 'Recepción y Control Térmico', slug: 'cadena-frio', desc: 'Protocolos de entrega para ampollas y productos refrigerados.' },
    ],
  },
]

export const PREGUNTAS_FRECUENTES = [
  {
    pregunta: '¿Cómo activo mi cuenta para ver mis precios personalizados?',
    respuesta: 'Regístrate adjuntando tu RIF y la cédula del representante legal. Nuestro equipo verificará tu documento en menos de 24 horas y te asignará la etiqueta correspondiente (Mayorista, Institucional o Médico) para desbloquear tus precios y descuentos aplicables.',
  },
  {
    pregunta: '¿Cómo funciona la línea de crédito B2B a 7 días?',
    respuesta: 'Los clientes habituales o validados pueden realizar pedidos con financiamiento. Tienes un plazo de 7 días continuos desde la emisión de la factura para saldar el pago. Si te mantienes al día, conservas tu límite asignado y mantienes activa la opción de compra a crédito en la web.',
  },
  {
    pregunta: '¿Existen mínimos de compra obligatorios (MOQ)?',
    respuesta: 'No imponemos mínimos asfixiantes. Puedes adquirir desde ampollas o cajas individuales para consultorios hasta bultos cerrados para farmacias. Comprar por bulto o de contado otorga porcentajes de descuento adicionales automáticos.',
  },
  {
    pregunta: '¿Cómo gestiono los comprobantes de retención de IVA (SENIAT)?',
    respuesta: 'Si tu empresa es Contribuyente Especial, puedes adjuntar el comprobante de retención junto con el soporte de pago al momento de reportar la factura desde tu panel de "Estado de Cuenta".',
  },
  {
    pregunta: '¿Cuál es el tiempo límite para reportar devoluciones o averías?',
    respuesta: 'Dispones de 48 horas continuas tras la recepción del pedido para notificar productos defectuosos, inconsistencias con la factura o fallas en la cadena de frío. Todo reporte debe hacerse con la factura en mano.',
  },
]

export const PASOS_PEDIDO_B2B = [
  {
    icono: 'catalogo',
    titulo: '1. Selecciona con tu precio personalizado',
    desc: 'Inicia sesión para ver el catálogo con los descuentos de tu etiqueta comercial aplicados.',
  },
  {
    icono: 'carrito',
    titulo: '2. Elige modalidad: Contado o Crédito a 7 días',
    desc: 'Finaliza tu orden seleccionando pronto pago o cargando el monto a tu línea de crédito disponible.',
  },
  {
    icono: 'camion',
    titulo: '3. Recepción y factura fiscal',
    desc: 'Recibe tu mercancía en tu farmacia, clínica u hospital con su respectiva documentación legal.',
  },
]

export const NECESIDADES_B2B = [
  { titulo: 'Catálogo Unificado', desc: 'Medicamentos de alta rotación e insumos hospitalarios.', to: '/catalogo', boton: 'Ver productos' },
  { titulo: 'Estado de Cuenta', desc: 'Controla tu saldo adeudado, crédito a 7 días y facturas.', to: '/estado-cuenta', boton: 'Gestionar crédito' },
  { titulo: 'Línea Hospitalaria', desc: 'Anestesia, ampollas y material descartable quirúrgico.', to: '/hospitalaria', boton: 'Ver línea médica' },
  { titulo: 'Mis Pedidos', desc: 'Sigue el despacho de tus órdenes activas o vuelve a pedir.', to: '/orders', boton: 'Ver historial' },
]

export const ENLACES_UTILES = [
  { label: 'Soporte Directo por Correo', desc: 'Atención prioritaria para clientes registrados.', href: 'mailto:ventas@carrisan.com', externo: true, icono: 'mail' },
  { label: 'Ver Catálogo Completo', desc: 'Explora marcas, éticos y medicamentos comerciales.', to: '/catalogo', icono: 'catalogo' },
  { label: 'Sobre Droguería Carrisan', desc: 'Conoce nuestro modelo de respaldo al sector salud.', to: '/quienes-somos', icono: 'faq' },
]