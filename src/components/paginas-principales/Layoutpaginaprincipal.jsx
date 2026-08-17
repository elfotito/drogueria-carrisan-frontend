import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Box, Flex, IconButton, Text } from '@chakra-ui/react'
import { Menu, X, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../BottomNav'
import { NAV_PAGINAS_PRINCIPALES } from '../Navpaginasprincipales'
import './Layoutpaginaprincipal.css'

// ---------------------------------------------------------------
// <LayoutPaginaPrincipal activo="ordenes" titulo="Mis Órdenes">
//   {contenido de la página}
// </LayoutPaginaPrincipal>
//
// Este es el layout base de "Páginas Principales": en desktop/tablet
// (≥1024px) muestra una columna izquierda flotante y sticky con la
// navegación de cuenta (igual patrón que el resumen sticky de
// Carrito.jsx, pero a la izquierda). En móvil (<1024px) esa columna
// se convierte en un drawer que se abre con un botón de menú y
// "arrastra" el contenido de la página hacia la derecha con una
// transición corta (efecto push, no overlay).
// ---------------------------------------------------------------
function ContenidoNav({ activo, esAdmin, onNavigate }) {
  return (
    <nav className="ppal-nav" aria-label="Navegación de cuenta">
      {NAV_PAGINAS_PRINCIPALES.map((grupo) => {
        const items = grupo.items.filter((item) => !esAdmin || !item.soloCliente)
        if (items.length === 0) return null

        return (
          <div className="ppal-nav__grupo" key={grupo.titulo}>
            <span className="ppal-nav__grupo-titulo">{grupo.titulo}</span>
            {items.map((item) => {
              const Icono = item.icono
              const esActivo = item.id === activo
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  onClick={onNavigate}
                  className={`ppal-nav__link ${esActivo ? 'ppal-nav__link--activo' : ''}`}
                >
                  <Icono size={18} strokeWidth={esActivo ? 2.4 : 2} />
                  <span>{item.texto}</span>
                  {esActivo && <ChevronRight size={16} className="ppal-nav__chevron" />}
                </NavLink>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

function LayoutPaginaPrincipal({ activo, titulo, subtitulo, acciones, children }) {
  const { user, logout } = useAuth()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const catcherRef = useRef(null)

  const cerrarDrawer = () => setDrawerAbierto(false)

  // Bloquea el scroll del fondo y permite cerrar con Escape mientras
  // el drawer móvil está abierto — mismo patrón que MenuDrawer.jsx
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') cerrarDrawer()
    }
    if (drawerAbierto) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [drawerAbierto])

  const iniciales = (user?.nombre || user?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <Box className="ppal-root">
      {/* Panel del drawer (solo se ve en móvil, ver CSS) */}
      <Box as="aside" className={`ppal-drawer-panel ${drawerAbierto ? 'ppal-drawer-panel--abierto' : ''}`}>
        <Flex className="ppal-drawer-panel__header" align="center" justify="space-between">
          <Flex align="center" gap="10px">
            <Box className="ppal-drawer-panel__avatar">{iniciales}</Box>
            <Box minW="0">
              <Text className="ppal-drawer-panel__nombre" truncate>
                {user?.nombre || 'Mi cuenta'}
              </Text>
              <Text className="ppal-drawer-panel__email" truncate>
                {user?.email}
              </Text>
            </Box>
          </Flex>
          <IconButton
            aria-label="Cerrar menú"
            variant="ghost"
            size="sm"
            onClick={cerrarDrawer}
            className="ppal-drawer-panel__cerrar"
          >
            <X size={18} />
          </IconButton>
        </Flex>

        <Box className="ppal-drawer-panel__scroll">
          <ContenidoNav activo={activo} esAdmin={user?.es_admin} onNavigate={cerrarDrawer} />
        </Box>

        {!user?.es_admin && (
          <button type="button" className="ppal-drawer-panel__logout" onClick={logout}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        )}
      </Box>

      {/* Todo lo demás (topbar móvil + layout de 2 columnas) se "empuja"
          hacia la derecha cuando el drawer está abierto */}
      <Box className={`ppal-shift ${drawerAbierto ? 'ppal-shift--empujado' : ''}`}>
        {drawerAbierto && (
          <div ref={catcherRef} className="ppal-shift__catcher" onClick={cerrarDrawer} aria-hidden="true" />
        )}

        {/* Barra superior — solo visible en móvil/tablet */}
        <Flex as="header" className="ppal-topbar" align="center" gap="10px">
          <IconButton
            aria-label="Abrir menú de cuenta"
            variant="ghost"
            onClick={() => setDrawerAbierto(true)}
            className="ppal-topbar__menu-btn"
          >
            <Menu size={22} />
          </IconButton>
          <Text className="ppal-topbar__titulo" truncate>{titulo}</Text>
        </Flex>

        <div className="ppal-container">
          <Flex className="ppal-body" align="flex-start" gap="32px">
            {/* Columna izquierda — solo visible en desktop/tablet */}
            <Box as="aside" className="ppal-sidebar">
              <Box className="ppal-sidebar__sticky">
                <div className="ppal-sidebar__header">
                  <div className="ppal-sidebar__avatar">{iniciales}</div>
                  <div className="ppal-sidebar__header-texto">
                    <p className="ppal-sidebar__nombre">{user?.nombre || 'Mi cuenta'}</p>
                    <p className="ppal-sidebar__email">{user?.email}</p>
                  </div>
                </div>
                <ContenidoNav activo={activo} esAdmin={user?.es_admin} />
              </Box>
            </Box>

            {/* Columna derecha — contenido de la página */}
            <Box as="main" className="ppal-main" minW="0">
              <Flex className="ppal-main__header" align="center" justify="space-between" gap="12px">
                <div>
                  <h1 className="ppal-main__titulo">{titulo}</h1>
                  {subtitulo && <p className="ppal-main__subtitulo">{subtitulo}</p>}
                </div>
                {acciones && <div className="ppal-main__acciones">{acciones}</div>}
              </Flex>

              {children}
            </Box>
          </Flex>
        </div>

        <BottomNav />
      </Box>
    </Box>
  )
}

export default LayoutPaginaPrincipal