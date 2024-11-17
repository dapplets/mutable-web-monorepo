import { useContext } from 'react'
import { MutationsContext } from './mutations-context'

export function useMutations() {
  return useContext(MutationsContext)
}
