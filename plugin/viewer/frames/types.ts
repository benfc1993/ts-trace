import { Vector } from '../libs/math/Vector'
import { GraphNode } from '../parseGraph'

export type Frame = {
  id: string
  name: string
  bounds: { start: Vector; end: Vector }
  nodes: Set<GraphNode>
}

export type Frames = Record<string, Frame>
