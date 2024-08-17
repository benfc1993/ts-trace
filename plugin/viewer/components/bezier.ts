import { ctx } from '..'
import { Vector } from '../libs/math/Vector'
import { lerp } from '../libs/math/lerp'

export function bezier(
  start: Vector,
  startHandle: Vector,
  endHandle: Vector,
  end: Vector,
  resolution: number,
) {
  ctx.beginPath()
  ctx.lineWidth = 2
  const stepSize = 1 / resolution
  ctx.moveTo(start.x, start.y)
  for (let t = 0; t <= 1; t += stepSize) {
    const v1 = quad(start, startHandle, endHandle, t)
    const v2 = quad(startHandle, endHandle, end, t)
    const x = lerp(v1.x, v2.x, t)
    const y = lerp(v1.y, v2.y, t)

    ctx.lineTo(x, y)
  }
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
}

function quad(p0: Vector, p1: Vector, p2: Vector, t: number) {
  const ax = lerp(p0.x, p1.x, t)
  const ay = lerp(p0.y, p1.y, t)
  const bx = lerp(p1.x, p2.x, t)
  const by = lerp(p1.y, p2.y, t)

  const x = lerp(ax, bx, t)
  const y = lerp(ay, by, t)
  return { x, y }
}
