import { ctx } from '..'
import { containedStyles } from '../components/containedStyles'
import { getInteractionState } from '../interactions/interactions'
import { Vector } from '../libs/math/Vector'
import { GraphNode } from '../parseGraph'
import { getNodeDimensions } from './getNodeDimensions'

export const NODE_LINE_HEIGHT = 25
export const NODE_BORDER_WIDTH = 2
export const NODE_WIDTH = 200
export const NODE_BOX_WIDTH = NODE_WIDTH + NODE_BORDER_WIDTH
export const NODE_PADDING = 5
export const NODE_SPACING = 100
export const HALF_NODE_SPACING = NODE_SPACING / 2

let hoveredFunction: string | null = null
export function setHoveredFunction(connectionId: string | null) {
  hoveredFunction = connectionId
}

export function drawNode(graphNode: GraphNode) {
  const { position, functions } = graphNode
  const nodeName = graphNode.filePath

  const NODE_PADDING = 5
  const adjustedFileName = adjustNodeName(nodeName)
  const { x, y, width, height } = getNodeDimensions(graphNode)
  containedStyles(() => {
    const interactionState = getInteractionState()
    ctx.fillStyle = '#555'
    ctx.strokeStyle = interactionState.selectedNodeIds.has(graphNode.filePath)
      ? '#bad455'
      : '#f2f2f2'
    ctx.lineWidth = NODE_BORDER_WIDTH
    ctx.fillRect(x, y, width, height)
    ctx.strokeRect(x, y, width, height)
    ctx.fillStyle = '#f2f2f2'
    ctx.font = '12px roboto-mono'
    ctx.fillText(
      adjustedFileName,
      x + NODE_PADDING,
      y + NODE_LINE_HEIGHT / 2 + NODE_PADDING,
      width - NODE_PADDING * 2,
    )
    Object.entries(functions).forEach(([functionName, functionDetails], i) => {
      drawFunction(
        `${nodeName}#${functionName}`,
        functionName,
        functionDetails.exported,
        new Vector(position.x, position.y + NODE_LINE_HEIGHT * (i + 1)),
        width,
        NODE_LINE_HEIGHT,
      )
    })
  })
}

function drawFunction(
  connectionId: string,
  functionName: string,
  exported: boolean,
  position: Vector,
  width: number,
  height: number,
) {
  const radius = 3
  containedStyles(() => {
    ctx.fillStyle = connectionId === hoveredFunction ? '#999999' : '#00000000'
    ctx.fillRect(position.x + 1, position.y, width - 2, height)
    ctx.fillStyle = '#f2f2f2'
    ctx.fillText(
      (exported ? 'E ' : '') + functionName,
      position.x + NODE_PADDING * 2,
      position.y + height / 2 + 5,
      width - NODE_PADDING * 2,
    )
    ctx.beginPath()
    ctx.ellipse(
      position.x + width,
      position.y + height / 2,
      radius,
      radius,
      0,
      0,
      2 * Math.PI,
    )
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(
      position.x,
      position.y + height / 2,
      radius,
      radius,
      0,
      0,
      2 * Math.PI,
    )
    ctx.closePath()
    ctx.fill()
  })
}
function adjustNodeName(nodeName: string) {
  const parts = nodeName.split('/')
  const nodeModulesIndex = parts.indexOf('node_modules')
  if (nodeModulesIndex < 0) return nodeName
  const set = new Set(parts)
  set.delete('@types')

  return Array.from(set)
    .slice(nodeModulesIndex, nodeModulesIndex + 2)
    .join('/')
}
