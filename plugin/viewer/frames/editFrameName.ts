import { saveFrame } from '../connectToServer'
import {
  getInteractionState,
  setEditingFrameTitle,
} from '../interactions/interactionState'
import { getFrame } from './frames'

export function editFrameName(
  frameId: string,
  currentName: string,
  inputKey: string,
) {
  const frame = getFrame(frameId)
  switch (inputKey) {
    case 'Enter':
      if (frame.name === '') frame.name = currentName
      else stopEditingFrameName()
      break
    case 'Escape':
      setEditingFrameTitle(null)
      frame.name = currentName
      break
    case 'Backspace':
      frame.name = frame.name.slice(0, frame.name.length - 1)
      break
    case 'Meta':
    case 'Shift':
    case 'Control':
    case 'Alt':
      break
    default:
      frame.name += inputKey
  }
}

export function stopEditingFrameName() {
  const interactionState = getInteractionState()
  if (!interactionState.editingFrameName) return
  const frame = getFrame(interactionState.editingFrameName.frameId)
  saveFrame(frame)
  setEditingFrameTitle(null)
}
