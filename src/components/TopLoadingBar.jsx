import { useEffect, useRef, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { useLoadingBar } from '../context/LoadingBarContext'

function TopLoadingBar() {
  const { isLoading } = useLoadingBar()
  const [navHeight, setNavHeight] = useState(0)

  useEffect(() => {
    function medirNavbar() {
      const nav = document.querySelector('.navbar-container')
      if (nav) setNavHeight(nav.offsetHeight)
    }

    medirNavbar()
    window.addEventListener('resize', medirNavbar)

    // 🆕 por si el navbar cambia de alto (ej: aparece/desaparece la flecha, o cambia de ruta)
    const observer = new ResizeObserver(medirNavbar)
    const nav = document.querySelector('.navbar-container')
    if (nav) observer.observe(nav)

    return () => {
      window.removeEventListener('resize', medirNavbar)
      observer.disconnect()
    }
  }, [])

  if (!isLoading) return null

  return (
    <Box
      position="fixed"          // 🆕 antes: sticky
      top={`${navHeight}px`}    // 🆕 pegado justo debajo del navbar medido
      left="0"
      width="100%"
      height="3px"
      zIndex={1001}
      overflow="hidden"
      bg="rgba(0,0,0,0.1)"
      pointerEvents="none"      // 🆕 no bloquea clics del contenido debajo
    >
      <Box
        height="100%"
        width="40%"
        borderRadius="4px"
        bgGradient="linear(to-r, #0052dc, #12A594, #ffc220, #0052dc)"
        backgroundSize="200% 100%"
        animation="loadingSlide 1.1s ease-in-out infinite, loadingGradient 2s linear infinite"
        sx={{
          '@keyframes loadingSlide': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(350%)' },
          },
          '@keyframes loadingGradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '200% 50%' },
          },
        }}
      />
    </Box>
  )
}

export default TopLoadingBar