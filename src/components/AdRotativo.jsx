import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './AdRotativo.css'

// Banner de ads rotativo, full-width — mismo tratamiento visual que AdBanner,
// pero cicla entre varias creatividades (imagen o GIF, el GIF se reproduce
// solo sin código extra) en orden aleatorio, como haría una red de ads real.
//
// Props:
//   ads       — array de { imagen, link, alt } (requerido, al menos 1)
//   intervalo — ms entre cada rotación (default 6000)
//   dots      — mostrar puntitos indicadores debajo del banner (default true)

function barajar(array) {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function AdRotativo({ ads = [], intervalo = 6000, dots = true }) {
  const [orden] = useState(() => barajar(ads))
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (orden.length <= 1 || pausado) return
    timerRef.current = setInterval(() => {
      setIndice((i) => (i + 1) % orden.length)
    }, intervalo)
    return () => clearInterval(timerRef.current)
  }, [orden.length, intervalo, pausado])

  if (orden.length === 0) return null

  const mostrarDots = dots && orden.length > 1

  return (
    <div
      className={`ad-rotativo ${mostrarDots ? 'ad-rotativo--dots' : ''}`}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {orden.map((item, i) => {
        const activo = i === indice
        const clase = `ad-rotativo__slide ${activo ? 'ad-rotativo__slide--activo' : ''}`
        const imgEl = (
          <img
            src={item.imagen}
            alt={item.alt || ''}
            className="ad-rotativo__img"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        )

        return item.link ? (
          <Link
            key={`${item.imagen}-${i}`}
            to={item.link}
            className={clase}
            aria-hidden={!activo}
            tabIndex={activo ? 0 : -1}
          >
            {imgEl}
          </Link>
        ) : (
          <div key={`${item.imagen}-${i}`} className={clase} aria-hidden={!activo}>
            {imgEl}
          </div>
        )
      })}

      {mostrarDots && (
        <div className="ad-rotativo__dots">
          {orden.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`ad-rotativo__dot ${i === indice ? 'ad-rotativo__dot--activo' : ''}`}
              aria-label={`Ver ad ${i + 1}`}
              onClick={() => setIndice(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AdRotativo