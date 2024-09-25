import React from 'react'
import { FC } from 'react'
import ReactDiffViewer from 'react-diff-viewer'

export const PrReviewer: FC = () => {
  const oldCode = `
    import React from 'react'
    import { FC } from 'react'
    import ReactDiffViewer from 'react-diff-viewer';
    `

  const newCode = `
    import React from 'react'
    import { ReactDiffViewer } from 'react-diff-viewer';
    const test;
    `
  return <ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} />
}
