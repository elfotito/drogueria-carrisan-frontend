// src/data/faqData.js
// Preguntas frecuentes agrupadas por categoría — Droguería Carrisán (B2B farma)

const faqCategorias = [
  {
    id: 'pedidos',
    titulo: 'Pedidos',
    icono: 'pedido',
    preguntas: [
      {
        pregunta: '¿Cómo realizo un pedido?',
        respuesta: 'Navega por el catálogo, agrega los productos que necesitas al carrito y confirma tu orden. Recibirás una notificación con el número de orden y podrás seguir su estado desde "Mis Órdenes".',
      },
      {
        pregunta: '¿Puedo editar o cancelar un pedido ya realizado?',
        respuesta: 'Sí, siempre que la orden no haya sido despachada. Contáctanos por el Centro de Ayuda o a ventas@carrisan.com indicando tu número de orden.',
      },
      {
        pregunta: '¿Qué pasa si un producto no está disponible?',
        respuesta: 'Si algún producto de tu pedido no tiene stock, te contactamos antes de despachar para ofrecerte una sustitución equivalente o ajustar la orden.',
      },
      {
        pregunta: '¿Cómo repito un pedido anterior?',
        respuesta: 'Desde "Mis Órdenes" puedes seleccionar cualquier orden pasada y usar la opción de volver a pedir, que carga los mismos productos al carrito.',
      },
    ],
  },
  {
    id: 'envios',
    titulo: 'Envíos',
    icono: 'camion',
    preguntas: [
      {
        pregunta: '¿Cuáles son los tiempos de entrega?',
        respuesta: 'El despacho se coordina directamente contigo según tu ubicación y la disponibilidad de los productos solicitados. Un asesor confirma la fecha estimada al procesar tu orden.',
      },
      {
        pregunta: '¿Qué hago si mi pedido llegó incompleto o dañado?',
        respuesta: 'Repórtalo dentro de las primeras 48 horas posteriores a la entrega, indicando el número de orden y fotos del producto. Procesamos el cambio o ajuste correspondiente.',
      },
      {
        pregunta: '¿Realizan envíos fuera de la zona habitual?',
        respuesta: 'Coordinamos entregas según cobertura y volumen del pedido. Consulta con tu asesor comercial la disponibilidad para tu ubicación.',
      },
    ],
  },
  {
    id: 'cuenta',
    titulo: 'Tu Cuenta',
    icono: 'cuenta',
    preguntas: [
      {
        pregunta: '¿Cómo me registro en la plataforma?',
        respuesta: 'El registro es gestionado por nuestro equipo comercial. Escríbenos a ventas@carrisan.com y crearemos tu cuenta con los precios correspondientes a tu perfil (mayorista, distribuidor, farmacia, etc.).',
      },
      {
        pregunta: '¿Cómo recupero mi contraseña?',
        respuesta: 'Desde la pantalla de inicio de sesión selecciona "¿Olvidaste tu contraseña?" e ingresa tu RIF o cédula registrada para restablecer el acceso.',
      },
      {
        pregunta: '¿Puedo ver precios personalizados según mi perfil?',
        respuesta: 'Sí. Al iniciar sesión, el catálogo muestra automáticamente los precios correspondientes a tu etiqueta comercial.',
      },
      {
        pregunta: '¿Cómo actualizo mis datos de entrega o facturación?',
        respuesta: 'Desde "Mi Cuenta" puedes editar tu dirección fiscal, dirección de entrega y teléfono de contacto en cualquier momento.',
      },
    ],
  },
  {
    id: 'pagos',
    titulo: 'Pagos',
    icono: 'pagos',
    preguntas: [
      {
        pregunta: '¿Qué métodos de pago aceptan?',
        respuesta: 'Trabajamos con transferencia bancaria y pago móvil. Los datos de pago se envían al confirmar tu orden.',
      },
      {
        pregunta: '¿Cómo consulto mi estado de cuenta o línea de crédito?',
        respuesta: 'En la sección "Estado de Cuenta" puedes ver tus facturas, pagos registrados y el crédito disponible según tu línea asignada.',
      },
      {
        pregunta: '¿Qué hago si mi pago no fue reflejado?',
        respuesta: 'Contáctanos con tu comprobante de pago y número de orden a ventas@carrisan.com y verificamos el estado dentro del mismo día hábil.',
      },
      {
        pregunta: '¿Emiten factura por cada compra?',
        respuesta: 'Sí, cada orden genera un comprobante que puedes descargar desde el detalle de la orden o solicitar por correo.',
      },
    ],
  },
]

export default faqCategorias