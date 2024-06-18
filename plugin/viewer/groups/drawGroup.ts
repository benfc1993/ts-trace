import { ctx } from '..'
import { containedStyles } from '../components/containedStyles'
import { Group } from './types'

const GROUP_BORDER_WIDTH = 3

export function drawGroup(group: Group) {
  containedStyles(() => {
    ctx.fillStyle = '#555'
    ctx.strokeStyle = '#f2f2f2'
    ctx.lineWidth = GROUP_BORDER_WIDTH
    ctx.fillRect(
      group.bounds.start.x,
      group.bounds.start.y,
      group.bounds.end.x - group.bounds.start.x,
      group.bounds.end.y - group.bounds.start.y,
    )
    ctx.strokeRect(
      group.bounds.start.x,
      group.bounds.start.y,
      group.bounds.end.x - group.bounds.start.x,
      group.bounds.end.y - group.bounds.start.y,
    )
  })
}
