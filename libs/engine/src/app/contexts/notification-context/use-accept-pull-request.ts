import { usePromise } from '../../hooks/use-promise'
import { EntityId } from '@mweb/backend'
import { useMutableWeb } from '../mutable-web-context'
import { useNotifications } from './use-notifications'

export const useAcceptPullRequest = (notificationId: EntityId) => {
  const { engine } = useMutableWeb()
  const { setNotifications } = useNotifications()

  const { fetch, isLoading, error } = usePromise({
    query: async () => {
      const notification = await engine.mutationService.acceptPullRequest(notificationId)
      setNotifications((items) =>
        items.map((item) => (item.id === notification.id ? notification : item))
      )
    },
    deps: [engine, notificationId],
  })

  return {
    acceptPullRequest: fetch,
    isLoading,
    error,
  }
}
