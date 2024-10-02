import { useCallback, useEffect, useMemo, useState } from 'react'
import { IContextNode } from '@mweb/core'
import { BosUserLinkWithInstance, UserLinkId } from '@mweb/backend'
import { useMutableWeb } from '.'
import { AppId } from '@mweb/backend'

// Reuse reference to empty array to avoid unnecessary re-renders
const NoLinks: BosUserLinkWithInstance[] = []

export const useUserLinks = (context: IContextNode) => {
  const { engine, selectedMutation, activeApps } = useMutableWeb()
  const [userLinks, setUserLinks] = useState<BosUserLinkWithInstance[]>([])
  const [error, setError] = useState<Error | null>(null)

  const staticLinks = useMemo(() => {
    if (!engine || !selectedMutation?.id) {
      return []
    } else {
      // ToDo: the service should not know about instances
      return engine.userLinkService.getStaticLinksForApps(activeApps, context)
    }
  }, [engine, selectedMutation, activeApps, context.parsedContext, context.isVisible])

  const fetchUserLinks = useCallback(async () => {
    if (!engine || !selectedMutation?.id) {
      setUserLinks([])
      return
    }

    try {
      // ToDo: the service should not know about instances
      const links = await engine.userLinkService.getLinksForContext(
        activeApps,
        selectedMutation.id,
        context
      )
      setUserLinks(links)
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        setError(err)
      } else {
        setError(new Error('An unknown error occurred'))
      }
    }
  }, [engine, selectedMutation, activeApps, context])

  useEffect(() => {
    fetchUserLinks()
  }, [fetchUserLinks])

  const links: BosUserLinkWithInstance[] = useMemo(() => {
    return userLinks.length || staticLinks.length ? [...userLinks, ...staticLinks] : NoLinks
  }, [userLinks, staticLinks])

  const createUserLink = useCallback(
    async (appId: AppId) => {
      if (!engine || !selectedMutation?.id) {
        throw new Error('No mutation selected')
      }

      // All app instances with that id
      const appInstances = activeApps.filter((app) => app.id === appId)

      if (appInstances.length === 0) {
        throw new Error('The app is not active')
      }

      try {
        const createdLink = await engine.userLinkService.createLink(
          selectedMutation.id,
          appId,
          context
        )

        // ToDo: should we allow to run multiple instances for user link apps?
        const linkWithInstance = appInstances.map((instance) => ({
          ...createdLink,
          appInstanceId: instance.instanceId,
        }))

        setUserLinks((prev) => [...prev, ...linkWithInstance])
      } catch (err) {
        console.error(err)
      }
    },
    [engine, selectedMutation, context]
  )

  const deleteUserLink = useCallback(
    async (linkId: UserLinkId) => {
      try {
        await engine.userLinkService.deleteUserLink(linkId)
        setUserLinks((prev) => prev.filter((link) => link.id !== linkId))
      } catch (err) {
        console.error(err)
      }
    },
    [engine]
  )

  return { links, createUserLink, deleteUserLink, error }
}
