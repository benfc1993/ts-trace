import { ctx } from '..'

export function containedStyles(func: (ctx: CanvasRenderingContext2D) => void) {
  const previousStyles = {
    fill: ctx.fillStyle,
    stroke: ctx.strokeStyle,
    lineWidth: ctx.lineWidth,
  }
  func(ctx)
  ctx.strokeStyle = previousStyles.stroke
  ctx.fillStyle = previousStyles.fill
  ctx.lineWidth = previousStyles.lineWidth
}
