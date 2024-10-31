import { useQuery } from '@tanstack/react-query'
import { Layout as AntdLayout, Card, Descriptions, Flex, TreeSelect, Typography } from 'antd'
import React, { useMemo, useState } from 'react'
import { ClonedContextNode } from '../../common/types'
import { Layout } from '../components/layout'
import ContentScript from '../content-script'
import { TreeTraverser } from '../tree-traverser'

type ContextTypeTree = {
  value: string
  title: string
  children: ContextTypeTree[]
}

function extractContextTypesTree(nodes: ClonedContextNode[]): ContextTypeTree[] {
  const map = new Map<string, ClonedContextNode[]>()

  for (const node of nodes) {
    if (!map.has(node.contextType)) {
      map.set(node.contextType, [])
    }

    node.children.forEach((child) => map.get(node.contextType)!.push(child))
  }

  return Array.from(map.entries()).map(([contextType, children]) => ({
    value: contextType,
    title: contextType,
    children: extractContextTypesTree(children),
  }))
}

export const CollectedData: React.FC = () => {
  const [contextTypes, setContextTypes] = useState<string[]>([])

  const { data: contextTree } = useQuery<ClonedContextNode | null>({
    queryFn: ContentScript.getContextTree,
    queryKey: ['getContextTree'],
    initialData: null,
    refetchInterval: 1000,
  })

  const contextTypesTree = useMemo(
    () => extractContextTypesTree(contextTree ? [contextTree] : []),
    [contextTree]
  )

  if (!contextTree) {
    return <Layout>No context tree</Layout>
  }

  const handleContextTypeChange = (values: string[]) => {
    setContextTypes(values)
  }

  return (
    <AntdLayout style={{ padding: 16 }}>
      <Typography.Title level={4} style={{ margin: '0 0 1em 0' }}>
        Collected Data
      </Typography.Title>
      <Flex vertical gap="small">
        <TreeSelect
          style={{ width: '100%' }}
          value={contextTypes}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treeData={contextTypesTree}
          placeholder="Please select"
          treeDefaultExpandAll
          onChange={handleContextTypeChange}
          multiple
        />
        <TreeTraverser
          node={contextTree}
          component={({ node }) => {
            if (!contextTypes.includes(node.contextType) && contextTypes.length > 0) return null
            return (
              <Card size="small">
                <Descriptions size="small">
                  <Descriptions.Item style={{ padding: 0 }} label="Namespace">
                    {node.namespace}
                  </Descriptions.Item>
                  <Descriptions.Item style={{ padding: 0 }} label="Context Type">
                    {node.contextType}
                  </Descriptions.Item>
                  <Descriptions.Item style={{ padding: 0 }} label="ID">
                    {node.id}
                  </Descriptions.Item>
                  {Object.entries(node.parsedContext).map(([key, value]: [string, any]) => (
                    <Descriptions.Item style={{ padding: 0 }} key={key} label={key}>
                      {value}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </Card>
            )
          }}
        />
      </Flex>
    </AntdLayout>
  )
}
