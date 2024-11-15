import { useMutableWeb, useMutationVersions } from '@mweb/engine'
import React from 'react'
import { FC } from 'react'

const LatestKey = 'latest'

export const MutationVersionDropdown: FC<{ mutationId: string | null }> = ({ mutationId }) => {
  const {
    switchMutationVersion,
    selectedMutation,
    mutationVersions: currentMutationVersions,
  } = useMutableWeb()
  const { mutationVersions, areMutationVersionsLoading } = useMutationVersions(mutationId)

  if (!mutationId) {
    return null
  }

  if (!selectedMutation || areMutationVersionsLoading) {
    return <div>Loading...</div>
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (mutationId) {
      switchMutationVersion(
        mutationId,
        e.target.value === LatestKey ? null : e.target.value?.toString()
      )
    }
  }

  return (
    <select onChange={handleChange} value={currentMutationVersions[mutationId] ?? LatestKey}>
      {mutationVersions.map((version) => (
        <option key={version.version} value={version.version}>
          v{version.version}
        </option>
      ))}
      <option value={LatestKey}>latest</option>
    </select>
  )
}
