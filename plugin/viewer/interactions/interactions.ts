import { resize, state } from '..'
import { updateFilePosition } from '../connectToServer'
import {
  createFrame,
  addNodeToFrame,
  getFrameNodes,
  removeNodeFromFrame,
  getHoveredFrameId,
  nodeWithinFrame,
} from '../frames/frames'
import { Vector } from '../libs/math/Vector'
import { handleMouseMove, updateDragTarget } from './handleMouseMove'
import { Cursor, DragTarget, InteractionState } from './types'
import { handleZoom } from './handleZoom'
import { getNodeById } from '../nodes/getNodes'
import { handleLeftClick } from './handleLeftClick'
import { Immutable } from '../libs/Immutable'
import { handleRightClick } from './handleRightClick'

window.addEventListener('resize', resize)

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

export function addInteraction(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mouseup', (event) => {
    completeDragging(event.button === 0)
    handleMouseMove(event)
  })

  canvas.addEventListener('mouseout', () => completeDragging())

  canvas.addEventListener('wheel', handleZoom)

  window.addEventListener('keydown', (event) => {
    interactionState.heldKeys.add(event.key)
    if (event.key === ' ') state.paused = !state.paused

    if (event.key === 'Alt') {
      setHoveredElement('', DragTarget.Canvas)
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
    interactionState.heldKeys.delete(event.key)
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
  if (interactionState.boxSelect) {
    interactionState.boxSelect = null
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

  interactionState.dragging = false
  setHoveredElement(
    '',
    interactionState.dragTarget === DragTarget.Canvas
      ? DragTarget.Canvas
      : DragTarget.None,
  )
}

export function setHoveredElement(Id: string, type: DragTarget) {
  interactionState.dragTarget = type
  interactionState.hoveredNodeId = type === DragTarget.Node ? Id : null
  interactionState.hoveredFrameId = type === DragTarget.Frame ? Id : null
  interactionState.hoveredFunctionId = type === DragTarget.Function ? Id : null
}

export function updateCursor(): Cursor {
  switch (interactionState.dragTarget) {
    case DragTarget.None:
      return 'default'
    case DragTarget.Canvas:
      return interactionState.dragging ? 'grabbing' : 'grab'
    case DragTarget.Frame:
      return 'move'
    case DragTarget.Node:
      return 'move'
    case DragTarget.Function:
      return 'pointer'
    default:
      return 'default'
  }
}

export function clearSelection() {
  interactionState.selectedNodeIds.clear()
}

export function setDragTarget(dragTarget: DragTarget) {
  interactionState.dragTarget = dragTarget
}

export function setBoxSelect(boxSelect: Vector) {
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
