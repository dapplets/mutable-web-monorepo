import CodeMirror from '@uiw/react-codemirror'
import React, { useCallback, useMemo, useState } from 'react'
import { langs } from '@uiw/codemirror-extensions-langs'
import toJson from 'json-stringify-deterministic'

const extensions = [langs.json()] // ToDo: turn on in prod mode

const CodeEditor = ({ parserConfig }: { parserConfig: any }) => {
  const sourceJson = useMemo(() => toJson(parserConfig, { space: '  ' }), [parserConfig])
  const [jsonData, setJsonData] = useState<string>(sourceJson)

  const onChangeJsonData = useCallback((val: string, viewUpdate: any) => {
    console.log('val:', val)
    console.log('viewUpdate:', viewUpdate)
    setJsonData(val)
  }, [])

  return (
    <CodeMirror
      value={jsonData}
      height="500px"
      onChange={onChangeJsonData}
      extensions={extensions} // ToDo: turn on in prod mode
    />
  )
}

export default CodeEditor
