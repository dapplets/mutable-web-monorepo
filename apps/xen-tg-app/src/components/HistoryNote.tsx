import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { formatNearAmount } from '@/lib/utils'
import { FC } from 'react'
import { THistoryNote } from '../types'

export const HistoryCard: FC<{ note: THistoryNote }> = ({ note }) => {
  const amountInNear = formatNearAmount(note.amount)
  const amountInNearRounded = amountInNear.slice(0, amountInNear.indexOf('.') + 4)
  return (
    <div className="flex items-center justify-between gap-2.5">
      <div className="flex w-max min-w-12 shrink-0 flex-col items-start gap-0.5">
        {note.isFree ? (
          <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-my-primary)">
            FREE
          </div>
        ) : null}
        <div className="flex w-max shrink-0 py-0.25 text-[14px]/[150%] font-semibold">
          {(note.operationType === 'income' ? '+ ' : '- ') + amountInNearRounded}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-gray-text)">
          {new Date(note.createdAt).toLocaleString()}
        </div>
        <div className="flex py-0.25 text-[14px]/[150%] font-semibold wrap-anywhere">
          {note.capabilityName}
        </div>
      </div>
    </div>
  )
}

type THistoryNoteProps = {
  note: THistoryNote
}

const HistoryNote: FC<THistoryNoteProps> = ({ note }) => (
  <AccordionItem
    value={note.id + ''}
    className="flex w-full flex-col gap-2.5 rounded-[10px] border-b-0 bg-(--color-light-white-bg) px-2.5 py-1.5 has-[[data-state='open']]:bg-[#ffffff7c] dark:has-[[data-state='open']]:bg-[#ffffff19]"
  >
    <AccordionTrigger className="w-full cursor-pointer items-center justify-between [&[data-state=open]>svg]:text-(--color-my-primary)">
      <HistoryCard note={note} />
    </AccordionTrigger>
    <AccordionContent className="flex flex-col gap-2.5 border-t-[1px] border-t-(--color-opposite-text)/80 pt-2.5 dark:border-t-(--color-main-text)/10">
      <div>
        <div className="text-xs text-(--color-gray-text)">Execution input</div>
        <div>{note.executionInput}</div>
      </div>
      <div>
        <div className="text-xs text-(--color-gray-text)">Output</div>
        <div>{note.executionOutput}</div>
      </div>
    </AccordionContent>
  </AccordionItem>
)

export default HistoryNote
