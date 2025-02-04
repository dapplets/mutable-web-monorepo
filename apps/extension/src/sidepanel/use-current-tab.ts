import { IContextNode, PureContextNode, TransferableContextNode } from '@mweb/core'
import { useEffect, useRef, useState } from 'react'
import browser from 'webextension-polyfill'
import ContentScript from '../common/content-script'
import { WildcardEventEmitter } from '../common/wildcard-event-emitter'
import { connectEventEmitterWithPort } from '../common/connect-event-emitter-with-port'

async function getCurrentTabId(windowId: number): Promise<number | null> {
  const [currentTab] = await browser.tabs.query({ active: true, windowId })
  return currentTab?.id ?? null
}

export const useCurrentTab = (windowId: number) => {
  const [tree, setTree] = useState<IContextNode | null>(null)
  const [eventEmitter, setEventEmitter] = useState<WildcardEventEmitter | null>(null)
  const portRef = useRef<browser.Runtime.Port | null>(null)

  useEffect(() => {
    const connectToTab = async (tabId: number | null = null) => {
      portRef.current?.disconnect()
      portRef.current = null

      setTree(null)
      setEventEmitter(null)

      if (!tabId) return

      const isAlive = await ContentScript(tabId)
        .isAlive()
        .then(() => true)
        .catch(() => false)

      if (!isAlive) return

      portRef.current = browser.tabs.connect(tabId, { name: 'sp-to-cs' })

      const eventEmitter = new WildcardEventEmitter()

      const { disconnect } = connectEventEmitterWithPort(portRef.current, eventEmitter)

      setEventEmitter(eventEmitter)

      let currentTree: IContextNode | null = null

      portRef.current.onMessage.addListener((msg: any) => {
        // ToDo: handle childContextRemoved, contextChanged
        if (msg.type === 'contextTree') {
          currentTree = PureContextNode.fromTransferable(msg.data)
          setTree(currentTree)
        } else if (msg.type === 'childContextAdded') {
          function updateTree(node: TransferableContextNode): IContextNode | null {
            if (!node.parentNode) return currentTree

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
        disconnect()
        // Delay before reconnecting to prevent immediate retries in rapid succession
        // ToDo: find a better solution
        setTimeout(() => {
          getCurrentTabId(windowId).then(connectToTab)
        }, 1000)
      })
    }

    getCurrentTabId(windowId).then(connectToTab)

    return () => {
      portRef.current?.disconnect()
      portRef.current = null
    }
  }, [windowId])

  return { tree, eventEmitter }
}
