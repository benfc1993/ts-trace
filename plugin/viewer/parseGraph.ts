import type { Connection, FileNodes } from '../types'
import { Vector } from './types'
import { getNodeById } from './getNodes'
import { NODE_LINE_HEIGHT, NODE_SPACING, NODE_WIDTH } from './drawFile'
import { vector } from './math/createVector'
import {
  addGroup,
  addNodeToGroup,
  getGroup,
  updateGroupBounds,
} from './groups/groups'
import { GROUP_PADDING } from './groups/calculateGroupBounds'
import { updateFilePosition } from './connectToServer'

export type GraphNode = {
  groupId: string | null
  position: Vector
  filePath: string
  functionCount: number
  functions: Record<
    string,
    { connectionsOut: Connection[]; connectionsIn: String[]; exported: boolean }
  >
}

export type GraphNodes = Record<string, GraphNode>

export const nodes: GraphNodes = {}
const positions: Record<number, number> = {}
let savedFilePositions: Record<string, Vector> = {}

export async function parseGraph() {
  Object.keys(nodes).forEach((node) => delete nodes[node])
  savedFilePositions = await fetch('filePositions.json')
    .then((res) => {
      if (res.ok) return res.json()
      else return {}
    })
    .catch(() => ({}))

  const graph = await fetch('graph.json').then((res) => res.json())
  const islands: [string, FileNodes][] = Object.entries(graph)
  let groupY = 0

  islands.forEach(([islandIndex, iNodes]) => {
    const groupId = `island-${islandIndex}`
    const islandNodes: GraphNodes = {}
    const entries = Object.entries(iNodes as FileNodes)
    addGroup(groupId)

    for (const [functionId, functionData] of entries) {
      console.log(functionId)
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

      const savedPosition = savedFilePositions[filePath]

      const newNode: GraphNode = {
        groupId,
        position: !!savedPosition ? savedPosition : vector(),
        functionCount: 0,
        filePath,
        functions: {
          [functionName]: {
            exported: functionData.exported,
            connectionsOut: functionData.out,
            connectionsIn: Array.from(new Set(functionData.in)),
          },
        },
      }

      nodes[filePath] = newNode
      islandNodes[filePath] = newNode
      addNodeToGroup(groupId, newNode)
    }

    const nodeArr = Object.entries(islandNodes)
    for (let i = 0; i < nodeArr.length; i++) {
      const [, node] = nodeArr[i]
      Object.values(node.functions).forEach((func) => {
        node.functionCount = Object.keys(node.functions).length
        traverseConnections(iNodes, node, func.connectionsOut)
      })
    }
    nodeArr.forEach(([, node]) => {
      const currentY = positions[node.position.x] ?? 0

      const savedPosition = savedFilePositions[node.filePath]
      node.position.y = !!savedPosition ? savedPosition.y : currentY

      positions[node.position.x] =
        node.position.y +
        Object.keys(node.functions).length * NODE_LINE_HEIGHT +
        NODE_SPACING
    })

    updateGroupBounds(groupId)
    const group = getGroup(groupId)

    groupY = Math.max(groupY, group.bounds.end.y)
    Object.keys(positions).forEach(
      (position) =>
        (positions[Number(position)] = groupY + GROUP_PADDING + 100),
    )
  })

  // Object.entries(nodes).forEach(([, node]) => {
  //   const currentY = positions[node.position.x] ?? 0
  //   node.position.y = currentY
  //   positions[node.position.x] =
  //     node.position.y +
  //     Object.keys(node.functions).length * NODE_LINE_HEIGHT +
  //     NODE_SPACING
  //   if (node.groupId) updateGroupBounds(node.groupId)
  // })
  Object.values(nodes).forEach(updateFilePosition)
  return nodes
}

function traverseConnections(
  graph: FileNodes,
  graphNode: GraphNode,
  connections: Connection[],
) {
  for (const connection of connections) {
    const { connectionId } = connection
    const [filePath] = connectionId.split('#')
    const fileNode = graph[connectionId]

    if (
      savedFilePositions[filePath] &&
      !savedFilePositions[graphNode.filePath]
    ) {
      let downStreamPosition = savedFilePositions[filePath]
      if (graphNode.position.x > downStreamPosition.x) {
        graphNode.position.x =
          downStreamPosition.x - (NODE_WIDTH + NODE_SPACING)
      }
    } else {
      positionDownstreamNode(graphNode, connectionId)
    }
    console.log(fileNode, filePath)
    // if (!fileNode) continue
    traverseConnections(graph, getNodeById(connectionId), fileNode?.out ?? [])
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
      filePath,
      functionCount: 0,
      groupId: null,
      position: vector(upstreamNode.position.x + xSpacing, 0),
      functions: {},
    }

    if (savedFilePositions[downstreamConnectionId]) {
      nodes[filePath].position = vector(
        savedFilePositions[downstreamConnectionId].x,
        savedFilePositions[downstreamConnectionId].y,
      )
    }
    return
  }

  if (savedFilePositions[downstreamNode.filePath]) {
    downstreamNode.position = vector(
      savedFilePositions[downstreamNode.filePath].x,
      savedFilePositions[downstreamNode.filePath].y,
    )
    return
  }

  if (upstreamNode.position.x + xSpacing < downstreamNode.position.x) return

  downstreamNode.position.x = upstreamNode.position.x + xSpacing
}
