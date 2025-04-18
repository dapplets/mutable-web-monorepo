import { FC } from 'react'
import Trash from '../assets/trash'
import { TMemory } from '../types'

type TMemoryProps = {
  memory: TMemory
  onDisconnect: () => void
}

const Memory: FC<TMemoryProps> = ({ memory, onDisconnect }) => {
  console.log(memory)

  return (
    <div className="flex w-full items-center justify-between gap-3.5 rounded-[10px] bg-(--color-light-white-bg) p-2.5">
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-gray-text)">
          {memory.timestamp}
        </div>
        <div className="flex py-0.25 text-[14px]/[150%] font-semibold">{memory.text}</div>
      </div>
      <button
        className="mr-1 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-white-text)"
        onClick={onDisconnect}
      >
        <Trash />
      </button>
    </div>
  )
}

export default Memory
