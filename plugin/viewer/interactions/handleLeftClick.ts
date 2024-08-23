import { stopEditingFrameName } from '../frames/editFrameName'
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
  setEditingFrameTitle,
} from './interactionState'
import { DragTarget } from './types'

export function handleLeftClick() {
  const interactionState = getInteractionState()
  switch (interactionState.dragTarget) {
    case DragTarget.None:
      if (!interactionState.heldKeys.has('Shift')) clearSelection()
      stopEditingFrameName()
      startBoxSelect()
      return
    case DragTarget.Function:
      if (interactionState.hoveredFunctionId)
        clickOnFunction(interactionState.hoveredFunctionId)
      stopEditingFrameName()
      return
    case DragTarget.Canvas:
      setDragging(true)
      stopEditingFrameName()
      return
    case DragTarget.Frame:
      if (!interactionState.hoveredFrameId) return
      const frame = getFrame(interactionState.hoveredFrameId)

      if (frameTitleHovered(frame)) {
        setEditingFrameTitle({ frameId: frame.id, currentName: frame.name })
        return
      }
      stopEditingFrameName()
      setDragging(true)
      return
    case DragTarget.Node:
      stopEditingFrameName()
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
