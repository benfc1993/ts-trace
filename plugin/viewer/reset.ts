import { state } from '.'
import { createConnections } from './connections'
import { createFunctionPositions } from './functions'
import { clearFrames } from './frames/frames'
import { parseGraph } from './parseGraph'
import { Vector } from './libs/math/Vector'

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

  clearFrames()
  await parseGraph()
  createFunctionPositions()
  createConnections()
  state.paused = false
}
