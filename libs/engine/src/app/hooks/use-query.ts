import { useCallback, useEffect, useState } from 'react'
import { usePromise } from './use-promise'

export const useQuery = <T>({
  query,
  initialData,
  deps = [],
}: {
  query: () => Promise<T>
  initialData: T
  deps: any[]
}) => {
  const [data, setData] = useState<T>(initialData)

  const { fetch, isLoading, error } = usePromise({
    query: async () => {
      const data = await query()
      setData(data)
    },
    deps,
  })

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, setData, isLoading, error }
}
