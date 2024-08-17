import { Vector } from './libs/math/Vector'

export type State = {
  cursor: 'default' | 'grab' | 'grabbing' | 'move' | 'pointer'
  paused: boolean
  lastClick: Vector
  width: number
  height: number
  zoomIntensity: number
  zoomMax: number
  zoomMin: number
  scale: number
  canvasOrigin: Vector
  connectionsToDraw: Set<string>
}
