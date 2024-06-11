import type { Connection, FileNodes } from '../types'
import { Vector } from './types'
import { getNodeById } from './getNodes'
import { NODE_LINE_HEIGHT, NODE_SPACING, NODE_WIDTH } from './drawFile'
import { vector } from './math/createVector'

export type GraphNode = {
  position: Vector
  functions: Record<string, { connections: Connection[]; exported: boolean }>
}

export type GraphNodes = Record<string, GraphNode>

export const nodes: GraphNodes = {}
const positions: Record<number, number> = {}

export async function parseGraph() {
  const graph = await fetch('graph.json').then((res) => res.json())
  const entries = Object.entries(graph as FileNodes)

  for (const [functionId, functionData] of entries) {
    const [filePath, functionName] = functionId.split('#')
    if (getNodeById(functionId)) {
      const node = getNodeById(functionId)
      node.functions[functionName] = {
        exported: functionData.exported,
        connections: functionData.out,
      }
      continue
    }

    const newNode: GraphNode = {
      position: vector(),
      functions: {
        [functionName]: {
          exported: functionData.exported,
          connections: functionData.out,
        },
      },
    }

    nodes[filePath] = newNode
  }

  const nodeArr = Object.values(nodes)
  for (let i = 0; i < nodeArr.length; i++) {
    const node = nodeArr[i]
    Object.values(node.functions).forEach((func) =>
      traverseConnections(graph, node, func.connections),
    )
  }

  Object.entries(nodes).forEach(([file, node]) => {
    const currentY = positions[node.position.x] ?? 0
    console.log(file, node.position.x)
    node.position.y = currentY
    positions[node.position.x] =
      node.position.y +
      Object.keys(node.functions).length * NODE_LINE_HEIGHT +
      NODE_SPACING
  })
  console.log(nodes)
  return nodes
}

function traverseConnections(
  graph: FileNodes,
  graphNode: GraphNode,
  connections: Connection[],
) {
  for (const connection of connections) {
    const { connectionId } = connection
    const fileNode = graph[connectionId]
    const [filePath, identifier] = connectionId.split('#')

    if (!getNodeById(connectionId)) {
      nodes[filePath] = {
        position: vector(),
        functions: {},
      }
      if (identifier.includes('.')) {
      }
    }

    positionDownstreamNode(graphNode, connection.connectionId)
    traverseConnections(graph, getNodeById(connectionId), fileNode.out)
  }
}

function positionDownstreamNode(
  upstreamNode: GraphNode,
  downstreamConnectionId: string,
) {
  const xSpacing = NODE_WIDTH + NODE_SPACING
  const downstreamNode = getNodeById(downstreamConnectionId)

  if (!downstreamNode) {
    const [filePath] = downstreamConnectionId.split('#')
    nodes[filePath] = {
      position: vector(upstreamNode.position.x + xSpacing, 0),
      functions: {},
    }
    return
  }

  if (upstreamNode.position.x + xSpacing < downstreamNode.position.x) return

  downstreamNode.position.x = upstreamNode.position.x + xSpacing
}
