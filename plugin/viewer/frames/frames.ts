import { Mouse } from '..'
import { Vector } from '../libs/math/Vector'
import { moveNode } from '../nodes/moveNode'
import { GraphNode } from '../parseGraph'
import { calculateFrameBounds, fitFrameToNode } from './calculateFrameBounds'
import { Frame, Frames } from './types'
import { uuid } from '../libs/uuid'
import { getNodeDimensions } from '../nodes/getNodeDimensions'
import { saveFrame } from '../connectToServer'

const frames: Frames = {}
export function clearFrames() {
  Object.keys(frames).forEach(clearFrame)
}

export function clearFrame(frameId: string) {
  const frame = frames[frameId]
  frame.nodes.forEach((node) => removeNodeFromFrame(frameId, node))
}

export function deleteFrame(frameId: string) {
  delete frames[frameId]
}

export function getFrames() {
  return frames
}

export function getFrame(frameId: string) {
  return frames[frameId]
}

export function createFrame(id?: string) {
  const frameId = id ?? uuid()

  frames[frameId] = {
    id: frameId,
    name: 'New frame',
    bounds: { start: Vector.Zero(), end: Vector.Zero() },
    nodes: new Set(),
    titleBounds: { start: Vector.Zero(), end: Vector.Zero() },
  }

  return frames[frameId]
}

export function addNodeToFrame(frameId: string, node: GraphNode) {
  const frame = frames[frameId]
  frame.nodes.add(node)
  node.groupId = frameId

  const { start, end } = fitFrameToNode(frame.bounds, node)
  frame.bounds = { start, end }
  saveFrame(frame)
}

export function removeNodeFromFrame(frameId: string, node: GraphNode) {
  node.groupId = null
  const frame = frames[frameId]
  frame.nodes.delete(node)
  saveFrame(frame)

  if (frame.nodes.size <= 0) return deleteFrame(frameId)
}

export function getFrameNodes(frameId: string) {
  return frames[frameId].nodes
}

export function getFrameBounds(frameId: string) {
  return frames[frameId].bounds
}

export function updateFrameBounds(frameId: string) {
  const { start, end } = calculateFrameBounds(frames[frameId])
  frames[frameId].bounds = { start, end }
}
export function nodeWithinFrame(frameId: string, node: GraphNode) {
  const frame = frames[frameId]
  const {
    x: nodeX,
    y: nodeY,
    width: nodeWidth,
    height: nodeHeight,
  } = getNodeDimensions(node)
  return (
    nodeX > frame.bounds.start.x &&
    nodeX + nodeWidth < frame.bounds.end.x &&
    nodeY > frame.bounds.start.y &&
    nodeY + nodeHeight < frame.bounds.end.y
  )
}

export function moveFrame(frameId: string, delta: Vector) {
  const { bounds, nodes } = frames[frameId]
  bounds.start.x += delta.x
  bounds.end.x += delta.x
  bounds.start.y += delta.y
  bounds.end.y += delta.y

  nodes.forEach((node) => {
    moveNode(node, delta)
  })
}

export function getHoveredFrameId() {
  const frames = Object.entries(getFrames())
  for (let i = frames.length - 1; i >= 0; i--) {
    const [frameName, frame] = frames[i]
    if (
      Mouse.canvasPosition.x > frame.bounds.start.x &&
      Mouse.canvasPosition.x < frame.bounds.end.x &&
      Mouse.canvasPosition.y > frame.bounds.start.y &&
      Mouse.canvasPosition.y < frame.bounds.end.y
    ) {
      return frameName
    }
  }
  return null
}

export function frameTitleHovered(frame: Frame) {
  return (
    Mouse.canvasPosition.x > frame.titleBounds.start.x &&
    Mouse.canvasPosition.x < frame.titleBounds.end.x &&
    Mouse.canvasPosition.y > frame.titleBounds.start.y &&
    Mouse.canvasPosition.y < frame.titleBounds.end.y
  )
}
