import { Mouse, ctx, state } from '..'
import { getHoveredFrameId, moveFrame } from '../frames/frames'
import { Vector } from '../libs/math/Vector'
import {
  getHoveredFunctionId,
  getHoveredNodeId,
} from '../nodes/clickOnFunction'
import { setHoveredFunction } from '../nodes/drawNode'
import { getNodeById } from '../nodes/getNodes'
import { moveNode } from '../nodes/moveNode'
import { updateBoxSelection } from './boxSelection'
import {
  getInteractionState,
  setDragEnd,
  setDragStart,
  setDragTarget,
  setHoveredFrameId,
  setHoveredFunctionId,
  setHoveredNodeId,
} from './interactionState'
import { DragTarget } from './types'

export function handleMouseMove(event: MouseEvent) {
  const interactionState = getInteractionState()

  const mouseMove = updateMouseMove(event)
  setHoveredFunction(null)

  if (interactionState.dragging) return handleDragging(mouseMove)

  if (interactionState.dragTarget === DragTarget.Canvas) return
  if (interactionState.dragTarget === DragTarget.Box) {
    updateBoxSelection()
    return
  }

  updateDragTarget()
}

export function updateDragTarget() {
  setDragTarget(DragTarget.None)

  const hoveredFrameId = getHoveredFrameId()

  if (hoveredFrameId) {
    setHoveredElement(hoveredFrameId, DragTarget.Frame)
  }

  const hoveredNodeId = getHoveredNodeId()
  if (hoveredNodeId) {
    setHoveredElement(hoveredNodeId, DragTarget.Node)
  }

  const hoveredFunctionId = getHoveredFunctionId(hoveredNodeId)
  if (hoveredFunctionId) {
    setHoveredElement(hoveredFunctionId, DragTarget.Function)
    setHoveredFunction(hoveredFunctionId)
  }
}

function updateMouseMove(event: MouseEvent) {
  const interactionState = getInteractionState()
  const { canvas } = ctx
  Mouse.x = event.pageX - canvas.offsetLeft
  Mouse.y = event.pageY - canvas.offsetTop

  setDragEnd(
    new Vector(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop),
  )

  const mouseMove = new Vector(
    (interactionState.dragEnd.x - interactionState.dragStart.x) / state.scale,
    (interactionState.dragEnd.y - interactionState.dragStart.y) / state.scale,
  )
  const { dragEnd } = getInteractionState()

  setDragStart(new Vector(dragEnd.x, dragEnd.y))
  return mouseMove
}

function handleDragging(mouseMove: Vector) {
  const interactionState = getInteractionState()
  switch (interactionState.dragTarget) {
    case DragTarget.None:
    case DragTarget.Function:
      return
    case DragTarget.Canvas:
      state.canvasOrigin.x -= mouseMove.x
      state.canvasOrigin.y -= mouseMove.y
      ctx.translate(mouseMove.x, mouseMove.y)
      return
    case DragTarget.Frame:
      if (!interactionState.hoveredFrameId) return
      moveFrame(interactionState.hoveredFrameId, mouseMove)
      return
    case DragTarget.Node:
      if (!interactionState.hoveredNodeId) return
      const removeAfterDrag = !interactionState.selectedNodeIds.has(
        interactionState.hoveredNodeId,
      )

      interactionState.selectedNodeIds.add(interactionState.hoveredNodeId)

      interactionState.selectedNodeIds.forEach((id) => {
        const node = getNodeById(id)
        moveNode(node, mouseMove)
      })

      if (removeAfterDrag)
        interactionState.selectedNodeIds.delete(interactionState.hoveredNodeId)
      return
  }
}

function setHoveredElement(Id: string, type: DragTarget) {
  setDragTarget(type)
  setHoveredNodeId(type === DragTarget.Node ? Id : null)
  setHoveredFrameId(type === DragTarget.Frame ? Id : null)
  setHoveredFunctionId(type === DragTarget.Function ? Id : null)
}
