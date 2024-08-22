import {
  frameTitleHovered,
  getFrame,
  removeNodeFromFrame,
} from '../frames/frames'
import { clickOnFunction } from '../nodes/clickOnFunction'
import { getNodeById } from '../nodes/getNodes'
import { startBoxSelect } from './boxSelection'
import {
  clearSelection,
  getInteractionState,
  setDragging,
} from './interactionState'
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
      setDragging(true)
      return
    case DragTarget.Frame:
      if (!interactionState.hoveredFrameId) return
      const frame = getFrame(interactionState.hoveredFrameId)

      if (frameTitleHovered(frame)) {
        //TODO: edit name input
        return
      }
      setDragging(true)
    case DragTarget.Node:
      if (!interactionState.hoveredNodeId) return
      if (interactionState.heldKeys.has('Shift')) {
        interactionState.selectedNodeIds.add(interactionState.hoveredNodeId)
        return
      }
      if (interactionState.heldKeys.has('Control')) {
        if (!interactionState.hoveredNodeId) return

        const node = getNodeById(interactionState.hoveredNodeId)
        if (node.groupId) removeNodeFromFrame(node.groupId, node)
      }
      if (!interactionState.selectedNodeIds.has(interactionState.hoveredNodeId))
        clearSelection()

      setDragging(true)
      return
  }
}
