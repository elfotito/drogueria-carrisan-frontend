import { useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import { useLoadingBar } from '../context/LoadingBarContext'

function TopLoadingBar() {
  const { isLoading } = useLoadingBar()
  const [navHeight, setNavHeight] = useState(0)
  const location = useLocation()

  // Rutas donde NO queremos mostrar el loading bar
  const excludedRoutes = ['/login', '/registro']
  const shouldShowLoadingBar = !excludedRoutes.includes(location.pathname)

  useEffect(() => {
    function medirNavbar() {
      const nav = document.querySelector('.navbar-container')
      if (nav) setNavHeight(nav.offsetHeight)
    }

    medirNavbar()
    window.addEventListener('resize', medirNavbar)

    const observer = new ResizeObserver(medirNavbar)
    const nav = document.querySelector('.navbar-container')
    if (nav) observer.observe(nav)

    return () => {
      window.removeEventListener('resize', medirNavbar)
      observer.disconnect()
    }
  }, [])

  if (!isLoading || !shouldShowLoadingBar) return null

  return (
    <Box
      position="fixed"
      top={`${navHeight}px`}
      left="0"
      width="100%"
      height="4px"
      zIndex={1001}
      overflow="hidden"
      bg="rgba(255,255,255,0.16)"
      pointerEvents="none"
    >
      {/* Gradiente aurora en colores de marca */}
      <Box
        height="100%"
        width="100%"
        bgGradient="linear(to-r, #0052DC, #12A594, #FFC220, #12A594, #0052DC)"
        backgroundSize="300% 100%"
        boxShadow="0 0 10px rgba(0,82,220,0.6), 0 0 4px rgba(18,165,148,0.35)"
        animation="loadingAurora 3.2s ease-in-out infinite"
        sx={{
          '@keyframes loadingAurora': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      />

      {/* Destello que recorre la barra cada ciclo */}
      <Box
        position="absolute"
        top="0"
        left="0"
        height="100%"
        width="45%"
        bgGradient="linear(to-r, transparent, rgba(255,255,255,0.55), transparent)"
        animation="loadingSheen 1.6s ease-in-out infinite"
        sx={{
          '@keyframes loadingSheen': {
            '0%': { transform: 'translateX(-120%)' },
            '60%': { transform: 'translateX(245%)' },
            '100%': { transform: 'translateX(245%)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            opacity: 0,
          },
        }}
      />
    </Box>
  )
}

export default TopLoadingBar