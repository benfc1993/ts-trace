import type { Connection, FileNodes } from '../types'
import { Vector } from './types'
import { getNodeById } from './getNodes'
import { NODE_LINE_HEIGHT, NODE_SPACING, NODE_WIDTH } from './drawFile'
import { vector } from './math/createVector'

export type GraphNode = {
  position: Vector
  functions: Record<
    string,
    { connectionsOut: Connection[]; connectionsIn: String[]; exported: boolean }
  >
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
        connectionsOut: functionData.out,
        connectionsIn: functionData.in,
      }
      continue
    }

    const newNode: GraphNode = {
      position: vector(),
      functions: {
        [functionName]: {
          exported: functionData.exported,
          connectionsOut: functionData.out,
          connectionsIn: Array.from(new Set(functionData.in)),
        },
      },
    }

    nodes[filePath] = newNode
  }

  const nodeArr = Object.entries(nodes)
  for (let i = 0; i < nodeArr.length; i++) {
    const [filePath, node] = nodeArr[i]
    Object.values(node.functions).forEach((func) =>
      traverseConnections(filePath, graph, node, func.connectionsOut),
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
  return nodes
}

function traverseConnections(
  filePath: string,
  graph: FileNodes,
  graphNode: GraphNode,
  connections: Connection[],
) {
  for (const connection of connections) {
    const { connectionId } = connection
    const fileNode = graph[connectionId]
    const [connectionFilePath, identifier] = connectionId.split('#')
    if (connectionFilePath === filePath) continue
    if (!getNodeById(connectionId)) {
      nodes[connectionFilePath] = {
        position: vector(),
        functions: {},
      }
      if (identifier.includes('.')) {
      }
    }

    positionDownstreamNode(graphNode, connection.connectionId)
    traverseConnections(
      connectionFilePath,
      graph,
      getNodeById(connectionId),
      fileNode.out,
    )
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
