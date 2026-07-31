import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  // Estado inicial: leemos del localStorage al arrancar, o array vacío si no hay nada
  const [items, setItems] = useState(() => {
    const guardado = localStorage.getItem('carrito')
    return guardado ? JSON.parse(guardado) : []
  })

  // Cada vez que "items" cambia, lo persistimos
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items))
  }, [items])

  function addItem(producto, cantidad = 1) {
    setItems((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id)

      if (existente) {
        // Ya estaba en el carrito -> sumamos cantidad
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      }

      // No estaba -> lo agregamos como línea nueva
      return [...prev, { producto, cantidad }]
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

  const total = items.reduce(
    (acc, item) => acc + item.producto.precio_usd * item.cantidad,
    0
  )

  const value = { items, addItem, removeItem, updateCantidad, clearCart, total }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}