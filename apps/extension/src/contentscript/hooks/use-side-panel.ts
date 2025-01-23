import { IContextNode } from '@mweb/core'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'
import { EventEmitter as NEventEmitter } from 'events'
import { useMutableWeb } from '@mweb/engine'

export const useSidePanel = () => {
  const { tree, selectedMutationId, switchMutation } = useMutableWeb()
  const [port, setPort] = useState<browser.Runtime.Port | null>(null)

  useEffect(() => {
    if (!tree) return

    // ToDo: get rid of this
    const ee = new NEventEmitter()

    function handleChildContextAdded({ child }: { child: IContextNode }) {
      ee.emit('childContextAdded', child.toTransferable({ dir: 'up' }))

      child.on('childContextAdded', handleChildContextAdded)
      child.on('childContextRemoved', ({ child }) => {
        ee.emit('childContextRemoved', child.toTransferable({ dir: 'up' }))
      })
      child.on('contextChanged', () => {
        ee.emit('contextChanged', child.toTransferable({ dir: 'up' }))
      })
    }

    handleChildContextAdded({ child: tree })

    const handleConnect = (port: browser.Runtime.Port) => {
      if (port.name !== 'sp-to-cs') {
        port.disconnect()
        return
      }

      const handleChildContextAdded = (data: IContextNode) =>
        port.postMessage({ type: 'childContextAdded', data })
      const handleChildContextRemoved = (data: IContextNode) =>
        port.postMessage({ type: 'childContextRemoved', data })
      const handleContextChanged = (data: IContextNode) =>
        port.postMessage({ type: 'contextChanged', data })

      ee.on('childContextAdded', handleChildContextAdded)
      ee.on('childContextRemoved', handleChildContextRemoved)
      ee.on('contextChanged', handleContextChanged)
      ee.on('disconnect', () => port.disconnect())

      port.onMessage.addListener((message: any) => {
        if (message.type === 'switchMutation') {
          switchMutation(message.data)
        }
      })

      port.onDisconnect.addListener(() => {
        ee.removeListener('childContextAdded', handleChildContextAdded)
        ee.removeListener('childContextRemoved', handleChildContextRemoved)
        ee.removeListener('contextChanged', handleContextChanged)
        setPort(null)
      })

      setPort(port)
    }

    browser.runtime.onConnect.addListener(handleConnect)

    return () => {
      browser.runtime.onConnect.removeListener(handleConnect)
      ee.emit('disconnect')
      ee.removeAllListeners('childContextAdded')
      ee.removeAllListeners('childContextRemoved')
      ee.removeAllListeners('contextChanged')
    }
  }, [tree])

  useEffect(() => {
    port?.postMessage({ type: 'setSelectedMutationId', data: selectedMutationId })
  }, [port, selectedMutationId])

  useEffect(() => {
    port?.postMessage({ type: 'contextTree', data: tree?.toTransferable({ dir: 'down' }) })
  }, [port, tree])
}
