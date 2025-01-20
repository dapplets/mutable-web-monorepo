import { useNavigate } from 'react-router-dom'
import React, { useCallback, useEffect } from 'react'

function maybeRedirect(navigate, newURL) {
  let url = new URL(newURL)
  const hashFragment = url.hash.slice(1)
  const prefixSlash = hashFragment.startsWith('/')
  const numParts = hashFragment.split('/').length

  if (hashFragment && (prefixSlash || numParts >= 3)) {
    navigate && navigate(`${prefixSlash ? '' : '/'}${hashFragment}`, { replace: true })
  }
}

export function useHashRouterLegacy() {
  const navigate = useNavigate()

  const onHashChange = useCallback(
    (event) => {
      maybeRedirect(navigate, event.newURL)
    },
    [navigate]
  )

  useEffect(() => {
    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [onHashChange])

  useEffect(() => {
    if (!navigate) {
      return
    }
    const currentUrl = window.location.href
    maybeRedirect(navigate, currentUrl)
  }, [navigate])
}
