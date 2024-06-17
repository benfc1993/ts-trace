import { ctx } from '.'
import { containedStyles } from './components/containedStyles'
import { vector } from './math/createVector'
import { GraphNode } from './parseGraph'
import { Vector } from './types'

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

export function drawFile(fileName: string, graphNode: GraphNode) {
  const { position, functions } = graphNode
  const functionCount = Object.keys(functions).length

  const NODE_PADDING = 5
  const adjustedFileName = adjustFileName(fileName)
  containedStyles(() => {
    ctx.fillStyle = `#${graphNode.islandIndex}${graphNode.islandIndex}${graphNode.islandIndex}`
    ctx.strokeStyle = '#f2f2f2'
    ctx.lineWidth = NODE_BORDER_WIDTH
    ctx.fillRect(
      position.x,
      position.y,
      NODE_WIDTH,
      NODE_LINE_HEIGHT + NODE_LINE_HEIGHT * functionCount,
    )
    ctx.strokeRect(
      position.x,
      position.y,
      NODE_WIDTH,
      NODE_LINE_HEIGHT + NODE_LINE_HEIGHT * functionCount,
    )
    ctx.fillStyle = '#f2f2f2'
    ctx.font = '12px roboto-mono'
    ctx.fillText(
      adjustedFileName,
      position.x + NODE_PADDING,
      position.y + NODE_LINE_HEIGHT / 2 + NODE_PADDING,
      NODE_WIDTH - NODE_PADDING * 2,
    )
    Object.entries(functions).forEach(([functionName, functionDetails], i) => {
      drawFunction(
        `${fileName}#${functionName}`,
        functionName,
        functionDetails.exported,
        vector(position.x, position.y + NODE_LINE_HEIGHT * (i + 1)),
        NODE_WIDTH,
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
function adjustFileName(fileName: string) {
  const parts = fileName.split('/')
  const nodeModulesIndex = parts.indexOf('node_modules')
  if (nodeModulesIndex < 0) return fileName
  const set = new Set(parts)
  set.delete('@types')

  return Array.from(set)
    .slice(nodeModulesIndex, nodeModulesIndex + 2)
    .join('/')
}
