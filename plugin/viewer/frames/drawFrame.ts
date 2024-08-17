import { ctx } from '..'
import { containedStyles } from '../components/containedStyles'
import { Frame } from './types'

const FRAME_BORDER_WIDTH = 3

export function drawFrame(frame: Frame) {
  containedStyles(() => {
    ctx.fillStyle = '#555'
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
  })
}
