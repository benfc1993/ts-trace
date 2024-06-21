import { state } from '.'
import { createConnections } from './connections'
import { createFunctionPositions } from './functions'
import { clearGroups } from './groups/groups'
import { parseGraph } from './parseGraph'
import { Vector } from './types'

export async function reset() {
  state.paused = true
  try {
    const savedState = JSON.parse(
      localStorage.getItem('pathfinder-view') ?? '',
    ) as {
      scale: number
      canvasOrigin: Vector
    }
    state.scale = savedState.scale
    state.canvasOrigin = savedState.canvasOrigin
  } catch (e) {}

  clearGroups()
  await parseGraph()
  createFunctionPositions()
  createConnections()
  state.paused = false
}
