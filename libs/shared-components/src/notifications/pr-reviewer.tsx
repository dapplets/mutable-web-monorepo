import React, { useEffect, useRef } from 'react'
import { FC } from 'react'
import CodeMirrorMerge from 'react-codemirror-merge'
import { langs } from '@uiw/codemirror-extensions-langs'

export interface Props {
  originalCode: string
  modifiedCode: string
}

export const PrReviewer: FC<Props> = ({ originalCode, modifiedCode }) => {
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
      }
    })

    observer.observe(document.head, { childList: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} style={{ overflowY: 'scroll', maxHeight: 630 }}>
      <CodeMirrorMerge>
        <CodeMirrorMerge.Original
          value={originalCode}
          editable={false}
          extensions={[langs.json()]}
        />
        <CodeMirrorMerge.Modified
          value={modifiedCode}
          editable={false}
          extensions={[langs.json()]}
        />
      </CodeMirrorMerge>
    </div>
  )
}
