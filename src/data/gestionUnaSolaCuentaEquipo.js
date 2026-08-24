// src/data/gestionUnaSolaCuentaEquipo.js
const gestionEquipoInfo = {
  titulo: 'Gestión en una sola cuenta para tu equipo',
  tipo: 'lista',
  contenido: [
    {
      icono: 'Users',
      titulo: 'Sub-usuarios con su propio acceso',
      // TODO: confirmar mecanismo real (PIN, usuario/clave propio, etc.)
      texto: 'Cada persona de tu equipo puede generar pedidos identificados, sin compartir la contraseña principal.',
    },
    {
      icono: 'FileText',
      titulo: 'Un solo estado de cuenta',
      texto: 'Todos los pedidos del equipo se consolidan bajo la misma línea de crédito y facturación.',
    },
    {
      icono: 'ShieldCheck',
      titulo: 'Control centralizado',
      texto: 'El dueño de la cuenta ve y administra todos los movimientos, sin importar quién generó cada pedido.',
    },
  ],
}

export default gestionEquipoInfo
