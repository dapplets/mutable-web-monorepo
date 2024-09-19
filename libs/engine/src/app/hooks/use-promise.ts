import { useCallback, useState } from 'react'

export const usePromise = <T extends Function>({
  query,
  deps = [],
}: {
  query: T
  deps?: any[]
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // @ts-ignore
  const fetch: T = useCallback(async (...args: any[]) => {
    try {
      setIsLoading(true)
      await query(...args)
    } catch (err) {
      console.log(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }, deps)

  return {
    fetch,
    isLoading,
    error,
  }
}
