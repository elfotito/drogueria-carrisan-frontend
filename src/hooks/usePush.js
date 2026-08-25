import { useState, useCallback, useEffect } from 'react'
import api from '../api/axios'

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
 * Hook para gestionar notificaciones push (suscribir / desuscribir).
 * Detecta automáticamente el estado actual al montar.
 *
 * Devuelve:
 *  - soportado: boolean — si el navegador puede recibir push
 *  - suscrito: boolean | null — true si hay suscripción activa, null = cargando
 *  - permiso: 'granted' | 'denied' | 'default' | null
 *  - pidiendoPermiso: boolean — true mientras se procesa
 *  - error: string
 *  - activar(): pide permiso y suscribe
 *  - desactivar(): elimina la suscripción
 */
export function usePush() {
  const soportado = 'serviceWorker' in navigator && 'PushManager' in window && PUSH_ENABLED
  const [suscrito, setSuscrito] = useState(null)
  const [permiso, setPermiso] = useState(null)
  const [pidiendoPermiso, setPidiendoPermiso] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!soportado) {
      setSuscrito(false)
      setPermiso(Notification?.permission || 'default')
      return
    }

    let cancelled = false

    async function detectarEstado() {
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (!cancelled) {
          setSuscrito(!!sub)
          setPermiso(Notification.permission)
        }
      } catch {
        if (!cancelled) {
          setSuscrito(false)
          setPermiso('default')
        }
      }
    }

    detectarEstado()
    return () => { cancelled = true }
  }, [soportado])

  const activar = useCallback(async () => {
    if (!soportado) {
      setError('Las notificaciones push no están disponibles en este navegador.')
      return
    }

    setPidiendoPermiso(true)
    setError('')

    try {
      const registro = await navigator.serviceWorker.ready
      const permisoActual = await Notification.requestPermission()

      if (permisoActual !== 'granted') {
        setPermiso(permisoActual)
        setSuscrito(false)
        return
      }

      const claveVapid = convertirClaveVapid(VAPID_KEY)
      if (!claveVapid) {
        setError('Error de configuración de notificaciones.')
        return
      }

      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: claveVapid,
      })

      await api.post('/push/subscribe', suscripcion.toJSON())
      setSuscrito(true)
      setPermiso('granted')
    } catch (err) {
      console.error('Error al activar notificaciones push:', err)
      setError('No se pudo activar las notificaciones. Podés intentarlo después desde Ajustes.')
      setSuscrito(false)
    } finally {
      setPidiendoPermiso(false)
    }
  }, [soportado])

  const desactivar = useCallback(async () => {
    setPidiendoPermiso(true)
    setError('')

    try {
      const registro = await navigator.serviceWorker.ready
      const sub = await registro.pushManager.getSubscription()

      if (sub) {
        const endpoint = sub.endpoint
        await sub.unsubscribe()
        await api.delete('/push/subscribe', { data: { endpoint } })
      }

      setSuscrito(false)
    } catch (err) {
      console.error('Error al desactivar notificaciones push:', err)
      setError('No se pudo desactivar las notificaciones.')
    } finally {
      setPidiendoPermiso(false)
    }
  }, [])

  return { soportado, suscrito, permiso, pidiendoPermiso, error, activar, desactivar }
}
