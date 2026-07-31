import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import UsuarioForm from './UsuarioForm'

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const { user } = useAuth() // para saber quién soy y no dejarme auto-eliminar

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    try {
      const { data } = await api.get('/users')
      setUsuarios(data)
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

  async function handleEliminar(usuarioId) {
    const confirmado = window.confirm('¿Seguro que querés eliminar este usuario?')
    if (!confirmado) return

    try {
      await api.delete(`/users/${usuarioId}`)
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioId))
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el usuario')
    }
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busqueda.toLowerCase()
    return (
      u.nombre?.toLowerCase().includes(texto) ||
      u.email.toLowerCase().includes(texto)
    )
  })

  if (cargando) return <p>Cargando usuarios...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h2>Usuarios</h2>

      <div className="usuarios-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={abrirNuevo}>+ Nuevo usuario</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Etiqueta</th>
            <th>Admin</th>
            <th>Activo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.etiqueta}</td>
              <td>{u.es_admin ? 'Sí' : 'No'}</td>
              <td>{u.activo ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => abrirEdicion(u)}>Editar</button>
                {u.id !== user.id && (
                  <button onClick={() => handleEliminar(u.id)}>Eliminar</button>
                )}
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