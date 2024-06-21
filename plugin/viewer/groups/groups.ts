import { Mouse } from '..'
import { vector } from '../math/createVector'
import { moveFile } from '../moveFile'
import { GraphNode } from '../parseGraph'
import { Vector } from '../types'
import { calculateGroupBounds, fitGroupToNode } from './calculateGroupBounds'
import { drawGroup } from './drawGroup'
import { Groups } from './types'

const groups: Groups = {}
export function clearGroups() {
  Object.keys(groups).forEach((id) => delete groups[id])
}
export function getGroups() {
  return groups
}

export function getGroup(id: string) {
  return groups[id]
}

export function addGroup(id: string) {
  groups[id] = { id, bounds: { start: vector(), end: vector() }, nodes: [] }
}

export function addNodeToGroup(id: string, node: GraphNode) {
  const group = groups[id]
  group.nodes.push(node)

  const { start, end } = fitGroupToNode(group.bounds, node)
  group.bounds = { start, end }
}

export function removeNodeFromGroup(id: string, node: GraphNode) {
  groups[id].nodes = groups[id].nodes.filter((n) => n !== node)
}

export function getGroupNodes(id: string) {
  return groups[id].nodes
}

export function getGroupBounds(id: string) {
  return groups[id].bounds
}

export function updateGroupBounds(id: string) {
  const { start, end } = calculateGroupBounds(groups[id])
  groups[id].bounds = { start, end }
}

export function moveGroup(id: string, delta: Vector) {
  const { bounds, nodes } = groups[id]
  bounds.start.x += delta.x
  bounds.end.x += delta.x
  bounds.start.y += delta.y
  bounds.end.y += delta.y
  nodes.forEach((node) => {
    moveFile(node, delta)
  })
}

export function drawGroups() {
  Object.values(groups).forEach((group) => {
    updateGroupBounds(group.id)
    drawGroup(group)
  })
}

export function getHoveredGroup() {
  const groups = Object.entries(getGroups())
  for (let i = 0; i < groups.length; i++) {
    const [groupName, group] = groups[i]
    if (
      Mouse.canvasPosition.x > group.bounds.start.x &&
      Mouse.canvasPosition.x < group.bounds.end.x &&
      Mouse.canvasPosition.y > group.bounds.start.y &&
      Mouse.canvasPosition.y < group.bounds.end.y
    ) {
      return groupName
    }
  }
  return null
}
