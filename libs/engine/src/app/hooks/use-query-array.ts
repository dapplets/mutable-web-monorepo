import { useQuery } from './use-query'

// Prevents rerendering when array is empty
const EmptyArray: any[] = []

export const useQueryArray = <T>({
  query,
  deps = [],
}: {
  query: () => Promise<T[]>
  deps: any[]
}) => {
  return useQuery<T[]>({
    query: async () => {
      const items = await query()
      return items.length === 0 ? (EmptyArray as T[]) : items
    },
    initialData: EmptyArray,
    deps,
  })
}
