import { useEffect } from 'react'

/**
 * Hook that call callback on click outside of the passed ref
 */
export function useOutside(ref: React.RefObject<HTMLDivElement>, callback: () => void): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.composedPath()[0] as Node)) {
        callback()
      }
    }
    // Bind the event listener
    document.addEventListener('click', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('click', handleClickOutside)
    }
  }, [ref, callback])
}
