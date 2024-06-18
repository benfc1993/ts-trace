import { modifyConnection } from './connections'
import { changeFunctionPositions } from './functions'
import { GraphNode } from './parseGraph'
import { Vector } from './types'

export function moveFile(node: GraphNode, move: Vector) {
  node.position.x += move.x
  node.position.y += move.y

  const seen = new Set<string>()

  changeFunctionPositions(node.filePath, node)

  Object.entries(node.functions).forEach(([funcName, data]) => {
    data.connectionsOut.forEach((connection) => {
      const connectionId =
        node.filePath + '#' + funcName + '-' + connection.connectionId
      if (!seen.has(connectionId)) {
        modifyConnection(connectionId, { offset: { start: move } })
      }
      seen.add(connectionId)
    })

    data.connectionsIn.forEach((connection) => {
      const connectionId = connection + '-' + node.filePath + '#' + funcName
      if (!seen.has(connectionId)) {
        modifyConnection(connectionId, { offset: { end: move } })
      }
      seen.add(connectionId)
    })
  })
}
