import { Switch } from '@/components/ui/switch'
import { API_URL } from '@/env'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const queryFn =
  (tgDataStr: string, name: string, params?: { [key: string]: string }) => async () => {
    if (!tgDataStr) {
      throw new Error('Telegram is not available')
    }
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tgDataStr}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: name,
        params: params ?? {},
        id: 1,
      }),
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.result
  }

const mutationFn = async (isDevModeTurnedOn: boolean) => {
  if (!window.Telegram.WebApp.initData) {
    throw new Error('Telegram is not available')
  }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${window.Telegram.WebApp.initData}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: isDevModeTurnedOn ? 'disableDevMode' : 'enableDevMode',
      params: {},
      id: 1,
    }),
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const data = await response.json()
  return data.result
}

const DeveloperMode = () => {
  const queryClient = useQueryClient()
  const tgDataStr = window.Telegram.WebApp.initData
  const { data: isDevModeTurnedOn } = useQuery<boolean>({
    queryKey: ['dev-mode', tgDataStr],
    queryFn: queryFn(tgDataStr, 'getDevMode'),
  })

  const switchDveloperMode = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dev-mode'] })
    },
  })
  return (
    <div className="z-1 flex w-full items-center justify-between ps-2.5 pe-5">
      <span className="text-[18px]/[150%] font-normal text-(--color-main-text)">
        Developer mode
      </span>
      <Switch
        disabled={isDevModeTurnedOn === undefined}
        onCheckedChange={() =>
          isDevModeTurnedOn !== undefined && switchDveloperMode.mutate(isDevModeTurnedOn)
        }
        checked={isDevModeTurnedOn}
      />
    </div>
  )
}

export default DeveloperMode
