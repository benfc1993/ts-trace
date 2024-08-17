import { lerp } from './lerp'

export class Vector {
  x: number = 0
  y: number = 0

  constructor(x?: number, y?: number) {
    if (x) this.x = x
    if (y) this.y = y
  }

  static Zero() {
    return new Vector()
  }

  static Unit() {
    return new Vector(1, 1)
  }

  static lerp(lhs: Vector, rhs: Vector, t: number) {
    return new Vector(lerp(lhs.x, rhs.x, t), lerp(lhs.x, rhs.y, t))
  }

  lerp(other: Vector, t: number) {
    return new Vector(lerp(this.x, other.x, t), lerp(this.y, other.y, t))
  }
}
