import React, { useEffect, useMemo, useRef } from 'react'
import { FC } from 'react'
import serializeToDeterministicJson from 'json-stringify-deterministic'
import CodeMirrorMerge from 'react-codemirror-merge'
import { NotificationDto, NotificationType, PullRequestPayload, useMutation } from '@mweb/engine'
import { langs } from '@uiw/codemirror-extensions-langs'

export interface Props {
  notification: NotificationDto
}

export const PrReviewer: FC<Props> = ({ notification }) => {
  if (notification.type !== NotificationType.PullRequest) {
    throw new Error('Only PullRequest notifications are supported')
  }

  const { sourceMutationId, targetMutationId } = notification.payload as PullRequestPayload

  const { mutation: source } = useMutation(sourceMutationId)
  const { mutation: target } = useMutation(targetMutationId)

  const containerRef = useRef<HTMLDivElement>(null)

  // ToDo: workaround that moves styles from head to shadow dom
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const styleElement = document.evaluate(
        "//head/style[contains(text(),'cm-')]",
        document.head,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue

      if (styleElement) {
        setTimeout(() => {
          containerRef.current!.append(styleElement)
        }, 10)
        observer.disconnect()
      }
    })

    observer.observe(document.head, { childList: true })
  }, [])

  const sourceJson = useMemo(() => serializeToDeterministicJson(source, { space: '  ' }), [])
  const targetJson = useMemo(() => serializeToDeterministicJson(target, { space: '  ' }), [])

  return (
    <div ref={containerRef} style={{ overflowY: 'scroll', maxHeight: 630 }}>
      <CodeMirrorMerge>
        <CodeMirrorMerge.Original value={targetJson} editable={false} extensions={[langs.json()]} />
        <CodeMirrorMerge.Modified value={sourceJson} editable={false} extensions={[langs.json()]} />
      </CodeMirrorMerge>
    </div>
  )
}
