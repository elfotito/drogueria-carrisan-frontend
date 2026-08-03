function Ayuda() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Cómo usar la plataforma</h1>

      <section style={{ marginTop: '30px' }}>
        <h2>📋 Paso 1: Iniciar sesión</h2>
        <p>
          Usa el email y contraseña que te proporcionamos. Si aún no tienes cuenta, 
          contáctanos para crear una.
        </p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2>🔍 Paso 2: Explorar el catálogo</h2>
        <p>
          En la página principal encontrarás todos los productos disponibles. 
          Puedes buscar por nombre, filtrar por marca o laboratorio.
        </p>
        <p>Cada producto muestra su precio en USD y su equivalente en bolívares según la tasa del día.</p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2>🛒 Paso 3: Armar tu pedido</h2>
        <p>
          Haz clic en "Agregar al carrito" en los productos que necesites. 
          Cuando termines, ve al carrito para revisar tu orden.
        </p>
        <p>Puedes ajustar cantidades o eliminar productos antes de confirmar.</p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2>✅ Paso 4: Confirmar orden</h2>
        <p>
          Revisa el resumen de tu pedido y haz clic en "Confirmar orden". 
          Recibirás un número de orden y podrás hacerle seguimiento en "Mis Órdenes".
        </p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2>📦 Paso 5: Seguimiento</h2>
        <p>
          En "Mis Órdenes" verás todas tus órdenes con su estado: 
          <strong> Pendiente</strong> (en proceso) o <strong>Finalizado</strong> (despachada).
        </p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2>📊 Funciones adicionales</h2>
        <ul>
          <li><strong>Mis Items:</strong> Guarda productos que compras frecuentemente para pedirlos más rápido.</li>
          <li><strong>Mi Cuenta:</strong> Consulta tu información, estado de cuenta y línea de crédito.</li>
          <li><strong>Notificaciones:</strong> Recibe alertas sobre tus órdenes, facturas y pagos.</li>
        </ul>
      </section>
    </div>
  )
}

export default Ayuda