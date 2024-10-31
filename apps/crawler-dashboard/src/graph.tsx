import { useQuery } from '@tanstack/react-query'
import { Drawer, Flex } from 'antd'
import { FC, useMemo, useRef } from 'react'
import { GraphCanvas, GraphCanvasRef, useSelection } from 'reagraph'
import { getGraph } from './api'
import { ContextDetails } from './context-details'
import { Navigation } from './navigation'

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
      <Drawer
        title="Selected Context"
        onClose={handleCloseDrawerClick}
        open={isDrawerOpen}
        width={450}
        mask={false}
      >
        <Flex gap="middle" vertical>
          <Navigation />
          {selectedNode ? <ContextDetails selectedNode={selectedNode} /> : null}
        </Flex>
      </Drawer>
    </>
  )
}
