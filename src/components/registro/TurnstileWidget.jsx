import { useEffect, useRef, useId } from 'react'

/**
 * Widget de Cloudflare Turnstile ("estoy verificando que no sos un
 * bot", mayormente invisible). Se usa en el paso final del registro,
 * una sola vez para todo el formulario (no por cada archivo subido).
 *
 * Requiere la Site Key pública en la variable de entorno
 * VITE_TURNSTILE_SITE_KEY (Vercel → Settings → Environment Variables).
 * La Secret Key correspondiente vive solo en el backend (Render),
 * nunca acá.
 *
 * Props:
 *  - onVerificado(token): callback cuando el usuario pasa el desafío
 *  - onExpirado(): callback si el token expira antes de usarse
 */
function TurnstileWidget({ onVerificado, onExpirado }) {
  const contenedorRef = useRef(null)
  const widgetIdRef = useRef(null)
  const idUnico = useId()
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey) {
      console.warn('VITE_TURNSTILE_SITE_KEY no está configurada')
      return
    }

    // El script de Turnstile se carga una sola vez globalmente; si ya
    // existe (otro componente lo cargó antes), no lo duplicamos.
    const scriptExistente = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')

    function renderizarWidget() {
      if (!window.turnstile || !contenedorRef.current) return
      widgetIdRef.current = window.turnstile.render(contenedorRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerificado(token),
        'expired-callback': () => onExpirado?.(),
        theme: 'light',
      })
    }

    if (window.turnstile) {
      renderizarWidget()
    } else if (!scriptExistente) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = renderizarWidget
      document.body.appendChild(script)
    } else {
      // El script ya se estaba cargando por otra instancia; esperamos a que termine.
      scriptExistente.addEventListener('load', renderizarWidget)
    }

    return () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!siteKey) return null

  return <div ref={contenedorRef} id={`turnstile-${idUnico}`} className="turnstile-widget" />
}

export default TurnstileWidget