import { useState, useEffect } from 'react'
import api from '../../api/axios'
import ClienteDetalle from './ClienteDetalle'

function EstadoCuentaAdmin() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState(null)

  useEffect(() => {
    cargarClientes()
  }, [])

  async function cargarClientes() {
    try {
      const { data } = await api.get('/clientes/estado-cuenta')
      setClientes(data)
    } catch (err) {
      setError('No se pudo cargar el estado de cuenta')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  // Si hay un cliente seleccionado, mostramos su detalle en vez de la lista
  if (clienteSeleccionadoId) {
    return (
      <ClienteDetalle
        clienteId={clienteSeleccionadoId}
        onVolver={() => {
          setClienteSeleccionadoId(null)
          cargarClientes() // refrescamos la lista por si algo cambió en el detalle
        }}
      />
    )
  }

  if (cargando) return <p>Cargando estado de cuenta...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h2>Estado de Cuenta</h2>

      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Línea de crédito</th>
            <th>Facturado</th>
            <th>Pagado</th>
            <th>Deuda</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr
              key={cliente.id}
              onClick={() => setClienteSeleccionadoId(cliente.id)}
              style={{ cursor: 'pointer' }}
            >
              <td>{cliente.nombre}</td>
              <td>${cliente.linea_credito.toFixed(2)}</td>
              <td>${cliente.total_facturado.toFixed(2)}</td>
              <td>${cliente.total_pagado.toFixed(2)}</td>
              <td>${cliente.deuda_actual.toFixed(2)}</td>
              <td style={{ color: cliente.saldo >= 0 ? 'green' : 'red' }}>
                {cliente.saldo >= 0 ? '+' : ''}${cliente.saldo.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EstadoCuentaAdmin