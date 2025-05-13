import { FC, useEffect, useMemo } from 'react'
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

  useEffect(() => handleToggleCapability.reset(), [capabilitiy])

  // const handleRemoveCapability = useMutation({
  //   mutationFn,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['capabilities'] })
  //   },
  // })
  return (
    <div className="flex w-full items-center justify-between gap-3.5 rounded-[10px] bg-(--color-light-white-bg) px-2.5 py-1.5">
      <button
        className={`flex flex-1 ${action ? 'cursor-pointer' : 'cursor-default'} flex-col gap-0.5 overflow-hidden`}
        onClick={action}
      >
        <div className="group flex items-center gap-2 pt-1 pb-0.25 text-left text-[14px]/[125%] font-semibold wrap-anywhere">
          {capabilitiy.title ?? capabilitiy.name}
          {action ? (
            <div className="text-[#7A818B] transition group-hover:text-(--color-main-text)">
              <ArrowForwardIcon />
            </div>
          ) : null}
        </div>
        {capabilitiy.title ? (
          <div className="flex p-0 text-left text-[12px]/[100%] font-normal wrap-anywhere text-(--color-gray-text)">
            {capabilitiy.name}
          </div>
        ) : null}
        <div className="flex pt-1.25 pb-0 text-[12px]/[100%] font-normal text-(--color-gray-text)">
          {capabilitiy.domain}
        </div>
      </button>

      <Switch
        onCheckedChange={handleChangeStatus}
        checked={capabilitiy.isEnabled}
        disabled={handleToggleCapability.isPending || handleToggleCapability.isSuccess}
      />
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
