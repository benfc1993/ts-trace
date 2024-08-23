import io from 'socket.io-client'
import { GraphNode } from './parseGraph'
import { reset } from './reset'
import { Frame } from './frames/types'

const socket = io('http://localhost:9476', { reconnection: false })

export function connectToServer() {
  socket.on('connected', () => {
    console.log(`${socket.id} connected`)
  })
  socket.on('disconnected', () => {
    socket.close()
  })
  socket.on('reload', () => {
    reset()
  })
}

export function updateFilePosition(node: GraphNode) {
  socket.emit('updateFilePosition', {
    filePath: node.filePath,
    position: node.position,
  })
}

export function saveFrame(frame: Frame) {
  socket.emit('saveFrame', {
    name: frame.name,
    id: frame.id,
    nodes: Array.from(frame.nodes).map((node) => node.filePath),
  })
}
