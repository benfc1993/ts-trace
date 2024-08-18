import { containedStyles } from './components/containedStyles'
import { connectToServer } from './connectToServer'
import { connectionLines, drawConnection } from './connections'
import { drawNode } from './nodes/drawNode'
import { drawFrames } from './frames/frames'
import {
  addInteraction,
  getInteractionState,
  updateCursor,
} from './interactions/interactions'
import { Vector } from './libs/math/Vector'
import { nodes } from './parseGraph'
import { reset } from './reset'
import { State } from './types'
import { drawBoxSelect } from './interactions/boxSelection'

connectToServer()

const canvas = document.getElementById('canvas') as HTMLCanvasElement
export const ctx = canvas.getContext('2d')!
if (!ctx) throw new Error('No context')

export const state: State = {
  cursor: 'default',
  paused: false,
  lastClick: Vector.Zero(),
  width: canvas.width,
  height: canvas.height,
  zoomIntensity: 0.1,
  zoomMax: 3,
  zoomMin: 0.2,
  canvasOrigin: Vector.Zero(),
  scale: 1,
  connectionsToDraw: new Set<string>(),
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
  if (state.paused) return requestAnimationFrame(draw)

  state.connectionsToDraw.clear()
  state.connectionsToDraw = new Set(Object.keys(connectionLines))

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

  drawFrames()

  for (const connectionId of state.connectionsToDraw) {
    if (higlightedConnections.has(connectionId)) {
      continue
    }
    drawConnection(connectionId, higlightedConnections.size > 0)
  }

  Object.values(nodes).forEach((node) => {
    if (!node.groupId) drawNode(node)
  })

  higlightedConnections.forEach((connection) => {
    drawConnection(connection, false)
  })

  canvas.style.cursor = updateCursor()

  drawBoxSelect()

  requestAnimationFrame(draw)
}

setup()
