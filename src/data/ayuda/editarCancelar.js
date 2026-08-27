const editarCancelar = {
  etiqueta: 'Tu Pedido',
  etiquetaIcono: 'FileText',
  titulo: 'Editar o cancelar un pedido',
  subtitulo: 'Modifica o cancela tu pedido antes de que sea despachado.',
  tipo: 'secciones',
  contenido: [
    {
      subtitulo: '¿Puedo editar mi pedido?',
      texto: 'Sí, puedes hacer cambios mientras el pedido esté en estado "Pendiente". Una vez que pasa a "En preparación", ya no es posible modificarlo desde la plataforma.',
    },
    {
      subtitulo: '¿Qué puedo cambiar?',
      texto: 'Puedes agregar o quitar productos, modificar cantidades o cancelar el pedido completo. Los cambios se reflejan inmediatamente en tu resumen de orden.',
    },
    {
      subtitulo: '¿Cómo cancelo un pedido?',
      texto: 'Ingresa a "Mis Órdenes", selecciona el pedido y haz clic en "Cancelar". Si el pedido ya fue despachado, contáctanos directamente para coordinar la devolución.',
    },
    {
      subtitulo: '¿Hay penalización por cancelar?',
      texto: 'No. Puedes cancelar sin costo mientras el pedido no haya sido despachado. Si ya está en camino, coordinaremos la devolución contigo.',
    },
  ],
}

export default editarCancelar
