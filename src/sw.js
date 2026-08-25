import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

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
