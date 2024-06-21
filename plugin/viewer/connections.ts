import { NODE_LINE_HEIGHT } from './drawFile'
import { functionPositions } from './functions'
import { vector } from './math/createVector'
import { nodes } from './parseGraph'
import { Vector } from './types'

export const connectionLines: {
  [connection: string]: { start: Vector; end: Vector }
} = {}

export function createConnections() {
  Object.keys(connectionLines).forEach((key) => delete connectionLines[key])
  Object.entries(nodes).forEach(([filePath, node]) => {
    Object.entries(node.functions).forEach(([functionName, connections]) => {
      const functionPosition = functionPositions[filePath + '#' + functionName]
      connections.connectionsOut.forEach((connection) => {
        const externalFunctionPosition =
          functionPositions[connection.connectionId]

        connectionLines[
          filePath + '#' + functionName + '-' + connection.connectionId
        ] = {
          start: vector(
            functionPosition.end.x,
            functionPosition.start.y + NODE_LINE_HEIGHT / 2,
          ),
          end: vector(
            externalFunctionPosition.start.x,
            externalFunctionPosition.start.y + NODE_LINE_HEIGHT / 2,
          ),
        }
      })
    })
  })
}

export function modifyConnection(
  connectionId: string,
  changes: {
    position?: { start?: Vector; end?: Vector }
    offset?: { start?: Vector; end?: Vector }
  },
) {
  const connectionLine = connectionLines[connectionId]

  if (changes?.position?.start) connectionLine.start = changes.position.start
  if (changes?.position?.end) connectionLine.end = changes.position.end

  if (changes?.offset?.start) {
    connectionLine.start.x += changes.offset.start.x
    connectionLine.start.y += changes.offset.start.y
  }

  if (changes?.offset?.end) {
    connectionLine.end.x += changes.offset.end.x
    connectionLine.end.y += changes.offset.end.y
  }
}
