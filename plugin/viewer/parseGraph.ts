import type { Connection, FileNodes } from '../types'
import { getNodeById } from './nodes/getNodes'
import { NODE_LINE_HEIGHT, NODE_SPACING, NODE_WIDTH } from './nodes/drawNode'
import { Vector } from './libs/math/Vector'
import {
  createFrame,
  addNodeToFrame,
  clearFrames,
  getFrame,
  updateFrameBounds,
} from './frames/frames'
import { FRAME_PADDING } from './frames/calculateFrameBounds'
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

  islands.forEach(([_, iNodes]) => {
    const islandNodes: GraphNodes = {}
    const entries = Object.entries(iNodes as FileNodes)
    const { id: frameId } = createFrame()

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

      const savedPosition = savedFilePositions[filePath]

      const newNode: GraphNode = {
        groupId: frameId,
        position: !!savedPosition ? savedPosition : Vector.Zero(),
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
      addNodeToFrame(frameId, newNode)
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

    updateFrameBounds(frameId)
    const group = getFrame(frameId)

    groupY = Math.max(groupY, group.bounds.end.y)
    Object.keys(positions).forEach(
      (position) =>
        (positions[Number(position)] = groupY + FRAME_PADDING + 100),
    )
  })

  Object.values(nodes).forEach(updateFilePosition)
  clearFrames()
  initialiseFrames()
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
      position: new Vector(upstreamNode.position.x + xSpacing, 0),
      functions: {},
    }

    if (savedFilePositions[downstreamConnectionId]) {
      nodes[filePath].position = new Vector(
        savedFilePositions[downstreamConnectionId].x,
        savedFilePositions[downstreamConnectionId].y,
      )
    }
    return
  }

  if (savedFilePositions[downstreamNode.filePath]) {
    downstreamNode.position = new Vector(
      savedFilePositions[downstreamNode.filePath].x,
      savedFilePositions[downstreamNode.filePath].y,
    )
    return
  }

  if (upstreamNode.position.x + xSpacing < downstreamNode.position.x) return

  downstreamNode.position.x = upstreamNode.position.x + xSpacing
}

async function initialiseFrames() {
  const savedFrames = (await fetch('frames.json').then((res) => {
    if (res.ok) return res.json()
    else return {}
  })) as Record<string, { id: string; name: string; nodes: string[] }>
  console.log(savedFrames)

  Object.values(savedFrames).forEach((frame) => {
    const frameInstance = createFrame(frame.id)
    frameInstance.name = frame.name
    frame.nodes.forEach((nodeId) => {
      const node = getNodeById(nodeId)
      addNodeToFrame(frameInstance.id, node)
    })
  })
}
