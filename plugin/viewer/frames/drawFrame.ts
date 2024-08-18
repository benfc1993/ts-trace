import test from 'node:test'
import { Mouse, ctx } from '..'
import { FRAME_BG } from '../colors'
import { containedStyles } from '../components/containedStyles'
import { FRAME_PADDING } from './calculateFrameBounds'
import { Frame } from './types'
import { Vector } from '../libs/math/Vector'

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
