import { useEffect, useRef, useState } from 'react'
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
      height="3px"
      zIndex={1001}
      overflow="hidden"
      bg="rgba(0,0,0,0.08)"
      pointerEvents="none"
    >
      <Box
        height="100%"
        width="100%"
        bgGradient="linear(to-r, #0052dc, #12A594, #ffc220, #12A594, #0052dc)"
        backgroundSize="300% 100%"
        boxShadow="0 0 8px rgba(0,82,220,0.55)"
        animation="loadingAurora 2.4s ease-in-out infinite"
        sx={{
          '@keyframes loadingAurora': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      />
    </Box>
  )
}

export default TopLoadingBar