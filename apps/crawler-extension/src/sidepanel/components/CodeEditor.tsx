import { ParserConfig } from '@mweb/core'
import { UseMutateFunction } from '@tanstack/react-query'
import { langs } from '@uiw/codemirror-extensions-langs'
import { Button, Flex } from 'antd'
import toJson from 'json-stringify-deterministic'
import React, { useEffect, useMemo, useState } from 'react'
import CodeMirrorMerge from 'react-codemirror-merge'
import styled from 'styled-components'

const Original = CodeMirrorMerge.Original
const Modified = CodeMirrorMerge.Modified

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px;
  overflow: scroll;

  .cm-mergeViewEditors > .cm-mergeViewEditor:first-child {
    display: none;
  }
`

const extensions = [langs.json()] // ToDo: turn on in prod mode

type TEditorProps = {
  parserConfig: any
  saveParserConfig: UseMutateFunction<void, Error, ParserConfig, unknown>
  isLocalParserSaving: boolean
}

const CodeEditor = ({ parserConfig, saveParserConfig, isLocalParserSaving }: TEditorProps) => {
  const sourceJson = useMemo(() => toJson(parserConfig, { space: '  ' }), [parserConfig])
  const [jsonData, setJsonData] = useState<string>(sourceJson)
  const [isButtonsDisplayed, setIsButtonsDisplayed] = useState<boolean>(false)

  useEffect(() => {
    if (!isButtonsDisplayed && jsonData !== sourceJson) setIsButtonsDisplayed(true)
    if (isButtonsDisplayed && jsonData === sourceJson) setIsButtonsDisplayed(false)
  }, [jsonData])

  useEffect(() => setJsonData(sourceJson), [sourceJson])

  const saveConfig = () => {
    try {
      const data = JSON.parse(jsonData)
      saveParserConfig(data)
    } catch (error) {
      console.error('Error catched:', error)
    }
  }

  return (
    <Flex style={{ flexDirection: 'column', gap: 8 }}>
      <Flex
        style={{
          margin: 0,
          padding: 0,
          borderRadius: 8,
          overflow: 'hidden',
          flexDirection: 'column',
        }}
      >
        <Container>
          <CodeMirrorMerge destroyRerender={false}>
            <Original value={sourceJson} />
            <Modified
              value={jsonData}
              extensions={extensions}
              onChange={(val) => setJsonData(val)}
            />
          </CodeMirrorMerge>
        </Container>
      </Flex>

      {isButtonsDisplayed ? (
        <Flex style={{ gap: 8 }}>
          <Button loading={isLocalParserSaving} style={{ width: '100%' }} onClick={saveConfig}>
            Save
          </Button>
          <Button
            loading={isLocalParserSaving}
            style={{ width: '100%' }}
            onClick={() => setJsonData(sourceJson)}
          >
            Cancel
          </Button>
        </Flex>
      ) : null}
    </Flex>
  )
}

export default CodeEditor
