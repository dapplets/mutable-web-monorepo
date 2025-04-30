import { FC } from 'react'
import { THistoryNote } from '../types'

export const HistoryCard: FC<{ note: THistoryNote }> = ({ note }) => {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <div className="flex min-w-12 flex-col items-center gap-0.5">
        {note.payment.isFree ? (
          <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-my-primary)">
            FREE
          </div>
        ) : null}
        <div className="flex py-0.25 text-[14px]/[150%] font-semibold">
          {(note.payment.direction === 'income' ? '+ ' : '- ') + note.payment.amount}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-gray-text)">
          {new Date(+note.datetime).toLocaleString()}
        </div>
        <div className="flex py-0.25 text-[14px]/[150%] font-semibold">{note.agent.name}</div>
      </div>
    </div>
  )
}

type THistoryNoteProps = {
  note: THistoryNote
}

const HistoryNote: FC<THistoryNoteProps> = ({ note }) => {
  return (
    <div className="flex w-full items-center justify-between gap-3.5 rounded-[10px] bg-(--color-light-white-bg) px-2.5 py-1.5">
      <HistoryCard note={note} />
    </div>
  )
}

export default HistoryNote
