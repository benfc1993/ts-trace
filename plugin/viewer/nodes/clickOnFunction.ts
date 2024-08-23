import { Mouse, ctx, higlightedConnections, state } from '..'
import { NODE_BORDER_WIDTH, NODE_LINE_HEIGHT, NODE_WIDTH } from './drawNode'
import { functionPositions } from '../functions'
import { getFunctionById } from './getNodes'
import { nodes } from '../parseGraph'

export function clickOnFunction(functionId: string): void {
  higlightedConnections.clear()

  addConnectionHighlights(functionId)
}

export function getHoveredFunctionId(
  withinNode?: string | null,
): string | null {
  let functionKeys = Object.keys(functionPositions)
  if (withinNode)
    functionKeys = functionKeys.filter((functionId) =>
      functionId.startsWith(withinNode),
    )

  for (let i = 0; i < functionKeys.length; i++) {
    const functionName = functionKeys[i]
    const functionPosition = functionPositions[functionName]
    if (
      Mouse.canvasPosition.x > functionPosition.start.x &&
      Mouse.canvasPosition.x < functionPosition.end.x &&
      Mouse.canvasPosition.y > functionPosition.start.y &&
      Mouse.canvasPosition.y < functionPosition.end.y
    ) {
      return functionName
    }
  }
  return null
}

export function getHoveredNodeId() {
  const files = Object.entries(nodes)
  for (let i = files.length - 1; i >= 0; i--) {
    const [file, node] = files[i]
    if (
      Mouse.canvasPosition.y > node.position.y - NODE_BORDER_WIDTH &&
      Mouse.canvasPosition.y <
        node.position.y +
          (node.functionCount + 1) * NODE_LINE_HEIGHT +
          2 * NODE_BORDER_WIDTH &&
      Mouse.canvasPosition.x > node.position.x - NODE_BORDER_WIDTH &&
      Mouse.canvasPosition.x < node.position.x + NODE_WIDTH + NODE_BORDER_WIDTH
    ) {
      return file
    }
  }
  return null
}

function addConnectionHighlights(connectionId: string) {
  const functionData = getFunctionById(connectionId)
  functionData.connectionsOut.forEach((functionConnection) => {
    higlightedConnections.add(
      `${connectionId}-${functionConnection.connectionId}`,
    )
    getFunctionById(functionConnection.connectionId).connectionsOut.forEach(
      (connection) => {
        addConnectionHighlights(connection.connectionId),
          higlightedConnections.add(
            `${functionConnection.connectionId}-${connection.connectionId}`,
          )
      },
    )
  })
}
