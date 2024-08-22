import { Immutable } from '../libs/Immutable'
import { Vector } from '../libs/math/Vector'
import { DragTarget, InteractionState } from './types'

const interactionState: InteractionState = {
  dragTarget: DragTarget.None,
  dragging: false,
  boxSelect: null,
  dragStart: Vector.Zero(),
  dragEnd: Vector.Zero(),
  hoveredNodeId: null,
  selectedNodeIds: new Set(),
  hoveredFrameId: null,
  hoveredFunctionId: null,
  heldKeys: new Set(),
}

export function getInteractionState(): Immutable<InteractionState> {
  return interactionState
}

export function clearSelection() {
  interactionState.selectedNodeIds.clear()
}

export function setDragTarget(dragTarget: DragTarget) {
  interactionState.dragTarget = dragTarget
}

export function setBoxSelect(boxSelect: Vector | null) {
  interactionState.boxSelect = boxSelect
}

export function setDragEnd(dragEnd: Vector) {
  interactionState.dragEnd = dragEnd
}

export function setDragStart(dragStart: Vector) {
  interactionState.dragStart = dragStart
}

export function setDragging(dragging: boolean) {
  interactionState.dragging = dragging
}

export function setHoveredNodeId(nodeId: string | null) {
  interactionState.hoveredNodeId = nodeId
}

export function setHoveredFrameId(frameId: string | null) {
  interactionState.hoveredFrameId = frameId
}

export function setHoveredFunctionId(functionId: string | null) {
  interactionState.hoveredFunctionId = functionId
}
