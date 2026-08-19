// hooks/useSupabaseImages.js
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

export const useSupabaseImages = (imageConfigs) => {
  const [images, setImages] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImages = async () => {
      try {
        // 🔑 Generar URLs una por una (simple y funciona)
        const urls = {}
        
        imageConfigs.forEach(({ path, width = 800, quality = 80 }) => {
          const { data } = supabase
            .storage
            .from('crsnimages') // ← Cambia por tu bucket
            .getPublicUrl(path, {
              transform: { width, quality }
            })
          
          // Guardar con nombre sin extensión
          const name = path.split('/').pop().replace(/\.[^.]+$/, '')
          urls[name] = data.publicUrl
        })
        
        setImages(urls)
      } catch (error) {
        console.error('Error loading images:', error)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [imageConfigs])

  return { images, loading }
}