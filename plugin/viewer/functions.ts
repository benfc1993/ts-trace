import { NODE_LINE_HEIGHT, NODE_WIDTH } from './nodes/drawNode'
import { Vector } from './libs/math/Vector'
import { GraphNode, nodes } from './parseGraph'

export const functionPositions: Record<string, { start: Vector; end: Vector }> =
  {}

export function createFunctionPositions() {
  Object.keys(functionPositions).forEach((key) => delete functionPositions[key])
  Object.entries(nodes).forEach(([file, node]) => {
    changeFunctionPositions(file, node)
  })
}

export function changeFunctionPositions(file: string, node: GraphNode) {
  Object.keys(node.functions).forEach((functionName, idx) => {
    const functionId = file + '#' + functionName
    const height = NODE_LINE_HEIGHT * (idx + 1)
    functionPositions[functionId] = {
      start: new Vector(node.position.x, node.position.y + height),
      end: new Vector(
        node.position.x + NODE_WIDTH,
        node.position.y + height + NODE_LINE_HEIGHT,
      ),
    }
  })
}
