import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function PwaScopeSwitcher() {
  const location = useLocation()

  useEffect(() => {
    const esStaff = location.pathname.startsWith('/staff')

    const manifestLink = document.querySelector('link[rel="manifest"]')
    if (manifestLink) {
      manifestLink.setAttribute('href', esStaff ? '/manifest-staff.json' : '/manifest.webmanifest')
    }

    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]')
    if (appleTitle) {
      appleTitle.setAttribute('content', esStaff ? 'Carrisán Staff' : 'Drogueria Carrisan')
    }

    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]')
    if (appleIcon) {
      appleIcon.setAttribute('href', esStaff ? '/staff-icon-512x512.png' : '/apple-touch-icon.png')
    }

    document.title = esStaff ? 'Carrisán Staff' : 'Drogueria Carrisan, C.A.'
  }, [location.pathname])

  return null
}

export default PwaScopeSwitcher