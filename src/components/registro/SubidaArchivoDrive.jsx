import { useState, useRef } from 'react'
import api from '../../api/axios'

/**
 * Subida de un archivo PDF durante el registro (RIF, permiso sanitario,
 * registro mercantil, certificado de acreditación profesional).
 *
 * Sube directo a POST /uploads/registro (endpoint público, sin auth —
 * el usuario todavía no tiene cuenta en este punto del flujo) y
 * devuelve la URL de Drive al padre vía onSubida. El padre guarda esa
 * URL en el estado del formulario y la manda recién al hacer submit
 * final del registro.
 *
 * Props:
 *  - tipoDocumento: string identificador ('rif' | 'permiso_sanitario' | ...)
 *  - etiqueta: texto mostrado al usuario (ej: "RIF")
 *  - obligatorio: si true, muestra asterisco y estilo de requerido
 *  - onSubida(url): callback cuando la subida termina bien
 *  - onQuitar(): callback cuando el usuario quita el archivo ya subido
 */
function SubidaArchivoDrive({ tipoDocumento, etiqueta, obligatorio = false, onSubida, onQuitar }) {
  const [archivo, setArchivo] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [subido, setSubido] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function manejarSeleccion(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo supera el tamaño máximo de 2MB')
      return
    }

    setError('')
    setArchivo(file)
    setSubiendo(true)

    try {
      const formData = new FormData()
      formData.append('archivo', file)
      formData.append('tipo_documento', tipoDocumento)

      const { data } = await api.post('/uploads/registro', formData)
      setSubido(true)
      onSubida(data.url)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo subir el archivo. Intenta de nuevo.')
      setArchivo(null)
    } finally {
      setSubiendo(false)
    }
  }

  function quitarArchivo() {
    setArchivo(null)
    setSubido(false)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onQuitar?.()
  }

  return (
    <div className="subida-archivo">
      <label className="subida-archivo-etiqueta">
        {etiqueta} {obligatorio && <span className="subida-archivo-requerido">*</span>}
        {!obligatorio && <span className="subida-archivo-opcional">(opcional)</span>}
      </label>

      {!archivo ? (
        <label className="subida-archivo-dropzone">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={manejarSeleccion}
            hidden
          />
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Subir PDF</span>
        </label>
      ) : (
        <div className={`subida-archivo-preview${subido ? ' subida-archivo-preview--ok' : ''}`}>
          <span className="subida-archivo-nombre">{archivo.name}</span>
          {subiendo ? (
            <span className="subida-archivo-estado">Subiendo...</span>
          ) : subido ? (
            <>
              <svg className="subida-archivo-check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <button type="button" onClick={quitarArchivo} className="subida-archivo-quitar">Quitar</button>
            </>
          ) : null}
        </div>
      )}

      {error && <span className="registro-error-texto">{error}</span>}
    </div>
  )
}

export default SubidaArchivoDrive