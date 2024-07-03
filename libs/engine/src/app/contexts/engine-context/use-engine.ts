import { useContext } from 'react'
import { EngineContext } from './engine-context'

export function useEngine() {
  return useContext(EngineContext)
}
