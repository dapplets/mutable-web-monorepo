import { FC } from 'react'
// import UnlinkOutlineIcon from '../assets/unlink-outline'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TAgent } from '../types'
import Spinner from './Spinner'
import { API_URL } from '@/env'

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
  const queryClient = useQueryClient()

  const handleToggleCapability = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capabilities'] })
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
      <button className="flex flex-1 flex-col gap-0.5 overflow-hidden" onClick={capabilitiy.action}>
        <div className="flex py-0.25 text-left text-[14px]/[100%] font-semibold wrap-anywhere">
          {capabilitiy.name}
        </div>
        <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-gray-text)">
          {capabilitiy.domain}
        </div>
      </button>
      <button
        className={`flex h-9 w-15 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-xs/[100%] font-normal dark:bg-(--color-light-white-bg) ${capabilitiy.isEnabled ? 'bg-(--color-my-primary) text-(--color-opposite-text) dark:text-(--color-my-primary)' : 'bg-(--color-opposite-text) text-(--color-gray-text) dark:text-(--color-gray-text)'} capitalize`}
        onClick={() =>
          handleToggleCapability.mutate({
            methodName: capabilitiy.isEnabled ? 'disableCapability' : 'enableCapability',
            params: {
              domain: capabilitiy.domain,
              name: capabilitiy.name,
            },
          })
        }
      >
        {handleToggleCapability.isPending ? (
          <Spinner />
        ) : capabilitiy.isEnabled ? (
          'active'
        ) : (
          'disabled'
        )}
      </button>
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
