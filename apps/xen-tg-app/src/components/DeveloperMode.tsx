import { Switch } from '@/components/ui/switch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const queryFn =
  (
    tgDataStr: string,
    tgDataObj: WebAppInitData,
    name: string,
    params?: { [key: string]: string }
  ) =>
  async () => {
    if (!tgDataStr) {
      throw new Error('Telegram is not available')
    }
    const response = await fetch('https://n8n.aigency.test.dapplets.org/webhook/rpc', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JSON.stringify(tgDataObj)}`,
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
  const response = await fetch('https://n8n.aigency.test.dapplets.org/webhook/rpc', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${JSON.stringify(window.Telegram.WebApp.initDataUnsafe)}`,
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
  const tgDataObj = window.Telegram.WebApp.initDataUnsafe
  const { data: isDevModeTurnedOn } = useQuery<boolean>({
    queryKey: ['dev-mode', tgDataStr, tgDataObj],
    queryFn: queryFn(tgDataStr, tgDataObj, 'getDevMode'),
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
