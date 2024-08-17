import { Vector } from '../libs/math/Vector'

export enum DragTarget {
  None,
  Box,
  Canvas,
  Frame,
  Node,
  Function,
}

export type InteractionState = {
  dragTarget: DragTarget
  dragging: boolean
  boxSelect: Vector | null
  dragStart: Vector
  dragEnd: Vector
  hoveredNodeId: string | null
  selectedNodeIds: Set<string>
  hoveredFrameId: string | null
  hoveredFunctionId: string | null
  heldKeys: Set<string>
}

export type Cursor = 'default' | 'pointer' | 'grab' | 'grabbing' | 'move'
