import { NODE_BOX_WIDTH, NODE_LINE_HEIGHT } from '../nodes/drawNode'
import { Vector } from '../libs/math/Vector'
import { GraphNode } from '../parseGraph'
import type { Frame } from './types'

export const FRAME_PADDING = 50

export function calculateFrameBounds(frame: Frame): {
  start: Vector
  end: Vector
} {
  const { nodes } = frame
  let newBounds = {
    start: new Vector(Infinity, Infinity),
    end: new Vector(-Infinity, -Infinity),
  }
  nodes.forEach((node) => {
    newBounds = fitFrameToNode(newBounds, node)
  })

  return newBounds
}

export function fitFrameToNode(
  bounds: { start: Vector; end: Vector },
  node: GraphNode,
) {
  const newBounds = { start: bounds.start, end: bounds.end }
  if (node.position.x - FRAME_PADDING < newBounds.start.x)
    newBounds.start.x = node.position.x - FRAME_PADDING
  if (node.position.y - FRAME_PADDING < newBounds.start.y)
    newBounds.start.y = node.position.y - FRAME_PADDING
  if (node.position.x + FRAME_PADDING + NODE_BOX_WIDTH > newBounds.end.x)
    newBounds.end.x = node.position.x + NODE_BOX_WIDTH + FRAME_PADDING
  if (
    node.position.y +
      FRAME_PADDING +
      (node.functionCount + 1) * NODE_LINE_HEIGHT >
    newBounds.end.y
  )
    newBounds.end.y =
      node.position.y +
      (node.functionCount + 1) * NODE_LINE_HEIGHT +
      FRAME_PADDING
  return newBounds
}
