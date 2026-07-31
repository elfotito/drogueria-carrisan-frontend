import { useState, useEffect } from 'react'
import api from '../../api/axios'
import UsuarioForm from './UsuarioForm'

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    try {
      const response = await api.get('/users')
      setUsuarios(response.data)
    } catch (err) {
      setError('No se pudieron cargar los usuarios')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  function abrirNuevo() {
    setUsuarioEnEdicion(null)
    setMostrarForm(true)
  }

  function abrirEdicion(usuario) {
    setUsuarioEnEdicion(usuario)
    setMostrarForm(true)
  }

  function cerrarForm() {
    setMostrarForm(false)
    setUsuarioEnEdicion(null)
  }

  async function handleGuardado() {
    cerrarForm()
    await cargarUsuarios()
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = busqueda.toLowerCase()
    return (
      usuario.nombre?.toLowerCase().includes(texto) ||
      usuario.email?.toLowerCase().includes(texto) ||
      usuario.rif_cedula?.toLowerCase().includes(texto)
    )
  })

  if (cargando) return <p>Cargando usuarios...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h2>Usuarios</h2>

      <div className="usuarios-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o RIF/Cédula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={abrirNuevo}>+ Nuevo usuario</button>
      </div>

      <p>{usuariosFiltrados.length} de {usuarios.length} usuarios</p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>RIF/Cédula</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Etiqueta</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Teléfono</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Crédito</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Estado</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}></th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((usuario) => (
            <tr key={usuario.id}>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{usuario.nombre || '-'}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{usuario.email}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{usuario.rif_cedula || '-'}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                <span style={{
                  background: usuario.etiqueta === 'admin' ? '#ff6b6b' : 
                             usuario.etiqueta === 'distribuidor' ? '#4ecdc4' : '#45b7d1',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {usuario.etiqueta || 'distribuidor'}
                </span>
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{usuario.telefono || '-'}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>${usuario.linea_credito?.toFixed(2) || '0.00'}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                {usuario.activo !== false ? '✅ Activo' : '❌ Inactivo'}
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                <button onClick={() => abrirEdicion(usuario)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarForm && (
        <UsuarioForm
          usuario={usuarioEnEdicion}
          onClose={cerrarForm}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  )
}

export default UsuariosAdmin