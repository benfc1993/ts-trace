import { Connection } from '../types'
import { bezier } from './components/bezier'
import { containedStyles } from './components/containedStyles'
import { NODE_LINE_HEIGHT, NODE_SPACING } from './nodes/drawNode'
import { functionPositions } from './functions'
import { Vector } from './libs/math/Vector'
import { nodes } from './parseGraph'

export const connectionLines: {
  [connection: string]: { start: Vector; end: Vector }
} = {}

export const connectionsFrom: { [connectionId: string]: string[] } = {}

export function createConnections() {
  Object.keys(connectionLines).forEach((key) => delete connectionLines[key])
  Object.entries(nodes).forEach(([filePath, node]) => {
    Object.entries(node.functions).forEach(([functionName, connections]) => {
      const functionPosition = functionPositions[filePath + '#' + functionName]
      connections.connectionsOut.forEach((connection) => {
        const externalFunctionPosition =
          functionPositions[connection.connectionId]

        const fromConnection = filePath + '#' + functionName
        const fullConnectionId = fromConnection + '-' + connection.connectionId

        connectionLines[fullConnectionId] = {
          start: new Vector(
            functionPosition.end.x,
            functionPosition.start.y + NODE_LINE_HEIGHT / 2,
          ),
          end: new Vector(
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

const lineColor = '#ffffff'
const lineUnfocusedColor = '#3d3d3d'

export function drawConnection(connectionId: string, faded: boolean = false) {
  const { start, end } = connectionLines[connectionId]
  containedStyles((ctx) => {
    ctx.strokeStyle = faded ? lineUnfocusedColor : lineColor
    bezier(
      start,
      new Vector(start.x + NODE_SPACING, start.y),
      new Vector(end.x - NODE_SPACING, end.y),
      end,
      156,
    )
  })
}
