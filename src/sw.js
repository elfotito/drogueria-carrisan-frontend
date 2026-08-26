import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.includes('/storage/'),
  new CacheFirst({
    cacheName: 'supabase-storage',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
)

registerRoute(
  ({ url }) => /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname),
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 })],
  })
)

registerRoute(
  ({ url }) => url.pathname.startsWith('/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 })],
  })
)

self.addEventListener('push', (event) => {
  let datos = { titulo: 'Droguería Carrisan', mensaje: 'Tenés una notificación nueva', url: '/' }

  if (event.data) {
    try {
      datos = event.data.json()
    } catch {
      datos.mensaje = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(datos.titulo, {
      body: datos.mensaje,
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      data: { url: datos.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const cliente of clientList) {
        if (cliente.url.includes(self.location.origin) && 'focus' in cliente) {
          cliente.navigate(url)
          return cliente.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})