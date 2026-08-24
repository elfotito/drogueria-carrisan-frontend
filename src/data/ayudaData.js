// src/data/ayudaData.js
//
// Contenido de cada modal de ayuda. La clave es "categoriaId/slug", igual al
// slug que ya usa cada item dentro de `categorias` en Ayuda.jsx.
//
// Estructura de cada entrada:
//   imagen  -> URL del arte corporativo (hero del modal). Déjalo en '' hasta
//              que tengas la imagen; el modal muestra un placeholder mientras tanto.
//   titulo  -> Nombre de la sección (h1)
//   bloques -> Array de { categoria, texto, imagen? } -> cada uno es un h2 + texto
//              explicativo, en el orden en que se renderizan. `imagen` es opcional,
//              por si algún bloque necesita su propia imagen aparte del hero.

const ayudaData = {
  // ---------------------------------------------------------------
  // Tu Pedido
  // ---------------------------------------------------------------
  'pedido/rastrear': {
    imagen: '',
    titulo: 'Da seguimiento a tu pedido',
    bloques: [
      {
        categoria: 'Cuando creas tu pedido',
        texto:
          'Una vez que confirmas tu orden desde el carrito, puedes revisar su estado en todo momento desde la sección "Mis Órdenes". Ahí verás el número de orden, los productos, el total y la fecha en que la creaste.',
      },
      {
        categoria: 'Los 5 estados de tu pedido',
        texto:
          'Cada estado representa en qué parte del proceso está tu orden: Pendiente (la recibimos y está en revisión), Confirmado (verificamos disponibilidad y precio), Preparando (estamos alistando tus productos), Enviado (tu pedido va en camino) y Entregado (tu pedido llegó a su destino).',
      },
      {
        categoria: 'Te avisamos en cada cambio',
        texto:
          'Cada vez que tu pedido cambia de estado te enviamos una notificación dentro de la plataforma, visible en la campana de notificaciones, para que estés al tanto sin tener que revisar manualmente.',
      },
    ],
  },

  'pedido/editar-cancelar': {
    imagen: '',
    titulo: 'Edita o cancela un pedido',
    bloques: [
      {
        categoria: '¿Hasta cuándo puedo hacer cambios?',
        texto:
          'Puedes solicitar cambios o la cancelación de tu pedido mientras su estado sea Pendiente o Confirmado. Una vez que entra en preparación, ya no es posible modificarlo desde la plataforma.',
      },
      {
        categoria: '¿Cómo lo solicito?',
        texto:
          'Escríbenos por el chat de esa orden o contáctanos por correo indicando el número de pedido y el cambio que necesitas. Nuestro equipo confirma el ajuste antes de continuar con el despacho.',
      },
    ],
  },

  'pedido/sustituciones': {
    imagen: '',
    titulo: 'Sustituciones de productos',
    bloques: [
      {
        categoria: '¿Cuándo se sustituye un producto?',
        texto:
          'Si un producto de tu pedido se agota entre el momento en que lo agregaste al carrito y la preparación de la orden, nuestro equipo te contacta antes de despachar para ofrecerte una alternativa equivalente.',
      },
      {
        categoria: 'Tú decides',
        texto:
          'Ninguna sustitución se aplica sin tu aprobación. Si no aceptas la alternativa propuesta, simplemente retiramos ese producto de tu orden y ajustamos el total.',
      },
    ],
  },

  'pedido/cancelados': {
    imagen: '',
    titulo: 'Pedidos cancelados',
    bloques: [
      {
        categoria: 'Motivos comunes',
        texto:
          'Un pedido puede cancelarse por falta de disponibilidad de los productos, por datos de entrega incompletos, o porque el cliente lo solicitó directamente antes de que entrara en preparación.',
      },
      {
        categoria: '¿Y mi línea de crédito?',
        texto:
          'Si tu pedido se cancela, el monto reservado en tu línea de crédito se libera automáticamente y queda disponible de inmediato para nuevas órdenes.',
      },
    ],
  },

  'pedido/retrasados': {
    imagen: '',
    titulo: 'Pedidos retrasados',
    bloques: [
      {
        categoria: '¿Qué hacer si tu pedido no llegó a tiempo?',
        texto:
          'Escríbenos desde el chat de esa orden con tu número de pedido. Revisamos el estado con el equipo de despacho y te damos un tiempo estimado actualizado.',
      },
      {
        categoria: 'Causas frecuentes',
        texto:
          'Los retrasos suelen deberse a alta demanda, disponibilidad de transporte o coordinación de la dirección de entrega. Siempre te mantenemos informado por notificaciones.',
      },
    ],
  },

  'pedido/faltantes': {
    imagen: '',
    titulo: 'Artículos faltantes',
    bloques: [
      {
        categoria: '¿Llegó tu pedido incompleto?',
        texto:
          'Verifica primero el detalle de tu orden en "Mis Órdenes": ahí puedes confirmar qué productos fueron despachados. Si algo aprobado no llegó físicamente, repórtalo dentro de las 48 horas siguientes a la entrega.',
      },
      {
        categoria: '¿Cómo reportarlo?',
        texto:
          'Usa el chat de esa orden indicando el o los productos faltantes. Verificamos con despacho y coordinamos el reenvío o el ajuste correspondiente en tu factura.',
      },
    ],
  },

  'pedido/no-recibido': {
    imagen: '',
    titulo: 'Pedido no recibido',
    bloques: [
      {
        categoria: 'Si tu pedido nunca llegó',
        texto:
          'Contáctanos de inmediato por el chat de esa orden o por correo con tu número de pedido. Revisamos el estado de despacho y coordinamos la solución más rápida, ya sea un reenvío o el ajuste en tu cuenta.',
      },
    ],
  },

  'pedido/volver-a-pedir': {
    imagen: '',
    titulo: 'Volver a pedir',
    bloques: [
      {
        categoria: 'Repite un pedido en segundos',
        texto:
          'Desde "Mis Órdenes", abre cualquier pedido anterior y usa la opción de volver a pedir para enviar esos mismos productos al carrito, con tus precios y disponibilidad actualizados.',
      },
    ],
  },

  // ---------------------------------------------------------------
  // Tu Cuenta
  // ---------------------------------------------------------------
  'cuenta/crear-editar': {
    imagen: '',
    titulo: 'Crea o edita tu cuenta',
    bloques: [
      {
        categoria: 'Creación de cuenta',
        texto:
          'El registro es gestionado por nuestro equipo comercial. Escríbenos a ventas@carrisan.com y creamos tu cuenta con los precios correspondientes a tu perfil (mayorista, distribuidor, clínica, farmacia, etc.).',
      },
      {
        categoria: 'Editar tus datos',
        texto:
          'Desde "Datos de la cuenta" puedes actualizar tu información de contacto y de entrega. Si necesitas cambiar tu RIF o razón social, contáctanos directamente para verificarlo.',
      },
      {
        categoria: 'Sub-usuarios de tu cuenta',
        texto:
          'Si varias personas de tu clínica o farmacia hacen pedidos, puedes crear sub-usuarios con un PIN propio desde "Datos de la cuenta", para identificar quién generó cada orden sin necesidad de cuentas separadas.',
      },
    ],
  },

  'cuenta/recuperar-contrasena': {
    imagen: '',
    titulo: 'Recupera tu contraseña',
    bloques: [
      {
        categoria: '¿Olvidaste tu contraseña?',
        texto:
          'En la pantalla de inicio de sesión selecciona "¿Olvidaste tu contraseña?" e ingresa tu RIF o cédula registrada. Te enviaremos las instrucciones para restablecerla.',
      },
      {
        categoria: '¿No te llega el correo?',
        texto:
          'Revisa tu carpeta de spam o promociones. Si el problema persiste, escríbenos a ventas@carrisan.com y verificamos tu cuenta manualmente.',
      },
    ],
  },

  'cuenta/estado-de-cuenta': {
    imagen: '',
    titulo: 'Estado de cuenta y línea de crédito',
    bloques: [
      {
        categoria: '¿Qué es tu línea de crédito?',
        texto:
          'Es el monto disponible para hacer pedidos a crédito. Cada orden a crédito descuenta de esa línea, y se libera nuevamente cuando el pago es reportado y verificado.',
      },
      {
        categoria: 'Facturas y pagos',
        texto:
          'En "Estado de cuenta" puedes ver tus órdenes pendientes, reportar un pago y descargar tus facturas, cada una con la tasa de cambio congelada del momento en que se generó.',
      },
      {
        categoria: '¿Necesitas más línea de crédito?',
        texto:
          'Si tu historial de compra lo respalda, puedes solicitar una ampliación de tu línea de crédito directamente desde "Estado de cuenta".',
      },
    ],
  },

  // ---------------------------------------------------------------
  // Pagos
  // ---------------------------------------------------------------
  'pagos/metodos': {
    imagen: '',
    titulo: 'Métodos de pago aceptados',
    bloques: [
      {
        categoria: 'Transferencia y pago móvil',
        texto:
          'Aceptamos transferencia bancaria y pago móvil. Los datos de pago se envían junto con la confirmación de tu orden, y una vez que pagas, reportas el pago desde la plataforma.',
      },
      {
        categoria: 'Compra a crédito',
        texto:
          'Si tu cuenta tiene línea de crédito activa, puedes generar tu pedido sin pagar de inmediato; el monto se descuenta de tu línea hasta que se procese el pago correspondiente.',
      },
    ],
  },

  'pagos/facturas': {
    imagen: '',
    titulo: 'Comprobantes y facturas',
    bloques: [
      {
        categoria: '¿Cuándo se genera tu factura?',
        texto:
          'La factura se genera automáticamente cuando verificamos tu reporte de pago. Incluye las órdenes cubiertas, la tasa de cambio usada y el monto en dólares.',
      },
      {
        categoria: '¿Dónde la encuentro?',
        texto:
          'Puedes consultarla y descargarla desde "Estado de cuenta", en la sección de facturas. También puedes solicitar la entrega física si la necesitas.',
      },
    ],
  },

  'pagos/problemas': {
    imagen: '',
    titulo: 'Problemas con un pago',
    bloques: [
      {
        categoria: 'Reportaste tu pago y no se refleja',
        texto:
          'Los pagos reportados quedan en estado "pendiente de verificación" hasta que nuestro equipo confirma el ingreso. Este proceso puede tomar hasta un día hábil.',
      },
      {
        categoria: '¿Cómo lo resolvemos?',
        texto:
          'Si pasado ese tiempo tu pago sigue sin verificarse, escríbenos por el chat o a ventas@carrisan.com con el comprobante y el número de orden asociado.',
      },
    ],
  },
}

export default ayudaData
