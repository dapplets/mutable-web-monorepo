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

  const { applications } = useApplications()
  const { preferredSource } = usePreferredSource(mutationId)
  const { mutation: baseMutation } = useMutation(mutationId, preferredSource ?? undefined) // ToDo: fix
  const { mutations, isLoading } = useMutations(null) // ToDo: need context?

  const localMutations = useMemo(
    () => mutations.filter((m) => m.source === EntitySourceType.Local),
    [mutations]
  )

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
