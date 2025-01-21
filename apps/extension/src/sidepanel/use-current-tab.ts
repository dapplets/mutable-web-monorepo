import { IContextNode, PureContextNode, TransferableContextNode } from '@mweb/core'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

export const useCurrentTab = () => {
  const [tree, setTree] = useState<IContextNode | null>(null)

  useEffect(() => {
    let port: browser.Runtime.Port | null = null

    const handleTabActivated = async () => {
      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true })

      port?.disconnect()
      port = null

      setTree(null)

      if (currentTab?.id) {
        port = browser.tabs.connect(currentTab.id, { name: 'sp-to-cs' })

        port.onMessage.addListener((msg: any) => {
          // ToDo: handle childContextRemoved, contextChanged
          if (msg.type === 'contextTree') {
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
      }
    }

    handleTabActivated()

    browser.tabs.onActivated.addListener(handleTabActivated)
    browser.tabs.onUpdated.addListener(handleTabActivated) // ToDo: add active check

    return () => {
      browser.tabs.onActivated.removeListener(handleTabActivated)
      browser.tabs.onUpdated.removeListener(handleTabActivated)
      port?.disconnect()
      port = null
    }
  }, [])

  return { tree }
}
