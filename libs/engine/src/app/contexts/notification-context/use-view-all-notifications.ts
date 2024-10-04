import { usePromise } from '../../hooks/use-promise'
import { EntityId } from '@mweb/backend'
import { useMutableWeb } from '../mutable-web-context'
import { useNotifications } from './use-notifications'

export const useViewAllNotifications = (notificationId: EntityId) => {
  const { engine } = useMutableWeb()
  const { setNotifications } = useNotifications()

  const { fetch, isLoading, error } = usePromise({
    query: async () => {
      const notifications = await engine.notificationService.viewAllNotifcations(notificationId)

      setNotifications((items) =>
        items.map((item) => notifications.find((x) => x.id === item.id) ?? item)
      )
    },
    deps: [engine, notificationId],
  })

  return {
    viewAllNotifcations: fetch,
    isLoading,
    error,
  }
}
