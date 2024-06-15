import { GraphNode } from './parseGraph'

export type Vector = {
  x: number
  y: number
  lerp: (other: Vector, t: number) => Vector
}

export type State = {
  lastClick: Vector
  dragstart: Vector
  dragging: boolean
  draggingBlocked: boolean
  draggingTimeout: boolean
  dragTimeout: NodeJS.Timeout | null
  draggedFileNode: { filePath: string; node: GraphNode } | null
  width: number
  height: number
  zoomIntensity: number
  zoomMax: number
  zoomMin: number
  scale: number
  canvasOrigin: Vector
}
