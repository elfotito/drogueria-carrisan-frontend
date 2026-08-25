// Service Worker de Droguería Carrisán — exclusivamente para Web Push.
// No implementa cacheo offline; su único trabajo es escuchar el evento
// "push" (llega aunque la pestaña esté cerrada) y mostrar la notificación
// del sistema operativo, y manejar el click sobre ella.

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const titulo = data.titulo || 'Droguería Carrisan';
  const opciones = {
    body: data.mensaje || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});

self.addEventListener('push', (event) => {
  let datos = { titulo: 'Droguería Carrisán', cuerpo: 'Tenés una notificación nueva', url: '/' };

  if (event.data) {
    try {
      datos = event.data.json();
    } catch {
      datos.cuerpo = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(datos.titulo, {
      body: datos.cuerpo,
      icon: '/icons.svg',
      badge: '/icons.svg',
      data: { url: datos.url || '/' },
    })
  );
});

// Al hacer click en la notificación: enfoca una pestaña ya abierta del
// sitio si existe, o abre una nueva en la URL asociada.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const cliente of clientList) {
        if (cliente.url.includes(self.location.origin) && 'focus' in cliente) {
          cliente.navigate(url);
          return cliente.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});