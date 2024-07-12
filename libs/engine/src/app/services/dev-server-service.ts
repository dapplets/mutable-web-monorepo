export type BosRedirectMap = {
  [componentId: string]: { code: string }
}

export const getRedirectMap = async (bosLoaderUrl: string) => {
  const res = await fetch(bosLoaderUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Dev server is not available')
  }

  const data = await res.json()

  return data?.components ?? null
}
