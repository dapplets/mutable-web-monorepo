import { FC, useMemo } from 'react'
// import UnlinkOutlineIcon from '../assets/unlink-outline'
import ArrowForwardIcon from '@/assets/arrow-forward'
import { Switch } from '@/components/ui/switch'
import { API_URL } from '@/env'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { TAgent } from '../types'

const mutationFn = async ({
  methodName,
  params,
}: {
  methodName: string
  params?: { [key: string]: string | number }
}) => {
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
      method: methodName,
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

type TAgentProps = {
  capabilitiy: TAgent
}

const Agent: FC<TAgentProps> = ({ capabilitiy }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleToggleCapability = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capabilities'] })
    },
  })

  const action = useMemo(() => {
    if (capabilitiy.name === 'news-monitor') return () => navigate('/news-monitor')
  }, [capabilitiy, navigate])

  const handleChangeStatus = () =>
    handleToggleCapability.mutate({
      methodName: capabilitiy.isEnabled ? 'disableCapability' : 'enableCapability',
      params: {
        domain: capabilitiy.domain,
        name: capabilitiy.name,
      },
    })

  // const handleRemoveCapability = useMutation({
  //   mutationFn,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['capabilities'] })
  //   },
  // })
  return (
    <div className="flex w-full items-center justify-between gap-3.5 rounded-[10px] bg-(--color-light-white-bg) p-2.5">
      <button className="flex flex-1 flex-col gap-0.5 overflow-hidden" onClick={action}>
        <div className="flex items-center gap-2 py-0.25 text-left text-[14px]/[100%] font-semibold wrap-anywhere">
          {capabilitiy.title ?? capabilitiy.name}
          {action ? <ArrowForwardIcon /> : null}
        </div>
        <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-gray-text)">
          {capabilitiy.domain}
        </div>
      </button>

      <Switch onCheckedChange={handleChangeStatus} checked={capabilitiy.isEnabled} />
      {/* <button
        className="mr-1 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
        onClick={() =>
            handleRemoveCapability.mutate({
              methodName: 'removeCapability',
              params: {
                domain: capabilitiy.domain,
                name: capabilitiy.name,
              },
            })}
      >
        {handleRemoveCapability.isPending ? <Spinner /> : <UnlinkOutlineIcon />}
      </button> */}
    </div>
  )
}

export default Agent
