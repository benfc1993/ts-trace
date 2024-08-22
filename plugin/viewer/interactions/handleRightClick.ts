import { removeNodeFromFrame } from '../frames/frames'
import { getNodeById } from '../nodes/getNodes'
import { getInteractionState } from './interactionState'
import { DragTarget } from './types'

export function handleRightClick() {
  const interactionState = getInteractionState()
  switch (interactionState.dragTarget) {
    case DragTarget.None:
    case DragTarget.Box:
    case DragTarget.Canvas:
    case DragTarget.Frame:
    case DragTarget.Function:
      return
    case DragTarget.Node:
      if (!interactionState.hoveredNodeId) return

      const node = getNodeById(interactionState.hoveredNodeId)
      if (node.groupId) removeNodeFromFrame(node.groupId, node)
  }
}
