import { EntitySourceType } from '@mweb/backend'
import { useApplications, useMutation, useMutations, usePreferredSource } from '@mweb/react-engine'
import React, { FC, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useEngine } from '../../contexts/engine-context'
import { MutationEditorModal } from '../../multitable-panel/components/mutation-editor-modal'

const EditMutation: FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const mutationId = `${params.authorId}/mutation/${params.localId}`

  const { tree } = useEngine()
  const { applications, isLoading: areAppsLoading } = useApplications()
  const { preferredSource, isLoading: isSourceLoading } = usePreferredSource(mutationId, tree?.id)
  const { mutation: baseMutation, isMutationLoading: isBaseMutationHookLoading } = useMutation(
    mutationId,
    preferredSource ?? undefined
  ) // ToDo: fix
  const { mutations, isLoading: areMutationsLoading } = useMutations(null) // ToDo: need context?

  const localMutations = useMemo(
    () => mutations.filter((m) => m.source === EntitySourceType.Local),
    [mutations]
  )

  // must not render MutationEditorModal if there is no base mutation
  const isBaseMutationLoading = isBaseMutationHookLoading || (mutationId && !baseMutation)
  const isLoading =
    areAppsLoading || isBaseMutationLoading || areMutationsLoading || isSourceLoading

  if (isLoading) {
    // ToDo: loader
    return null
  }

  return (
    <MutationEditorModal
      apps={applications}
      baseMutation={baseMutation}
      localMutations={localMutations}
      onClose={() => navigate(-1)}
    />
  )
}

export default EditMutation
