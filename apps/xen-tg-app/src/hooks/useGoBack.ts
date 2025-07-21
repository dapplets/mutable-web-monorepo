import { startTransition, useEffect } from 'react'
import { useNavigate } from 'react-router'

export const useGoBack = () => {
  const navigate = useNavigate()
  const { BackButton } = window.Telegram.WebApp
  useEffect(() => {
    BackButton.show()
    const backRoute = () => startTransition(() => navigate(-1))
    BackButton.onClick(backRoute)
    return () => {
      BackButton.hide()
      BackButton.offClick(backRoute)
    }
  }, [navigate])
}
