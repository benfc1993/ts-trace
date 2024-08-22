import { resize, state } from '..'
import { updateFilePosition } from '../connectToServer'
import {
  createFrame,
  addNodeToFrame,
  getFrameNodes,
  removeNodeFromFrame,
  getHoveredFrameId,
  nodeWithinFrame,
  frameTitleHovered,
  getFrame,
} from '../frames/frames'
import { handleMouseMove, updateDragTarget } from './handleMouseMove'
import { Cursor, DragTarget } from './types'
import { handleZoom } from './handleZoom'
import { getNodeById } from '../nodes/getNodes'
import { handleLeftClick } from './handleLeftClick'
import { handleRightClick } from './handleRightClick'
import {
  getInteractionState,
  setBoxSelect,
  setDragging,
  setDragTarget,
} from './interactionState'

window.addEventListener('resize', resize)

export function addInteraction(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mouseup', (event) => {
    completeDragging(event.button === 0)
    handleMouseMove(event)
  })

  canvas.addEventListener('mouseout', () => completeDragging())

  canvas.addEventListener('wheel', handleZoom)

  window.addEventListener('keydown', (event) => {
    const interactionState = getInteractionState()
    interactionState.heldKeys.add(event.key)

    if (event.key === 'Alt') {
      setDragTarget(DragTarget.Canvas)
    }

    if (event.key === 'f') {
      if (!interactionState.selectedNodeIds.size) return

      const newFrame = createFrame()

      interactionState.selectedNodeIds.forEach((id) => {
        const node = getNodeById(id)
        if (node.groupId !== null) removeNodeFromFrame(node.groupId, node)
        addNodeToFrame(newFrame.id, node)
      })
      interactionState.selectedNodeIds.clear()
    }
  })

  window.addEventListener('keyup', (event) => {
    getInteractionState().heldKeys.delete(event.key)
    if (event.key === 'Alt') updateDragTarget()
  })

  canvas.addEventListener('mousemove', handleMouseMove)

  window.addEventListener('contextmenu', (e) => e.preventDefault())
  window.addEventListener('mousedown', (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.button === 0) handleLeftClick()
    if (event.button === 2) handleRightClick()
  })
}

function completeDragging(checkFrame: boolean = false) {
  const interactionState = getInteractionState()
  if (interactionState.boxSelect) {
    setBoxSelect(null)
  }
  if (interactionState.hoveredNodeId) {
    const movedNode = getNodeById(interactionState.hoveredNodeId)
    updateFilePosition(movedNode)

    const hoveredFrame = getHoveredFrameId()
    const node = getNodeById(interactionState.hoveredNodeId)

    const hoveredNodeInFrame =
      checkFrame &&
      !movedNode.groupId &&
      hoveredFrame !== null &&
      nodeWithinFrame(hoveredFrame, node)

    const removeFromSelection = !interactionState.selectedNodeIds.has(
      interactionState.hoveredNodeId,
    )

    interactionState.selectedNodeIds.add(interactionState.hoveredNodeId)

    interactionState.selectedNodeIds.forEach((id) => {
      updateFilePosition(getNodeById(id))
    })

    if (hoveredNodeInFrame)
      interactionState.selectedNodeIds.forEach((id) => {
        addNodeToFrame(hoveredFrame, getNodeById(id))
      })
    if (removeFromSelection)
      interactionState.selectedNodeIds.delete(interactionState.hoveredNodeId)
  }

  if (interactionState.hoveredFrameId) {
    getFrameNodes(interactionState.hoveredFrameId).forEach(updateFilePosition)
  }

  setDragging(false)

  setDragTarget(
    interactionState.dragTarget === DragTarget.Canvas
      ? DragTarget.Canvas
      : DragTarget.None,
  )
}

export function updateCursor(): Cursor {
  const interactionState = getInteractionState()

  switch (interactionState.dragTarget) {
    case DragTarget.None:
      return 'default'
    case DragTarget.Canvas:
      return interactionState.dragging ? 'grabbing' : 'grab'
    case DragTarget.Frame:
      return frameTitleHovered(getFrame(interactionState.hoveredFrameId!))
        ? 'text'
        : 'move'
    case DragTarget.Node:
      return 'move'
    case DragTarget.Function:
      return 'pointer'
    default:
      return 'default'
  }
}
