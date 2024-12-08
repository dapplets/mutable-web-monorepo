import { useEffect } from 'react'

export const useEscape = (callback: () => void) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback()
      }
    }

    document.addEventListener('keydown', handleEsc, false)

    return () => {
      document.removeEventListener('keydown', handleEsc, false)
    }
  }, [callback])
}
