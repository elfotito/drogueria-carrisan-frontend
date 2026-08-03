import { useState } from 'react'

function Contacto() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!nombre || !email || !mensaje) {
      setError('Todos los campos son obligatorios')
      return
    }

    // Por ahora, abrimos el cliente de correo con mailto
    // En el futuro puedes conectar a un endpoint si creas la tabla contactos
    const asunto = encodeURIComponent(`Consulta de ${nombre} - Droguería Carrirán`)
    const cuerpo = encodeURIComponent(
      `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`
    )
    
    window.open(`mailto:ventas@carrisan.com?subject=${asunto}&body=${cuerpo}`)
    setEnviado(true)
    setNombre('')
    setEmail('')
    setMensaje('')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Contacto</h1>

      {enviado ? (
        <div style={{ marginTop: '30px', padding: '20px', background: '#e8f5e9', borderRadius: '8px' }}>
          <p>✅ ¡Mensaje listo! Se abrirá tu cliente de correo para enviarlo.</p>
          <button onClick={() => setEnviado(false)}>Enviar otro mensaje</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Mensaje</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows="5"
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <button type="submit" style={{ padding: '10px 30px' }}>
            Enviar mensaje
          </button>
        </form>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Información de contacto</h3>
        <p><strong>Email:</strong> ventas@carrisan.com</p>
        <p><strong>Teléfono:</strong> +58 414-1234567</p>
        <p><strong>Horario:</strong> Lunes a Viernes de 8:00 AM a 5:00 PM</p>
      </div>
    </div>
  )
}

export default Contacto