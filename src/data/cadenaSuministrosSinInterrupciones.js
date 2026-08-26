// src/data/cadenaSuministroSinInterrupciones.js
const cadenaSuministroInfo = {
  etiqueta: 'Logística',
  etiquetaIcono: 'Boxes',
  titulo: 'Cadena de suministro con 0 interrupciones',
  subtitulo: 'Inventario real, múltiples proveedores y reposición anticipada para que nunca te quedes sin stock.',
  tipo: 'secciones',
  contenido: [
    {
      subtitulo: 'Inventario en tiempo real',
      texto:
        'Solo ves disponible lo que realmente tenemos en stock, para que no generes un pedido que después no podamos cumplir.',
    },
    {
      subtitulo: 'Múltiples proveedores por línea',
      texto:
        'Trabajamos con más de un proveedor por categoría de producto, para no depender de una sola fuente ante cualquier eventualidad.',
    },
    {
      subtitulo: 'Reposición anticipada',
      // TODO: confirmar el mecanismo real de reposición/alertas de stock
      texto:
        'Monitoreamos activamente los productos de mayor rotación para reponerlos antes de que se agoten.',
    },
  ],
}

export default cadenaSuministroInfo
