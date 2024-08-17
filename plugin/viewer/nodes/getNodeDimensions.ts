import { GraphNode } from '../parseGraph'
import { NODE_LINE_HEIGHT, NODE_WIDTH } from './drawNode'

export function getNodeDimensions(node: GraphNode) {
  const width = NODE_WIDTH
  const height = NODE_LINE_HEIGHT + NODE_LINE_HEIGHT * node.functionCount

  return { x: node.position.x, y: node.position.y, width, height }
}
