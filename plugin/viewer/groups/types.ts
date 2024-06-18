import { GraphNode } from '../parseGraph'
import { Vector } from '../types'

export type Group = {
  id: string
  bounds: { start: Vector; end: Vector }
  nodes: GraphNode[]
}

export type Groups = Record<string, Group>
