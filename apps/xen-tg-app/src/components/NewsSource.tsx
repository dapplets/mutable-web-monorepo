import { FC } from 'react'
import Spinner from './Spinner'
import { TNewsSource } from '../types'
import TrashIcon from '@/assets/trash'
import PlusIcon from '@/assets/plus'
import FilePlusIcon from '@/assets/file-plus'

const NewsSource: FC<{ newsSource: TNewsSource }> = ({ newsSource }) => {
  const isPending = false // ToDo: hardcoded
  return (
    <div
      className={`flex w-full items-center justify-between gap-3.5 rounded-[10px] ${newsSource.isEnabled === undefined ? 'bg-[#ffffff] dark:bg-[#f8f9ff4c]' : 'bg-(--color-light-white-bg)'} px-2.5 py-1.5`}
    >
      {newsSource.icon ? <img src={newsSource.icon} /> : null}

      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <div className="flex py-0.25 text-[14px]/[100%] font-semibold wrap-anywhere">
          {newsSource.name}
        </div>
        {newsSource.domain ? (
          <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-gray-text)">
            {newsSource.domain}
          </div>
        ) : null}
      </div>

      {newsSource.isEnabled === undefined ? (
        <button
          className={`flex h-8 w-15 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[10px] bg-(--color-green) text-xs/[100%] font-normal text-(--color-opposite-text) capitalize dark:bg-(--color-main-text) dark:text-(--color-opposite-text)`}
          onClick={() => console.log('activate')}
        >
          {isPending ? (
            <Spinner />
          ) : (
            <>
              <FilePlusIcon /> Add
            </>
          )}
        </button>
      ) : (
        <button
          className={`flex h-9 w-15 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-xs/[100%] font-normal dark:bg-(--color-light-white-bg) ${newsSource.isEnabled ? 'bg-(--color-my-primary) text-(--color-opposite-text) dark:text-(--color-my-primary)' : 'bg-(--color-opposite-text) text-(--color-gray-text) dark:text-(--color-gray-text)'} capitalize`}
          onClick={() => console.log('activate')}
        >
          {isPending ? <Spinner /> : newsSource.isEnabled ? 'active' : 'disabled'}
        </button>
      )}

      <button
        className="mr-1 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
        onClick={() => console.log('delete')}
      >
        {isPending ? (
          <Spinner />
        ) : newsSource.isEnabled === undefined ? (
          <div className="flex rotate-45 items-center justify-center">
            <PlusIcon />
          </div>
        ) : (
          <TrashIcon />
        )}
      </button>
    </div>
  )
}

export default NewsSource
