import { bezier } from './components/bezier'
import { containedStyles } from './components/containedStyles'
import { connectionLines, createConnections } from './connections'
import { NODE_SPACING, drawFile } from './drawFile'
import { createFunctionPositions } from './functions'
import { addInteraction } from './interactions'
import { vector } from './math/createVector'
import { GraphNodes, parseGraph } from './parseGraph'
import { State, Vector } from './types'

const lineColor = '#ffffff'
const lineUnfocusedColor = '#3d3d3d'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
export const ctx = canvas.getContext('2d')!
if (!ctx) throw new Error('No context')

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

let nodes: GraphNodes = {}
export const higlightedConnections: Set<string> = new Set()

async function setup() {
  nodes = await parseGraph()
  addInteraction(canvas)
  resize()
  createFunctionPositions()
  createConnections()
  console.log(connectionLines)
  let font = new FontFace('roboto-mono', 'url(fonts/roboto-mono.ttf)', {
    style: 'normal',
    weight: '400',
  })
  await font.load().then((font) => document.fonts.add(font))

  draw()
}

export const state: State = {
  lastClick: vector(),
  dragstart: vector(),
  dragging: false,
  draggingBlocked: false,
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
