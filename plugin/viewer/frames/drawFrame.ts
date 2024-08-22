import test from 'node:test'
import { Mouse, ctx, higlightedConnections, state } from '..'
import { FRAME_BG } from '../colors'
import { containedStyles } from '../components/containedStyles'
import { FRAME_PADDING } from './calculateFrameBounds'
import { Frame } from './types'
import { Vector } from '../libs/math/Vector'
import { drawConnection } from '../connections'
import { drawNode } from '../nodes/drawNode'
import { getFrames, updateFrameBounds } from './frames'

const FRAME_BORDER_WIDTH = 3

export function drawFrame(frame: Frame) {
  containedStyles(() => {
    ctx.fillStyle = FRAME_BG
    ctx.strokeStyle = '#f2f2f2'
    ctx.lineWidth = FRAME_BORDER_WIDTH
    ctx.fillRect(
      frame.bounds.start.x,
      frame.bounds.start.y,
      frame.bounds.end.x - frame.bounds.start.x,
      frame.bounds.end.y - frame.bounds.start.y,
    )
    ctx.strokeRect(
      frame.bounds.start.x,
      frame.bounds.start.y,
      frame.bounds.end.x - frame.bounds.start.x,
      frame.bounds.end.y - frame.bounds.start.y,
    )
    ctx.font = '30px roboto-mono'
    ctx.fillStyle = '#fff'
    ctx.fillText(
      frame.name,
      frame.bounds.start.x + 10,
      frame.bounds.start.y + 10 + FRAME_PADDING / 2,
    )
    const textMeasurements = ctx.measureText(frame.name)
    frame.titleBounds = {
      start: new Vector(frame.bounds.start.x + 10, frame.bounds.start.y + 10),
      end: new Vector(
        frame.bounds.start.x + 10 + textMeasurements.actualBoundingBoxRight,
        frame.bounds.start.y +
          10 +
          FRAME_PADDING / 2 +
          textMeasurements.actualBoundingBoxAscent,
      ),
    }
  })
}

export function drawFrames() {
  Object.values(getFrames()).forEach((frame) => {
    updateFrameBounds(frame.id)
    drawFrame(frame)

    frame.nodes.forEach((node) => {
      Object.entries(node.functions).forEach(([functionName, functionData]) => {
        functionData.connectionsOut.forEach((connectionOut) => {
          const connectionId =
            node.filePath +
            '#' +
            functionName +
            '-' +
            connectionOut.connectionId
          const shouldDrawConnection =
            higlightedConnections.size < 0 ||
            !higlightedConnections.has(connectionId)

          if (!shouldDrawConnection) return

          state.connectionsToDraw.delete(connectionId)

          drawConnection(connectionId, higlightedConnections.size > 0)
        })
      })
    })
    frame.nodes.forEach(drawNode)
  })
}
