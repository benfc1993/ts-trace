import { modifyConnection } from './connections'
import { changeFunctionPositions } from './functions'
import { GraphNode } from './parseGraph'
import { Vector } from './types'

export function dragFile(
  file: {
    filePath: string
    node: GraphNode
  },
  move: Vector,
) {
  const { filePath, node } = file

  node.position.x += move.x
  node.position.y += move.y

  const seen = new Set<string>()

  changeFunctionPositions(file.filePath, file.node)

  Object.entries(node.functions).forEach(([funcName, data]) => {
    data.connectionsOut.forEach((connection) => {
      const connectionId =
        filePath + '#' + funcName + '-' + connection.connectionId
      if (!seen.has(connectionId)) {
        modifyConnection(connectionId, { offset: { start: move } })
      }
      seen.add(connectionId)
    })

    data.connectionsIn.forEach((connection) => {
      console.log({ connection })
      const connectionId = connection + '-' + filePath + '#' + funcName
      if (!seen.has(connectionId)) {
        console.log({ connectionIn: connectionId })
        modifyConnection(connectionId, { offset: { end: move } })
      }
      seen.add(connectionId)
    })
  })
}
