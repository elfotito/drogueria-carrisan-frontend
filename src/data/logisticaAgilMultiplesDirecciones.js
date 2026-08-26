const logisticaAgilInfo = {
  etiqueta: 'Entregas',
  etiquetaIcono: 'Truck',
  titulo: 'Logística ágil para reposición a distintas direcciones',
  subtitulo: 'Despacha a distintas sedes, con seguimiento independiente por cada dirección.',
  tipo: 'secciones',
  // ...resto igual
  contenido: [
    {
      subtitulo: 'Varias direcciones de entrega',
      // TODO: confirmar — hoy el backend maneja una sola direccion_entrega por
      // usuario; si vas a soportar varias, esto describe la funcionalidad futura.
      texto:
        'Puedes despachar pedidos a distintas sedes o sucursales según lo necesites, sin crear una cuenta por cada dirección.',
    },
    {
      subtitulo: 'Rutas optimizadas',
      texto: 'Coordinamos las entregas por zona para reducir tiempos de espera entre sede y sede.',
    },
    {
      subtitulo: 'Seguimiento por pedido',
      texto: 'Cada dirección de entrega queda asociada a su propia orden, con su propio estado y notificaciones.',
    },
  ],
}

export default logisticaAgilInfo
