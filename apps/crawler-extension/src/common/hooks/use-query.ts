import { useEffect, useState } from 'react'

export const useQuery = <T>(callback: () => Promise<T>) => {
  const [state, setState] = useState<undefined | T>(undefined)

  useEffect(() => {
    callback().then(setState)
  }, [callback])

  return state
}
