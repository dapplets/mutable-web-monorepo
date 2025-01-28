import { IContextNode, PureContextNode, TransferableContextNode } from '@mweb/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import browser from 'webextension-polyfill'
import ContentScript from '../common/content-script'
import { WildcardEventEmitter } from '../common/wildcard-event-emitter'
import { createEventEmitterToPort } from '../common/create-event-emitter-to-port'

async function getCurrentTabId(): Promise<number | null> {
  const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true })
  return currentTab?.id ?? null
}

export const useCurrentTab = () => {
  const [tree, setTree] = useState<IContextNode | null>(null)
  const [selectedMutationId, setSelectedMutationId] = useState<string | null>(null)
  const [eventEmitter, setEventEmitter] = useState<WildcardEventEmitter | null>(null)
  const portRef = useRef<browser.Runtime.Port | null>(null)

  useEffect(() => {
    const connectToTab = async (tabId: number | null = null) => {
      portRef.current?.disconnect()
      portRef.current = null

      setTree(null)
      setSelectedMutationId(null)
      setEventEmitter(null)

      if (!tabId) return

      const isAlive = await ContentScript(tabId)
        .isAlive()
        .then(() => true)
        .catch(() => false)

      if (!isAlive) return

      portRef.current = browser.tabs.connect(tabId, { name: 'sp-to-cs' })

      const { eventEmitter, destroy } = createEventEmitterToPort(portRef.current)

      setEventEmitter(eventEmitter)

      portRef.current.onMessage.addListener((msg: any) => {
        // ToDo: handle childContextRemoved, contextChanged
        if (msg.type === 'setSelectedMutationId') {
          setSelectedMutationId(msg.data)
        } else if (msg.type === 'contextTree') {
          setTree(PureContextNode.fromTransferable(msg.data))
        } else if (msg.type === 'childContextAdded') {
          function updateTree(node: TransferableContextNode): IContextNode | null {
            if (!node.parentNode) return tree

            const clonedParentNode = updateTree(node.parentNode)

            if (!clonedParentNode) return null

            for (const child of clonedParentNode.children) {
              // ToDo: this expression are repeated too often
              if (
                child.namespace === node.namespace &&
                child.contextType === node.contextType &&
                child.id === node.id
              ) {
                return child
              }
            }

            const newNode = PureContextNode.fromTransferable(node)

            clonedParentNode.appendChild(newNode)

            return newNode
          }

          updateTree(msg.data)
        }
      })

      portRef.current.onDisconnect.addListener(() => {
        destroy()
        // Delay before reconnecting to prevent immediate retries in rapid succession
        // ToDo: find a better solution
        setTimeout(() => {
          getCurrentTabId().then(connectToTab)
        }, 1000)
      })
    }

    getCurrentTabId().then(connectToTab)

    const handleTabUpdated = (
      tabId: number,
      changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
      tab: browser.Tabs.Tab
    ) => {
      if (changeInfo.status && tab.active && tab.status === 'complete') {
        connectToTab(tabId)
      }
    }

    const handleTabActivated = (activeInfo: browser.Tabs.OnActivatedActiveInfoType) => {
      connectToTab(activeInfo.tabId)
    }

    browser.tabs.onActivated.addListener(handleTabActivated)
    browser.tabs.onUpdated.addListener(handleTabUpdated) // ToDo: add active check

    return () => {
      browser.tabs.onActivated.removeListener(handleTabActivated)
      browser.tabs.onUpdated.removeListener(handleTabUpdated)
      portRef.current?.disconnect()
      portRef.current = null
    }
  }, [])

  const switchMutation = useCallback((mutationId: string | null) => {
    if (!portRef.current) return

    portRef.current.postMessage({ type: 'switchMutation', data: mutationId })
  }, [])

  return { tree, selectedMutationId, switchMutation, eventEmitter }
}
