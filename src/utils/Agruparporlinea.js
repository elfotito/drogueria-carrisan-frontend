// Agrupa productos activos por su "linea" (categoría) y arma columnas de

export function agruparPorLinea(productos, maxSecciones = 6) {
  const grupos = {}
  for (const p of productos) {
    const linea = p.linea
    if (!linea) continue
    if (!grupos[linea]) grupos[linea] = []
    grupos[linea].push(p)
  }
  return Object.entries(grupos)
    .filter(([, items]) => items.length >= 4)
    .slice(0, maxSecciones)
    .map(([linea, items]) => ({
      id: linea,
      titulo: linea,
      verTodoTo: `/catalogo?categoria=${encodeURIComponent(linea)}`,
      productos: items.slice(0, 4),
    }))
}