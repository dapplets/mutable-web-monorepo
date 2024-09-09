import { useCallback, useEffect, useMemo, useState } from 'react'
import { IContextNode } from '@mweb/core'
import { BosUserLink, UserLinkId } from '../../services/user-link/user-link.entity'
import { useMutableWeb } from '.'
import { AppId } from '../../services/application/application.entity'

// Reuse reference to empty array to avoid unnecessary re-renders
const NoLinks: BosUserLink[] = []

export const useUserLinks = (context: IContextNode) => {
  const { engine, selectedMutation, activeApps } = useMutableWeb()
  const [userLinks, setUserLinks] = useState<BosUserLink[]>([])
  const [error, setError] = useState<Error | null>(null)

  const staticLinks = useMemo(() => {
    if (!engine || !selectedMutation?.id) {
      return []
    } else {
      return engine.userLinkService.getStaticLinksForApps(activeApps, context)
    }
  }, [engine, selectedMutation, activeApps, context.parsedContext, context.isVisible])

  const fetchUserLinks = useCallback(async () => {
    if (!engine || !selectedMutation?.id) {
      setUserLinks([])
      return
    }

    try {
      const links = await engine.userLinkService.getLinksForContext(
        activeApps,
        selectedMutation.id,
        context
      )
      setUserLinks(links)
    } catch (err) {
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

  const links = useMemo(() => {
    return userLinks.length || staticLinks.length ? [...userLinks, ...staticLinks] : NoLinks
  }, [userLinks, staticLinks])

  const createUserLink = useCallback(
    async (appId: AppId) => {
      if (!engine || !selectedMutation?.id) {
        throw new Error('No mutation selected')
      }

      try {
        const createdLink = await engine.userLinkService.createLink(
          selectedMutation.id,
          appId,
          context
        )

        setUserLinks((prev) => [...prev, createdLink])
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
