import { GraphNode } from './parseGraph'

export type Vector = {
  x: number
  y: number
  lerp: (other: Vector, t: number) => Vector
}

export type State = {
  paused: boolean
  draggedGroup: string | null
  lastClick: Vector
  dragstart: Vector
  dragging: boolean
  draggingBlocked: boolean
  draggingTimeout: boolean
  dragTimeout: NodeJS.Timeout | null
  draggedFileNode: GraphNode | null
  width: number
  height: number
  zoomIntensity: number
  zoomMax: number
  zoomMin: number
  scale: number
  canvasOrigin: Vector
}
