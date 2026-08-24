// src/data/descuentoVolumenEscala.js
const descuentoVolumenEscalaInfo = {
  titulo: 'Descuento por volumen y escala',
  tipo: 'secciones',
  contenido: [
    {
      subtitulo: 'Cómo funciona',
      // TODO: confirmar el mecanismo exacto (¿se aplica automático en el carrito
      // según cantidad, o es por escalas fijas de precio predefinidas?)
      texto:
        'Mientras más grande es tu pedido, mejor es el precio por unidad. El descuento se aplica automáticamente en el carrito según la cantidad que agregues de cada producto.',
    },
    {
      subtitulo: 'Por qué lo hacemos',
      texto:
        'Comprar por volumen nos permite negociar mejores condiciones con los laboratorios y proveedores, y trasladamos ese ahorro directamente a tu precio final.',
    },
    {
      subtitulo: '¿Se combina con tu línea de crédito?',
      texto:
        'Sí. El descuento por volumen aplica igual sin importar si pagas de contado o a crédito.',
    },
  ],
}

export default descuentoVolumenEscalaInfo
