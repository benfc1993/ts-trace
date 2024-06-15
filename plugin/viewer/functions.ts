import { NODE_LINE_HEIGHT, NODE_WIDTH } from './drawFile'
import { vector } from './math/createVector'
import { GraphNode, nodes } from './parseGraph'
import { Vector } from './types'

export const functionPositions: Record<string, { start: Vector; end: Vector }> =
  {}

export function createFunctionPositions() {
  Object.entries(nodes).forEach(([file, node]) => {
    changeFunctionPositions(file, node)
  })
}

export function changeFunctionPositions(file: string, node: GraphNode) {
  Object.keys(node.functions).forEach((functionName, idx) => {
    const functionId = file + '#' + functionName
    const height = NODE_LINE_HEIGHT * (idx + 1)
    functionPositions[functionId] = {
      start: vector(node.position.x, node.position.y + height),
      end: vector(
        node.position.x + NODE_WIDTH,
        node.position.y + height + NODE_LINE_HEIGHT,
      ),
    }
  })
}
