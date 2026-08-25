import { useState, useCallback } from 'react'
import api from '../api/axios'

// Convierte la clave VAPID pública (base64 URL-safe) al formato Uint8Array
// que exige la Push API del navegador.
function convertirClaveVapid(claveBase64) {
  if (!claveBase64) return null
  const padding = '='.repeat((4 - (claveBase64.length % 4)) % 4)
  const base64 = (claveBase64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY
const PUSH_ENABLED = !!VAPID_KEY

if (!PUSH_ENABLED) {
  console.error('🚨  VITE_VAPID_PUBLIC_KEY no está definida. Las notificaciones push están deshabilitadas.')
}

/**
 * Hook para pedir permiso de notificaciones push y suscribir al usuario.
 * Requiere que el usuario ya tenga sesión (llama a /push/subscribe, que
 * exige JWT) — por eso en el registro se usa DESPUÉS de crear la cuenta
 * y loguear, no antes.
 *
 * Devuelve:
 *  - soportado: si el navegador soporta Push API + Service Worker Y la VAPID key está configurada
 *  - estado: 'no_preguntado' | 'concedido' | 'denegado' | 'no_soportado' | 'pospuesto'
 *  - pidiendoPermiso: true mientras se procesa
 *  - pedirPermiso(): dispara el prompt nativo del navegador
 */
export function usePush() {
  const soportado = 'serviceWorker' in navigator && 'PushManager' in window && PUSH_ENABLED
  const [estado, setEstado] = useState('no_preguntado')
  const [pidiendoPermiso, setPidiendoPermiso] = useState(false)
  const [error, setError] = useState('')

  const pedirPermiso = useCallback(async () => {
    if (!soportado) {
      if (!PUSH_ENABLED) {
        setEstado('no_soportado')
        setError('Las notificaciones push no están configuradas en el servidor.')
      } else {
        setEstado('no_soportado')
      }
      return
    }

    setPidiendoPermiso(true)
    setError('')

    try {
      // El Service Worker ya fue registrado en App.jsx (registro centralizado).
      // Si por alguna razón no está listo, esperamos a que lo esté.
      const registro = await navigator.serviceWorker.ready

      const permiso = await Notification.requestPermission()

      if (permiso !== 'granted') {
        setEstado('denegado')
        return
      }

      const claveVapid = convertirClaveVapid(VAPID_KEY)
      if (!claveVapid) {
        setEstado('denegado')
        setError('Error de configuración de notificaciones.')
        return
      }

      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: claveVapid,
      })

      await api.post('/push/subscribe', suscripcion.toJSON())
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