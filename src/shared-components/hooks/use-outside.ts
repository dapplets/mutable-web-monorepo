import { useEffect } from 'react'

/**
 * Hook that call callback on click outside of the passed ref
 */
export function useOutside(
  ref: React.RefObject<HTMLDivElement>,
  callback: () => void,
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>,
  openCloseWalletPopupRef?: React.RefObject<HTMLButtonElement>
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.composedPath()[0] as Node) &&
        (!openCloseWalletPopupRef ||
          (openCloseWalletPopupRef.current &&
            !(event.composedPath() as Node[]).includes(openCloseWalletPopupRef.current as Node)))
      ) {
        callback()
      }
    }
    // Bind the event listener
    document.addEventListener('click', handleClickOutside)
    trackingRefs?.forEach((trackingRef) =>
      trackingRef?.current?.addEventListener('click', handleClickOutside)
    )
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('click', handleClickOutside)
      trackingRefs?.forEach((trackingRef) =>
        trackingRef?.current?.removeEventListener('click', handleClickOutside)
      )
    }
  }, [ref, callback, trackingRefs])
}
