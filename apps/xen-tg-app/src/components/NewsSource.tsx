import FilePlusIcon from '@/assets/file-plus'
import PlusIcon from '@/assets/plus'
import RedditIcon from '@/assets/reddit.svg'
import TelegramIcon from '@/assets/telegram.svg'
import TrashIcon from '@/assets/trash'
import { API_URL } from '@/env'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FC, useEffect, useRef, useState } from 'react'
import { TSubscription } from '../types'
import Spinner from './Spinner'

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

export const NewSubscription: FC<{ onClose: () => void }> = ({ onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [newLink, setNewLink] = useState('')
  const [showWrongSubscriptionNameMessage, setShowWrongSubscriptionNameMessage] = useState(false)
  const queryClient = useQueryClient()
  const addSubscription = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] }).then(onClose)
    },
  })

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [inputRef])

  const onSubmit = () => {
    const isValidated = /^r\/[a-zA-Z0-9_]+$/.test(newLink) // ToDo: hardcoded for Reddit
    if (!isValidated) {
      setShowWrongSubscriptionNameMessage(true)
    } else {
      addSubscription.mutate({
        methodName: 'addSubscription',
        params: {
          source: 'reddit', // ToDo: hardcoded
          link: newLink,
        },
      })
    }
  }

  return (
    <div className="flex w-full flex-col items-center justify-between gap-2 rounded-[10px] bg-[#ffffff] px-2.5 py-1.5 dark:bg-[#f8f9ff4c]">
      <form className="flex w-full items-center justify-between gap-3.5" action={onSubmit}>
        <img src={RedditIcon} alt="Reddit icon" />

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <input
            ref={inputRef}
            name="new-address"
            className="border-none, flex py-0.25 text-[14px]/[100%] font-semibold wrap-anywhere outline-none"
            value={newLink}
            onChange={(e) => {
              setShowWrongSubscriptionNameMessage(false)
              setNewLink(e.target.value)
            }}
          />
        </div>

        <button
          type="submit"
          className={`flex h-8 w-15 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[10px] bg-(--color-green) text-xs/[100%] font-normal text-(--color-opposite-text) capitalize dark:bg-(--color-main-text) dark:text-(--color-opposite-text)`}
          disabled={
            showWrongSubscriptionNameMessage ||
            addSubscription.isPending ||
            addSubscription.isSuccess
          }
        >
          {addSubscription.isPending || addSubscription.isSuccess ? (
            <Spinner />
          ) : (
            <>
              <FilePlusIcon /> Add
            </>
          )}
        </button>

        <button
          className="mr-1 flex cursor-pointer p-1.5 text-(--color-gray-text) transition hover:not-disabled:text-(--color-main-text)"
          disabled={addSubscription.isPending || addSubscription.isSuccess}
          onClick={() => {
            setShowWrongSubscriptionNameMessage(false)
            setNewLink('')
            onClose()
          }}
        >
          <div className="flex rotate-45 items-center justify-center">
            <PlusIcon />
          </div>
        </button>
      </form>
      {showWrongSubscriptionNameMessage ? (
        <div className="text-destructive flex w-full items-center gap-1 ps-10 text-xs">
          <p>
            <b>Error:</b> Subscription name is invalid. It's supposed to look like <b>r/beatles</b>
          </p>
        </div>
      ) : null}
    </div>
  )
}

export const Subscription: FC<{ subscription: TSubscription }> = ({ subscription }) => {
  const queryClient = useQueryClient()
  const handleRemoveSubscription = useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  })

  const handleToggleSubscription = useMutation({
    mutationFn,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  })

  const onRemove = () =>
    handleRemoveSubscription.mutate({
      methodName: 'removeSubscription',
      params: {
        id: subscription.id,
      },
    })

  const onEnable = () =>
    handleToggleSubscription.mutate({
      methodName: 'enableSubscription',
      params: {
        id: subscription.id,
      },
    })

  const onDisable = () =>
    handleToggleSubscription.mutate({
      methodName: 'disableSubscription',
      params: {
        id: subscription.id,
      },
    })

  return (
    <div className="flex w-full items-center justify-between gap-3.5 rounded-[10px] bg-(--color-light-white-bg) px-2.5 py-1.5">
      <img
        src={subscription.source === 'telegram' ? TelegramIcon : RedditIcon}
        alt={subscription.source === 'telegram' ? 'Telegram icon' : 'Reddit icon'}
      />

      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <div className="flex py-0.25 text-[14px]/[100%] font-semibold wrap-anywhere">
          {subscription.link}
        </div>
        {subscription.source ? (
          <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-gray-text)">
            {subscription.source}
          </div>
        ) : null}
      </div>

      <button
        className={`flex h-9 w-15 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-xs/[100%] font-normal select-none dark:bg-(--color-light-white-bg) ${subscription.isEnabled ? 'bg-(--color-my-primary) text-(--color-opposite-text) dark:text-(--color-my-primary)' : 'bg-(--color-opposite-text) text-(--color-gray-text) dark:text-(--color-gray-text)'} capitalize`}
        onClick={subscription.isEnabled ? onDisable : onEnable}
      >
        {handleToggleSubscription.isPending ? (
          <Spinner />
        ) : subscription.isEnabled ? (
          'active'
        ) : (
          'disabled'
        )}
      </button>

      <button
        style={{
          visibility: subscription.source === 'telegram' ? 'hidden' : 'visible',
        }}
        className="mr-1 flex w-8 cursor-pointer items-center justify-center py-1.5 text-(--color-gray-text) transition hover:text-(--color-main-text)"
        onClick={onRemove}
      >
        {handleRemoveSubscription.isPending || handleRemoveSubscription.isSuccess ? (
          <Spinner />
        ) : (
          <TrashIcon />
        )}
      </button>
    </div>
  )
}
