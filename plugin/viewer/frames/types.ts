import { Vector } from '../libs/math/Vector'
import { GraphNode } from '../parseGraph'

export type Frame = {
  id: string
  name: string
  bounds: { start: Vector; end: Vector }
  nodes: Set<GraphNode>
  titleBounds: { start: Vector; end: Vector }
}

export type Frames = Record<string, Frame>
