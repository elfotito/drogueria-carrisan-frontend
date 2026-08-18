// src/data/faqData.js
// Preguntas frecuentes B2B — Droguería Carrisan

const faqCategorias = [
  {
    id: 'pedidos',
    titulo: 'Pedidos y Catálogo',
    icono: 'pedido',
    preguntas: [
      {
        pregunta: '¿Cómo realizo un pedido en la plataforma?',
        respuesta: 'Explora el catálogo con tus precios personalizados ya cargados, añade los productos al carrito y selecciona tu modalidad de pago (Contado o Crédito a 7 días). Recibirás confirmación con tu número de orden.',
      },
      {
        pregunta: '¿Existen mínimos de compra obligatorios (MOQ)?',
        respuesta: 'No. Ofrecemos compras flexibles a la medida. Puedes pedir desde unidades fraccionadas para consultorios hasta bultos cerrados para farmacias con descuentos adicionales.',
      },
      {
        pregunta: '¿Puedo editar o cancelar un pedido enviado?',
        respuesta: 'Puedes modificar o cancelar la orden desde "Mis Pedidos" siempre que el estatus se encuentre en "Pendiente de Facturación". Si ya fue despachado, debes contactar a tu asesor.',
      },
      {
        pregunta: '¿Cómo vuelvo a pedir el mismo stock de la semana pasada?',
        respuesta: 'Ingresa a "Mis Pedidos", ubica la orden previa y haz clic en "Repetir Pedido". El sistema cargará los mismos ítems y cantidades al carrito verificando stock en tiempo real.',
      },
    ],
  },
  {
    id: 'envios',
    titulo: 'Despacho y Envíos',
    icono: 'camion',
    preguntas: [
      {
        pregunta: '¿Cuáles son los tiempos de entrega en Valencia y zonas aliadas?',
        respuesta: 'Los despachos en la zona metropolitana se realizan dentro de las 24 a 48 horas hábiles tras la confirmación del pedido.',
      },
      {
        pregunta: '¿Qué hago si la mercancía llega con faltantes o averías?',
        respuesta: 'Dispones de un lapso estricto de 48 horas continuas desde la recepción para reportar inconsistencias o averías adjuntando fotos del embalaje y factura fiscal.',
      },
      {
        pregunta: '¿Cómo garantizan el control térmico de insumos delicados?',
        respuesta: 'Las ampollas y productos de refrigeración se despachan bajo estrictos protocolos de cadena de frío en empaques térmicos inspeccionados previa salida.',
      },
    ],
  },
  {
    id: 'cuenta',
    titulo: 'Cuenta y Verificación',
    icono: 'cuenta',
    preguntas: [
      {
        pregunta: '¿Qué documentos necesito para registrarme y comprar?',
        respuesta: 'Debes completar el formulario de registro adjuntando el RIF digitalizado de la empresa y la cédula del representante legal. Tu cuenta se activará tras la validación fiscal en menos de 24h.',
      },
      {
        pregunta: '¿Por qué no puedo ver mis precios finales antes de registrarme?',
        respuesta: 'Nuestra estructura de tarifas se adapta al tipo de cliente (Mayorista, Institucional o Médico) y a la modalidad de pago para garantizar márgenes competitivos según tu perfil comercial.',
      },
      {
        pregunta: '¿Puedo registrar múltiples direcciones de entrega para un mismo RIF?',
        respuesta: 'Sí, desde el panel "Mi Cuenta" puedes añadir varias sedes o farmacias aliadas asociadas a la misma razón social.',
      },
    ],
  },
  {
    id: 'pagos',
    titulo: 'Crédito y Pagos',
    icono: 'pagos',
    preguntas: [
      {
        pregunta: '¿Cómo funciona la línea de crédito a 7 días?',
        respuesta: 'Una vez aprobada tu línea, puedes facturar pedidos a crédito con un plazo de pago de 7 días continuos. El mantenimiento al día de tus facturas renovará tu saldo disponible de forma automática.',
      },
      {
        pregunta: '¿Qué métodos de pago están habilitados?',
        respuesta: 'Aceptamos transferencias bancarias en bolívares, Pago Móvil corporativo, transferencias en divisas (Zelle/Mercantil Panamá) y depósitos en efectivo en cuenta verde.',
      },
      {
        pregunta: '¿Cómo reporto los comprobantes de retención de IVA (SENIAT)?',
        respuesta: 'Si eres Contribuyente Especial, puedes adjuntar la imagen o PDF de la retención al momento de registrar tu pago en el módulo de "Estado de Cuenta".',
      },
    ],
  },
]

export default faqCategorias