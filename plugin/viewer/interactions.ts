import { Mouse, ctx, resize, state } from '.'
import {
  clickOnFunction,
  getHoveredFile,
  getHoveredFunction,
} from './clickOnFunction'
import { updateFilePosition } from './connectToServer'
import { setHoveredFunction } from './drawFile'
import { getGroupNodes, getHoveredGroup, moveGroup } from './groups/groups'
import { vector } from './math/createVector'
import { moveFile } from './moveFile'
import { nodes } from './parseGraph'
import { Vector } from './types'

window.addEventListener('resize', resize)

export function addInteraction(canvas: HTMLCanvasElement) {
  canvas.addEventListener('click', (event) => {
    if (clickOnFunction(event)) return
  })

  canvas.addEventListener('mousedown', (event) => {
    state.dragstart.x = event.pageX - canvas.offsetLeft
    state.dragstart.y = event.pageY - canvas.offsetTop
    state.lastClick.x = state.dragstart.x
    state.lastClick.y = state.dragstart.y

    const hoveredFile = getHoveredFile()

    if (hoveredFile) {
      const node = nodes[hoveredFile]
      state.draggedFileNode = node

      return
    }
    state.draggedFileNode = null

    const hoveredGroup = getHoveredGroup()
    if (hoveredGroup) {
      state.draggedGroup = hoveredGroup
      return
    }
    state.draggedGroup = null

    if (state.draggingBlocked) return

    state.dragging = true
  })

  canvas.addEventListener('mousemove', (event) => {
    document.querySelector('body')!.style.cursor = 'grab'
    Mouse.x = event.pageX - canvas.offsetLeft
    Mouse.y = event.pageY - canvas.offsetTop

    if (!state.draggedFileNode && !state.draggedGroup) {
      const hoveredFunction = getHoveredFunction()
      setHoveredFunction(hoveredFunction)

      if (hoveredFunction) {
        state.draggingBlocked = true
        document.querySelector('body')!.style.cursor = 'pointer'
        return
      }

      const hoveredFile = getHoveredFile()
      if (hoveredFile) {
        state.draggingBlocked = true
        document.querySelector('body')!.style.cursor = 'move'
        return
      }

      const hoveredGroup = getHoveredGroup()
      if (hoveredGroup) {
        state.draggingBlocked = true
        document.querySelector('body')!.style.cursor = 'move'
        return
      }

      state.draggingBlocked = false
    }

    const dragend: Vector = vector(
      event.pageX - canvas.offsetLeft,
      event.pageY - canvas.offsetTop,
    )
    const mouseMovedX = (dragend.x - state.dragstart.x) / state.scale
    const mouseMovedY = (dragend.y - state.dragstart.y) / state.scale
    state.dragstart.x = dragend.x
    state.dragstart.y = dragend.y

    if (state.draggedGroup) {
      moveGroup(state.draggedGroup, vector(mouseMovedX, mouseMovedY))
      return
    }

    if (state.draggedFileNode) {
      moveFile(state.draggedFileNode, vector(mouseMovedX, mouseMovedY))
      return
    }
    if (!state.dragging) return
    document.querySelector('body')!.style.cursor = 'grabbing'
    state.canvasOrigin.x -= mouseMovedX
    state.canvasOrigin.y -= mouseMovedY
    ctx.translate(mouseMovedX, mouseMovedY)
  })

  canvas.addEventListener('mouseup', completeDragging)

  canvas.addEventListener('mouseout', completeDragging)

  canvas.addEventListener('wheel', (event) => {
    event.preventDefault()
    const mousex = event.pageX - canvas.offsetLeft
    const mousey = event.pageY - canvas.offsetTop
    const wheel = -event.deltaY / 100

    const zoom = Math.exp(wheel * state.zoomIntensity)

    if (
      state.scale * zoom > state.zoomMax ||
      state.scale * zoom < state.zoomMin
    )
      return

    ctx.translate(state.canvasOrigin.x, state.canvasOrigin.y)

    state.canvasOrigin.x -= mousex / (state.scale * zoom) - mousex / state.scale
    state.canvasOrigin.y -= mousey / (state.scale * zoom) - mousey / state.scale

    ctx.scale(zoom, zoom)
    ctx.translate(-state.canvasOrigin.x, -state.canvasOrigin.y)

    state.scale *= zoom
  })
}

function completeDragging() {
  if (state.draggedFileNode) {
    updateFilePosition(state.draggedFileNode)
  }

  if (state.draggedGroup) {
    getGroupNodes(state.draggedGroup).forEach(updateFilePosition)
  }

  state.draggedGroup = null
  state.draggedFileNode = null
  state.dragging = false
  state.dragstart.x = 0
  state.dragstart.y = 0
  state.draggingTimeout = true
  if (state.dragTimeout) clearTimeout(state.dragTimeout)
  state.dragTimeout = setTimeout(() => (state.draggingTimeout = false), 50)
}
