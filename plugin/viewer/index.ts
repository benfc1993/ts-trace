import { bezier } from './components/bezier'
import { containedStyles } from './components/containedStyles'
import { connectToServer } from './connectToServer'
import { connectionLines, createConnections } from './connections'
import { NODE_SPACING, drawFile } from './drawFile'
import { createFunctionPositions } from './functions'
import { clearGroups, drawGroups } from './groups/groups'
import { addInteraction } from './interactions'
import { vector } from './math/createVector'
import { nodes, parseGraph } from './parseGraph'
import { reset } from './reset'
import { State, Vector } from './types'

connectToServer()

const lineColor = '#ffffff'
const lineUnfocusedColor = '#3d3d3d'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
export const ctx = canvas.getContext('2d')!
if (!ctx) throw new Error('No context')

export const state: State = {
  lastClick: vector(),
  dragstart: vector(),
  dragging: false,
  draggingBlocked: false,
  draggedGroup: null,
  draggedFileNode: null,
  width: canvas.width,
  height: canvas.height,
  zoomIntensity: 0.1,
  zoomMax: 3,
  zoomMin: 0.2,
  canvasOrigin: vector(),
  scale: 1,
  dragTimeout: null,
  draggingTimeout: false,
}

export function resize() {
  const changeX = ctx.canvas.width - document.body.clientWidth
  const changeY = ctx.canvas.height - document.body.clientHeight

  ctx.translate(state.canvasOrigin.x, state.canvasOrigin.y)
  ctx.canvas.width = document.body.clientWidth
  ctx.canvas.height = document.body.clientHeight

  state.canvasOrigin.x -= changeX / state.scale - changeX / state.scale
  state.canvasOrigin.y -= changeY / state.scale - changeY / state.scale

  ctx.scale(state.scale, state.scale)
  ctx.translate(-state.canvasOrigin.x, -state.canvasOrigin.y)
}

export const higlightedConnections: Set<string> = new Set()

// export async function reset() {
//   // cleanState()
//   try {
//     const savedState = JSON.parse(
//       localStorage.getItem('pathfinder-view') ?? '',
//     ) as {
//       scale: number
//       canvasOrigin: Vector
//     }
//     state.scale = savedState.scale
//     state.canvasOrigin = savedState.canvasOrigin
//   } catch (e) {}
//
//   await parseGraph()
//   resize()
//   createFunctionPositions()
//   createConnections()
//
//   let font = new FontFace('roboto-mono', 'url(fonts/roboto-mono.ttf)', {
//     style: 'normal',
//     weight: '400',
//   })
//   await font.load().then((font) => document.fonts.add(font))
// }

async function setup() {
  await reset()
  resize()
  let font = new FontFace('roboto-mono', 'url(fonts/roboto-mono.ttf)', {
    style: 'normal',
    weight: '400',
  })
  await font.load().then((font) => document.fonts.add(font))
  addInteraction(canvas)
  draw()
}

export const Mouse = {
  x: 0,
  y: 0,
  get canvasPosition() {
    return {
      x: this.x / state.scale + state.canvasOrigin.x,
      y: this.y / state.scale + state.canvasOrigin.y,
    }
  },
}

function draw() {
  console.log('draw')
  localStorage.setItem(
    'pathfinder-view',
    JSON.stringify({ scale: state.scale, canvasOrigin: state.canvasOrigin }),
  )
  const visibleWidth = ctx.canvas.width / state.scale
  const visibleHeight = ctx.canvas.height / state.scale

  ctx.font = '11px roboto-mono'
  ctx.clearRect(
    state.canvasOrigin.x,
    state.canvasOrigin.y,
    visibleWidth,
    visibleHeight,
  )
  containedStyles(() => {
    ctx.fillStyle = '#222'
    ctx.fillRect(
      state.canvasOrigin.x,
      state.canvasOrigin.y,
      visibleWidth,
      visibleHeight,
    )
  })

  drawGroups()

  const defered: { start: Vector; end: Vector }[] = []

  for (const [connection, { start, end }] of Object.entries(connectionLines)) {
    if (higlightedConnections.has(connection)) {
      defered.push({ start, end })
      continue
    }
    containedStyles(() => {
      ctx.strokeStyle =
        higlightedConnections.size === 0 ? lineColor : lineUnfocusedColor
      bezier(
        start,
        vector(start.x + NODE_SPACING, start.y),
        vector(end.x - NODE_SPACING, end.y),
        end,
        156,
      )
    })
  }
  Object.entries(nodes).forEach(([file, node]) => {
    drawFile(file, node)
  })

  defered.forEach(({ start, end }) => {
    containedStyles(() => {
      ctx.strokeStyle = lineColor
      bezier(
        start,
        vector(start.x + NODE_SPACING, start.y),
        vector(end.x - NODE_SPACING, end.y),
        end,
        156,
      )
    })
  })

  requestAnimationFrame(() => draw())
}

setup()
