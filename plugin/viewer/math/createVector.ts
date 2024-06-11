import { Vector } from '../types'
import { lerp } from './lerp'

export function vector(x: number = 0, y: number = 0): Vector {
  return {
    x,
    y,
    lerp(other, t) {
      return vector(lerp(this.x, other.x, t), lerp(this.y, other.y, t))
    },
  }
}
