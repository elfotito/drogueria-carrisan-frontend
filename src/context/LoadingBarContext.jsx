import { createContext, useContext, useState, useCallback, useRef } from 'react'

const LoadingBarContext = createContext(null)

export function LoadingBarProvider({ children }) {
  const [activeRequests, setActiveRequests] = useState(0)
  const timeoutRef = useRef(null)

  const start = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setActiveRequests((n) => n + 1)
  }, [])

  const finish = useCallback(() => {
    setActiveRequests((n) => Math.max(0, n - 1))
  }, [])

  const isLoading = activeRequests > 0

  return (
    <LoadingBarContext.Provider value={{ start, finish, isLoading }}>
      {children}
    </LoadingBarContext.Provider>
  )
}

export function useLoadingBar() {
  const ctx = useContext(LoadingBarContext)
  if (!ctx) throw new Error('useLoadingBar debe usarse dentro de LoadingBarProvider')
  return ctx
}