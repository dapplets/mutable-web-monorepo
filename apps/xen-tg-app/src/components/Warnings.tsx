import { FC } from 'react'
import { TUserInfo, TWarning } from '../types'
import Trash from '../assets/trash'

type TWarningsProps = {
  user: TUserInfo | null
}

// ToDo: remove mocked data
const MOCKED_DATA: { warnings: TWarning[] } = {
  warnings: [
    {
      text: 'Something went wrong',
      timestamp: '2h ago',
    },
    {
      text: 'Something went wrong',
      timestamp: '2h ago',
    },
    {
      text: 'Something went wrong',
      timestamp: '2h ago',
    },
    {
      text: 'Something went wrong',
      timestamp: '2h ago',
    },
  ],
}

const Warnings: FC<TWarningsProps> = () => {
  const handleDeleteAll = () => {
    console.log('delete all')
  }

  return (
    <div className="flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5">
      <div className="my-1.5 flex w-full items-center justify-between">
        <h1 className="text-center text-2xl font-bold">Warnings</h1>
        <button
          className="me-3 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-white-text)"
          onClick={handleDeleteAll}
        >
          <Trash />
        </button>
      </div>
      {MOCKED_DATA.warnings.map((warning) => (
        <div key={warning.text} className="flex w-full items-center justify-between">
          <div className="flex py-2.75 text-[14px]/[100%] font-normal text-(--color-white-text)">
            {warning.text}
          </div>
          <div className="me-2.5 flex text-[14px]/[100%] font-normal text-(--color-gray-text)">
            {warning.timestamp}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Warnings
