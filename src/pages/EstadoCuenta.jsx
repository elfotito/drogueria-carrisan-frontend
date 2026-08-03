import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function EstadoCuenta() {
  const { user } = useAuth()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todos') // 'todos', 'facturas', 'pagos'

  useEffect(() => {
    cargarEstadoCuenta()
  }, [])

  async function cargarEstadoCuenta() {
    try {
      const { data } = await api.get(`/clientes/${user.id}/estado-cuenta`)
      setDatos(data)
    } catch (err) {
      setError('No se pudo cargar el estado de cuenta')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) return <p>Cargando estado de cuenta...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!datos) return <p>No hay datos disponibles</p>

  const { cliente, resumen, facturas, pagos } = datos

  // Calcular porcentaje de crédito usado
  const porcentajeUsado = resumen.linea_credito > 0
    ? (resumen.deuda_actual / resumen.linea_credito) * 100
    : 0

  // Fusionar facturas y pagos en un historial unificado
  const historial = [
    ...facturas.map(f => ({ ...f, tipo: 'factura' })),
    ...pagos.map(p => ({ ...p, tipo: 'pago' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1>Estado de Cuenta</h1>

      {/* Tarjetas de resumen */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginTop: '30px' 
      }}>
        
        {/* Línea de crédito */}
        <div style={cardStyle}>
          <h3>💰 Línea de Crédito</h3>
          <p style={montoStyle}>${resumen.linea_credito.toFixed(2)}</p>
          <span style={{ color: '#666', fontSize: '14px' }}>Crédito total aprobado</span>
        </div>

        {/* Deuda actual */}
        <div style={cardStyle}>
          <h3>📊 Deuda Actual</h3>
          <p style={{ 
            ...montoStyle, 
            color: resumen.deuda_actual > 0 ? '#d32f2f' : '#2e7d32' 
          }}>
            ${resumen.deuda_actual.toFixed(2)}
          </p>
          <span style={{ color: '#666', fontSize: '14px' }}>Facturado - Pagado</span>
        </div>

        {/* Saldo disponible */}
        <div style={cardStyle}>
          <h3>✅ Saldo Disponible</h3>
          <p style={{ 
            ...montoStyle, 
            color: resumen.saldo >= 0 ? '#2e7d32' : '#d32f2f' 
          }}>
            ${resumen.saldo.toFixed(2)}
          </p>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {resumen.saldo >= 0 ? 'Crédito disponible' : 'Excedido'}
          </span>
        </div>

        {/* Total facturado */}
        <div style={cardStyle}>
          <h3>📄 Total Facturado</h3>
          <p style={montoStyle}>${resumen.total_facturado.toFixed(2)}</p>
          <span style={{ color: '#666', fontSize: '14px' }}>{facturas.length} facturas</span>
        </div>

        {/* Total pagado */}
        <div style={cardStyle}>
          <h3>💵 Total Pagado</h3>
          <p style={{ ...montoStyle, color: '#2e7d32' }}>${resumen.total_pagado.toFixed(2)}</p>
          <span style={{ color: '#666', fontSize: '14px' }}>{pagos.length} pagos</span>
        </div>
      </div>

      {/* Barra de progreso de crédito */}
      {resumen.linea_credito > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Uso de crédito</h3>
          <div style={{ 
            width: '100%', 
            height: '20px', 
            background: '#e0e0e0', 
            borderRadius: '10px',
            overflow: 'hidden',
            marginTop: '10px'
          }}>
            <div style={{
              width: `${Math.min(porcentajeUsado, 100)}%`,
              height: '100%',
              background: porcentajeUsado > 80 ? '#d32f2f' : porcentajeUsado > 50 ? '#f57c00' : '#2e7d32',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '14px', color: '#666' }}>
            <span>$0</span>
            <span>{porcentajeUsado.toFixed(1)}% usado</span>
            <span>${resumen.linea_credito.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Filtros del historial */}
      <div style={{ marginTop: '40px' }}>
        <h2>Historial de movimientos</h2>
        
        <div style={{ marginTop: '15px', marginBottom: '20px' }}>
          <button 
            onClick={() => setFiltro('todos')}
            style={filtro === 'todos' ? filtroActivoStyle : filtroStyle}
          >
            Todos ({historial.length})
          </button>
          <button 
            onClick={() => setFiltro('facturas')}
            style={filtro === 'facturas' ? filtroActivoStyle : filtroStyle}
          >
            Facturas ({facturas.length})
          </button>
          <button 
            onClick={() => setFiltro('pagos')}
            style={filtro === 'pagos' ? filtroActivoStyle : filtroStyle}
          >
            Pagos ({pagos.length})
          </button>
        </div>

        {/* Tabla de historial */}
        {historial.length === 0 ? (
          <p>No hay movimientos registrados</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Número</th>
                <th style={thStyle}>Monto</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {historial
                .filter(mov => {
                  if (filtro === 'facturas') return mov.tipo === 'factura'
                  if (filtro === 'pagos') return mov.tipo === 'pago'
                  return true
                })
                .map(mov => (
                  <tr key={`${mov.tipo}-${mov.id}`} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>
                      {mov.tipo === 'factura' ? '📄 Factura' : '💵 Pago'}
                    </td>
                    <td style={tdStyle}>
                      {mov.tipo === 'factura' ? `#${mov.numero_factura}` : `#${mov.id}`}
                    </td>
                    <td style={{
                      ...tdStyle,
                      color: mov.tipo === 'factura' ? '#d32f2f' : '#2e7d32',
                      fontWeight: 'bold'
                    }}>
                      {mov.tipo === 'factura' ? '-' : '+'}${Number(mov.monto_facturado || mov.monto).toFixed(2)}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        background: mov.estado === 'pagada' ? '#e8f5e9' : '#fff3e0',
                        color: mov.estado === 'pagada' ? '#2e7d32' : '#f57c00'
                      }}>
                        {mov.tipo === 'factura' ? (mov.estado || 'pendiente') : mov.tipo === 'pago' ? 'registrado' : mov.estado}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {new Date(mov.created_at).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// Estilos
const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  textAlign: 'center'
}

const montoStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '10px 0',
  color: '#333'
}

const thStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#555',
  fontSize: '14px'
}

const tdStyle = {
  padding: '10px 8px',
  fontSize: '14px'
}

const filtroStyle = {
  padding: '8px 16px',
  marginRight: '8px',
  background: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '14px'
}

const filtroActivoStyle = {
  ...filtroStyle,
  background: '#1976d2',
  color: 'white',
  border: '1px solid #1976d2'
}

export default EstadoCuenta