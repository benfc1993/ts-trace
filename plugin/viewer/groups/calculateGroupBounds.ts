import { NODE_BOX_WIDTH, NODE_LINE_HEIGHT, NODE_WIDTH } from '../drawFile'
import { vector } from '../math/createVector'
import { GraphNode } from '../parseGraph'
import type { Vector } from '../types'
import type { Group } from './types'

export const GROUP_PADDING = 50

export function calculateGroupBounds(group: Group): {
  start: Vector
  end: Vector
} {
  const { nodes } = group
  let newBounds = {
    start: vector(Infinity, Infinity),
    end: vector(-Infinity, -Infinity),
  }
  nodes.forEach((node) => {
    newBounds = fitGroupToNode(newBounds, node)
  })

  return newBounds
}

export function fitGroupToNode(
  bounds: { start: Vector; end: Vector },
  node: GraphNode,
) {
  const newBounds = { start: bounds.start, end: bounds.end }
  if (node.position.x - GROUP_PADDING < newBounds.start.x)
    newBounds.start.x = node.position.x - GROUP_PADDING
  if (node.position.y - GROUP_PADDING < newBounds.start.y)
    newBounds.start.y = node.position.y - GROUP_PADDING
  if (node.position.x + GROUP_PADDING + NODE_BOX_WIDTH > newBounds.end.x)
    newBounds.end.x = node.position.x + NODE_BOX_WIDTH + GROUP_PADDING
  if (
    node.position.y +
      GROUP_PADDING +
      (node.functionCount + 1) * NODE_LINE_HEIGHT >
    newBounds.end.y
  )
    newBounds.end.y =
      node.position.y +
      (node.functionCount + 1) * NODE_LINE_HEIGHT +
      GROUP_PADDING
  return newBounds
}
