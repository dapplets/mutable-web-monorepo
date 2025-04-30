import { Switch } from '@/components/ui/switch'
import { API_URL } from '@/env'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ThemeButton from './ThemeButton'

const queryFn = (name: string, params?: { [key: string]: string }) => async () => {
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
  const { data: isDevModeTurnedOn } = useQuery<boolean>({
    queryKey: ['dev-mode'],
    queryFn: queryFn('getDevMode'),
  })

  const switchDveloperMode = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dev-mode'] })
    },
  })
  return (
    <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-80">
      <div className="z-1 flex w-full items-center justify-between ps-2.5 pe-6">
        <span className="py-2.5 text-[18px]/[150%] font-normal text-(--color-main-text)">
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
      <div className="z-1 flex w-full items-center justify-between ps-2.5 pe-7">
        <span className="py-2.5 text-[18px]/[150%] font-normal text-(--color-main-text)">
          Color scheme
        </span>
        <ThemeButton />
      </div>
    </div>
  )
}

export default DeveloperMode
