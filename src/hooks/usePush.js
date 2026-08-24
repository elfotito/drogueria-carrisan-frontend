import { useState, useCallback } from 'react'
import api from '../api/axios'

// Convierte la clave VAPID pública (base64 URL-safe) al formato Uint8Array
// que exige la Push API del navegador.
function convertirClaveVapid(claveBase64) {
  const padding = '='.repeat((4 - (claveBase64.length % 4)) % 4)
  const base64 = (claveBase64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

/**
 * Hook para pedir permiso de notificaciones push y suscribir al usuario.
 * Requiere que el usuario ya tenga sesión (llama a /push/suscribir, que
 * exige JWT) — por eso en el registro se usa DESPUÉS de crear la cuenta
 * y loguear, no antes.
 *
 * Devuelve:
 *  - soportado: si el navegador soporta Push API + Service Worker
 *  - estado: 'no_preguntado' | 'concedido' | 'denegado' | 'pospuesto'
 *  - pidiendoPermiso: true mientras se procesa
 *  - pedirPermiso(): dispara el prompt nativo del navegador
 */
export function usePush() {
  const soportado = 'serviceWorker' in navigator && 'PushManager' in window
  const [estado, setEstado] = useState('no_preguntado')
  const [pidiendoPermiso, setPidiendoPermiso] = useState(false)
  const [error, setError] = useState('')

  const pedirPermiso = useCallback(async () => {
    if (!soportado) {
      setEstado('no_soportado')
      return
    }

    setPidiendoPermiso(true)
    setError('')

    try {
      const registro = await navigator.serviceWorker.register('/sw.js')
      const permiso = await Notification.requestPermission()

      if (permiso !== 'granted') {
        setEstado('denegado')
        return
      }

      const claveVapid = import.meta.env.VITE_VAPID_PUBLIC_KEY
      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertirClaveVapid(claveVapid),
      })

      await api.post('/push/suscribir', suscripcion.toJSON())
      setEstado('concedido')
    } catch (err) {
      console.error('Error al activar notificaciones push:', err)
      setError('No se pudo activar las notificaciones. Podés intentarlo después desde Ajustes.')
      setEstado('denegado')
    } finally {
      setPidiendoPermiso(false)
    }
  }, [soportado])

  return { soportado, estado, pidiendoPermiso, error, pedirPermiso }
}