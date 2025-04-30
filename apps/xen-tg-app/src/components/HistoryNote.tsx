import { FC } from 'react'
import { THistoryNote } from '../types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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
    <div className="flex w-full items-center justify-between gap-3.5 rounded-[10px] bg-(--color-light-white-bg) px-2.5 py-1.5 has-[[data-state='open']]:bg-[#ffffff19]">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="w-full cursor-pointer">
            <HistoryCard note={note} />
          </AccordionTrigger>
          <AccordionContent className="mt-2.5 flex flex-col gap-2.5 border-t-[1px] border-t-[#07070719] pt-2.5 dark:border-t-[#f8f9ff19]">
            <div>
              <div className="text-xs text-(--color-gray-text)">Execution input</div>
              <div>{note.data.input}</div>
            </div>
            <div>
              <div className="text-xs text-(--color-gray-text)">Output</div>
              <div>{note.data.output}</div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default HistoryNote
