import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function MiCuenta() {
  const { user } = useAuth()
  const [estadoCuenta, setEstadoCuenta] = useState(null)
  const [ultimasOrdenes, setUltimasOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      // Traer estado de cuenta
      const { data: dataCuenta } = await api.get(`/clientes/${user.id}/estado-cuenta`)
      setEstadoCuenta(dataCuenta)

      // Traer últimas 5 órdenes
      const { data: dataOrdenes } = await api.get('/orders')
      setUltimasOrdenes(dataOrdenes.slice(0, 5))
    } catch (err) {
      setError('No se pudieron cargar los datos de tu cuenta')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) return <p>Cargando...</p>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1>Mi Cuenta</h1>
      <p style={{ color: '#666' }}>Bienvenido, {user.nombre || user.email}</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Tarjetas de resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '30px' }}>
        
        <div style={cardStyle}>
          <h3>📦 Órdenes</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
            {estadoCuenta?.resumen?.total_facturado ? 'Activo' : 'Sin datos'}
          </p>
          <Link to="/ordenes">Ver mis órdenes →</Link>
        </div>

        <div style={cardStyle}>
          <h3>💰 Línea de crédito</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
            ${estadoCuenta?.cliente?.linea_credito?.toFixed(2) || '0.00'}
          </p>
          <span style={{ color: '#666' }}>Crédito disponible</span>
        </div>

        <div style={cardStyle}>
          <h3>📊 Deuda actual</h3>
          <p style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '10px 0',
            color: estadoCuenta?.resumen?.deuda_actual > 0 ? '#d32f2f' : '#2e7d32'
          }}>
            ${estadoCuenta?.resumen?.deuda_actual?.toFixed(2) || '0.00'}
          </p>
          <Link to={`/estado-cuenta`}>Ver estado de cuenta →</Link>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div style={{ marginTop: '40px' }}>
        <h2>Accesos rápidos</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
          <Link to="/cart" style={linkButtonStyle}>🛒 Ir al carrito</Link>
          <Link to="/ordenes" style={linkButtonStyle}>📋 Mis órdenes</Link>
          <Link to="/mis-items" style={linkButtonStyle}>📦 Mis Items</Link>
        </div>
      </div>

      {/* Últimas órdenes */}
      <div style={{ marginTop: '40px' }}>
        <h2>Últimas órdenes</h2>
        {ultimasOrdenes.length === 0 ? (
          <p>Aún no tienes órdenes</p>
        ) : (
          <table style={{ width: '100%', marginTop: '15px' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ultimasOrdenes.map(orden => (
                <tr key={orden.id}>
                  <td>#{orden.id}</td>
                  <td>${Number(orden.total_usd).toFixed(2)}</td>
                  <td>{orden.estado}</td>
                  <td>{new Date(orden.created_at).toLocaleDateString('es-VE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  textAlign: 'center'
}

const linkButtonStyle = {
  padding: '10px 20px',
  background: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#333'
}

export default MiCuenta