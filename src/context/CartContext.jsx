import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const guardado = localStorage.getItem('carrito')
    return guardado ? JSON.parse(guardado) : []
  })

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items))
  }, [items])

  function addItem(producto, cantidad = 1) {
    setItems((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      }
      return [...prev, { producto, cantidad }]
    })
  }

  // 🆕 Agrega un producto cotizado: guarda un snapshot del precio y la
  // vigencia en el momento de agregarlo, independiente de la tabla
  // cotizaciones. Cantidad fija en 1 porque estos productos no manejan cantidad.
  function addItemCotizado(producto, cotizacion) {
    setItems((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id)
      const snapshot = {
        cotizacion_id: cotizacion.id,
        precio_unitario: cotizacion.precio_unitario,
        fecha_expiracion: cotizacion.fecha_expiracion,
      }
      if (existente) {
        // Ya estaba (ej. cotización renovada) -> refrescamos el snapshot
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cotizacion: snapshot }
            : item
        )
      }
      return [...prev, { producto, cantidad: 1, cotizacion: snapshot }]
    })
  }

  function removeItem(productoId) {
    setItems((prev) => prev.filter((item) => item.producto.id !== productoId))
  }

  function updateCantidad(productoId, cantidad) {
    if (cantidad <= 0) {
      removeItem(productoId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad } : item
      )
    )
  }

  function clearCart() {
    setItems([])
  }

  // 🆕 Precio efectivo de una línea: el de la cotización si es un ítem
  // cotizado, o el precio normal del producto en caso contrario.
  function precioEfectivo(item) {
    return item.cotizacion ? item.cotizacion.precio_unitario : item.producto.precio_usd
  }

  // 🆕 True si el ítem viene de una cotización y ya pasó su fecha de expiración.
  function esCotizacionVencida(item) {
    if (!item.cotizacion) return false
    return new Date(item.cotizacion.fecha_expiracion) < new Date()
  }

  const total = items.reduce(
    (acc, item) => acc + precioEfectivo(item) * item.cantidad,
    0
  )

  const value = {
    items,
    addItem,
    addItemCotizado,
    removeItem,
    updateCantidad,
    clearCart,
    total,
    precioEfectivo,
    esCotizacionVencida,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}