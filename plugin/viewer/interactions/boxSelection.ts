import { Mouse, ctx, state } from '..'
import { SELECTED_COLOR } from '../colors'
import { containedStyles } from '../components/containedStyles'
import { Vector } from '../libs/math/Vector'
import { getNodeDimensions } from '../nodes/getNodeDimensions'
import { nodes } from '../parseGraph'
import {
  getInteractionState,
  setBoxSelect,
  setDragTarget,
} from './interactionState'
import { DragTarget } from './types'

export function startBoxSelect() {
  setDragTarget(DragTarget.Box)
  setBoxSelect(new Vector(Mouse.canvasPosition.x, Mouse.canvasPosition.y))
}

export function updateBoxSelection() {
  const interactionState = getInteractionState()

  if (!interactionState.boxSelect) return

  const boxWidth =
    (interactionState.dragEnd.x -
      (interactionState.boxSelect.x - state.canvasOrigin.x) * state.scale) /
    state.scale
  const boxHeight =
    (interactionState.dragEnd.y -
      (interactionState.boxSelect.y - state.canvasOrigin.y) * state.scale) /
    state.scale

  let boxX1 = interactionState.boxSelect.x,
    boxX2 = interactionState.boxSelect.x + boxWidth,
    boxY1 = interactionState.boxSelect.y,
    boxY2 = interactionState.boxSelect.y + boxHeight

  if (boxWidth < 1) {
    const temp = boxX1
    boxX1 = boxX2
    boxX2 = temp
  }

  if (boxHeight < 1) {
    const temp = boxY1
    boxY1 = boxY2
    boxY2 = temp
  }

  Object.values(nodes).forEach((node) => {
    const {
      x: nodeX,
      y: nodeY,
      width: nodeWidth,
      height: nodeHeight,
    } = getNodeDimensions(node)
    if (
      interactionState.boxSelect &&
      !(
        nodeX + nodeWidth < boxX1 ||
        nodeX > boxX2 ||
        nodeY + nodeHeight < boxY1 ||
        nodeY > boxY2
      )
    )
      interactionState.selectedNodeIds.add(node.filePath)
  })
}

export function drawBoxSelect() {
  containedStyles(() => {
    const interactionState = getInteractionState()

    if (interactionState.boxSelect) {
      ctx.strokeStyle = SELECTED_COLOR
      ctx.fillStyle = SELECTED_COLOR + '10'
      const x = interactionState.boxSelect.x,
        y = interactionState.boxSelect.y,
        w =
          (interactionState.dragEnd.x -
            (interactionState.boxSelect.x - state.canvasOrigin.x) *
              state.scale) /
          state.scale,
        h =
          (interactionState.dragEnd.y -
            (interactionState.boxSelect.y - state.canvasOrigin.y) *
              state.scale) /
          state.scale
      ctx.fillRect(x, y, w, h)
      ctx.strokeRect(x, y, w, h)
    }
  })
}
