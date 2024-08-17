import { clickOnFunction } from '../nodes/clickOnFunction'
import { startBoxSelect } from './boxSelection'
import {
  clearSelection,
  getInteractionState,
  setDragging,
} from './interactions'
import { DragTarget } from './types'

export function handleLeftClick() {
  const interactionState = getInteractionState()
  switch (interactionState.dragTarget) {
    case DragTarget.None:
      if (!interactionState.heldKeys.has('Shift')) clearSelection()

      startBoxSelect()
      return
    case DragTarget.Function:
      if (interactionState.hoveredFunctionId)
        clickOnFunction(interactionState.hoveredFunctionId)
    case DragTarget.Canvas:
    case DragTarget.Frame:
      setDragging(true)
    case DragTarget.Node:
      if (!interactionState.hoveredNodeId) return
      if (interactionState.heldKeys.has('Shift')) {
        interactionState.selectedNodeIds.add(interactionState.hoveredNodeId)
        return
      }
      if (!interactionState.selectedNodeIds.has(interactionState.hoveredNodeId))
        clearSelection()

      setDragging(true)
      return
  }
}
