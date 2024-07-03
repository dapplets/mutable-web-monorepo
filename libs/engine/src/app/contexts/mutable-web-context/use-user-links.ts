import { useCallback, useEffect, useState } from 'react'
import { IContextNode } from '../../../../core'
import { BosUserLink, UserLinkId } from '../../services/user-link/user-link.entity'
import { useMutableWeb } from '.'
import { MutationId } from '../../services/mutation/mutation.entity'
import { AppId } from '../../services/application/application.entity'

export const useUserLinks = (context: IContextNode) => {
  const { engine, selectedMutation, activeApps } = useMutableWeb()
  const [userLinks, setUserLinks] = useState<BosUserLink[]>([])
  const [error, setError] = useState<Error | null>(null)

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

  return { userLinks, createUserLink, deleteUserLink, error }
}
