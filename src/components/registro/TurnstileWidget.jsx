import { useEffect, useRef, useId, useState } from 'react'

/**
 * Widget de Cloudflare Turnstile ("estoy verificando que no sos un
 * bot", mayormente invisible). Se usa en el paso final del registro,
 * una sola vez para todo el formulario (no por cada archivo subido).
 *
 * Requiere la SITE KEY PUBLICA en la variable de entorno
 * VITE_TURNSTILE_SITE_KEY (Vercel → Settings → Environment Variables).
 * La SECRET KEY correspondiente vive solo en el backend (Render),
 * nunca acá.
 *
 * OJO: la Site Key y la Secret Key empiezan igual (0x4AAAAA...). La
 * Site Key tiene 24 caracteres; la Secret Key tiene 35. Si pegás la
 * Secret Key acá, Cloudflare responde error 400020 ("Invalid sitekey")
 * y el widget nunca carga.
 *
 * Props:
 *  - onVerificado(token): callback cuando el usuario pasa el desafío
 *  - onExpirado(): callback si el token expira antes de usarse
 *  - onError(codigo): callback opcional ante un error del widget
 */
function TurnstileWidget({ onVerificado, onExpirado, onError }) {
  const contenedorRef = useRef(null)
  const widgetIdRef = useRef(null)
  const idUnico = useId()
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
  const [errorWidget, setErrorWidget] = useState('')

  // Guardamos los callbacks en un ref para que el efecto (que corre una
  // sola vez) siempre invoque la versión más reciente sin re-renderizar
  // el widget.
  const callbacksRef = useRef({ onVerificado, onExpirado, onError })
  useEffect(() => {
    callbacksRef.current = { onVerificado, onExpirado, onError }
  })

  useEffect(() => {
    if (!siteKey) {
      console.warn('[Turnstile] VITE_TURNSTILE_SITE_KEY no está configurada: el widget no se renderiza.')
      return
    }

    // Una Site Key válida tiene 24 caracteres (22 las de prueba). Si es
    // más larga, casi seguro pegaron la Secret Key.
    if (siteKey.length > 30) {
      console.error(
        '[Turnstile] VITE_TURNSTILE_SITE_KEY parece ser una SECRET KEY (35 caracteres). ' +
        'Usá la SITE KEY pública (24 caracteres) de Cloudflare → Turnstile → tu widget.'
      )
    }

    let cancelado = false

    function manejarError(codigo) {
      console.error(
        `[Turnstile] Error ${codigo}. Verificá que VITE_TURNSTILE_SITE_KEY sea la Site Key ` +
        '(24 caracteres) y que el hostname esté autorizado en Cloudflare (Hostname Management).'
      )
      setErrorWidget('No se pudo cargar la verificación de seguridad. Recargá la página o contactá a soporte.')
      callbacksRef.current.onError?.(codigo)
    }

    function renderizarWidget() {
      if (cancelado || !window.turnstile || !contenedorRef.current || widgetIdRef.current !== null) {
        return
      }
      try {
        widgetIdRef.current = window.turnstile.render(contenedorRef.current, {
          sitekey: siteKey,
          callback: (token) => callbacksRef.current.onVerificado(token),
          'expired-callback': () => callbacksRef.current.onExpirado?.(),
          'timeout-callback': () => callbacksRef.current.onExpirado?.(),
          'error-callback': (codigo) => manejarError(codigo),
          retry: 'never',
          theme: 'light',
        })
      } catch (err) {
        // turnstile.render() lanza TurnstileError (p.ej. sitekey inválida);
        // lo atrapamos para no ensuciar la consola con "Uncaught".
        manejarError(err?.errorCode ?? err?.code ?? 'render')
      }
    }

    // El script de Turnstile se carga una sola vez globalmente; si ya
    // existe (otro componente lo cargó antes), no lo duplicamos.
    const scriptExistente = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')

    if (window.turnstile) {
      renderizarWidget()
    } else if (!scriptExistente) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = renderizarWidget
      script.onerror = () => manejarError('script')
      document.body.appendChild(script)
    } else {
      // El script ya se estaba cargando por otra instancia; esperamos a que termine.
      scriptExistente.addEventListener('load', renderizarWidget, { once: true })
    }

    return () => {
      cancelado = true
      const widgetId = widgetIdRef.current
      widgetIdRef.current = null
      if (window.turnstile && widgetId !== null) {
        try {
          window.turnstile.remove(widgetId)
        } catch {
          // El widget ya no existe; nada que limpiar.
        }
      }
    }
  }, [siteKey])

  if (!siteKey) return null

  return (
    <>
      <div ref={contenedorRef} id={`turnstile-${idUnico}`} className="turnstile-widget" />
      {errorWidget && (
        <span className="registro-error-texto" role="alert">{errorWidget}</span>
      )}
    </>
  )
}

export default TurnstileWidget
