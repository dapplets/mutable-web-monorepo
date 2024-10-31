import React, { FC, useMemo, useRef } from 'react'
import { GraphCanvas, GraphCanvasRef, useSelection } from 'reagraph'
import { useQuery } from '@tanstack/react-query'
import { Card, Button, Descriptions, Drawer } from 'antd'
import { getGraph } from './api'

export const Graph: FC = () => {
  const { data } = useQuery({
    queryFn: getGraph,
    queryKey: ['graph'],
    refetchInterval: 1000,
    initialData: { nodes: [], edges: [] },
  })

  const graphRef = useRef<GraphCanvasRef | null>(null)
  const { selections, actives, onNodeClick, onCanvasClick, clearSelections } = useSelection({
    ref: graphRef,
    nodes: data.nodes,
    edges: data.edges,
  })

  const handleCloseDrawerClick = () => {
    clearSelections()
  }

  const selectedNode = useMemo(() => {
    if (!selections.length) return null
    const [selectedNodeKey] = selections
    return data.nodes.find((node: any) => node.id === selectedNodeKey)
  }, [selections, data])

  const isDrawerOpen = !!selectedNode

  return (
    <>
      <GraphCanvas
        ref={graphRef}
        nodes={data.nodes}
        edges={data.edges}
        selections={selections}
        actives={actives}
        onCanvasClick={onCanvasClick}
        onNodeClick={onNodeClick}
        edgeArrowPosition="none"
        sizingType="centrality"
      />
      <Drawer title="Selected Context" onClose={handleCloseDrawerClick} open={isDrawerOpen} width={450}>
        {selectedNode ? (
          <Descriptions size="small" layout="vertical" column={1}>
            <Descriptions.Item style={{ padding: 0 }} label="Namespace">
              {selectedNode.data.namespace}
            </Descriptions.Item>
            <Descriptions.Item style={{ padding: 0 }} label="Context Type">
              {selectedNode.data.contextType}
            </Descriptions.Item>
            <Descriptions.Item style={{ padding: 0 }} label="ID">
              {selectedNode.data.id}
            </Descriptions.Item>
            {Object.entries(selectedNode.data.parsedContext).map(([key, value]: [string, any]) => (
              <Descriptions.Item style={{ padding: 0 }} key={key} label={key}>
                {value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : null}
      </Drawer>
    </>
  )
}
