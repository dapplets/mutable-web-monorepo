import { FC } from 'react'
import UnlinkOutlineIcon from '../assets/unlink-outline'
import { TAgent } from '../types'

type TAgentProps = {
  agent: TAgent
  onDisconnect: () => void
}

const Agent: FC<TAgentProps> = ({ agent, onDisconnect }) => {
  console.log(agent)

  return (
    <div className="flex w-full items-center justify-between gap-3.5 rounded-[10px] bg-(--color-light-white-bg) p-2.5">
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex py-0.25 text-[14px]/[100%] font-semibold">{agent.name}</div>
        <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-gray-text)">
          {agent.source}
        </div>
      </div>
      <div
        className={`flex w-15 items-center justify-center rounded-[10px] bg-(--color-light-white-bg) py-3 text-xs/[100%] font-normal ${agent.status === 'active' ? 'text-(--color-my-primary)' : 'text-(--color-gray-text)'} capitalize`}
      >
        {agent.status}
      </div>
      <button
        className="mr-1 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-white-text)"
        onClick={onDisconnect}
      >
        <UnlinkOutlineIcon />
      </button>
    </div>
  )
}

export default Agent
