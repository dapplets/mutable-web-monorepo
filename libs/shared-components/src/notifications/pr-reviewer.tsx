import React from 'react'
import { FC } from 'react'
import serializeToDeterministicJson from 'json-stringify-deterministic'
import CodeMirror from '@uiw/react-codemirror'
import { langs } from '@uiw/codemirror-extensions-langs'

export interface Props {
  reviewingObject: any
}

export const PrReviewer: FC<Props> = ({ reviewingObject }) => {
  const oldCode = serializeToDeterministicJson(reviewingObject, { space: '  ' })
  return (
    <CodeMirror
      value={oldCode}
      height="600px"
      width="472px"
      extensions={[langs.json()]}
      // onChange={onChange}
    />
  )
}
