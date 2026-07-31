import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import CartSummary from '../components/CartSummary'

function Carrito() {
  const { items, clearCart } = useCart()
  const [tasaVes, setTasaVes] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/prices').then((res) => setTasaVes(res.data.usd_a_ves))
  }, [])

  async function handleConfirmar() {
    setError('')
    setEnviando(true)

    try {
      const payload = {
        items: items.map((item) => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
        })),
      }
      await api.post('/orders', payload)
      clearCart()
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al confirmar la orden')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <h1>Carrito</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <CartSummary tasaVes={tasaVes} />

      {items.length > 0 && (
        <button onClick={handleConfirmar} disabled={enviando}>
          {enviando ? 'Confirmando...' : 'Confirmar orden'}
        </button>
      )}
    </div>
  )
}

export default Carrito