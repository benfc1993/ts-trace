import io from 'socket.io-client'
import { GraphNode } from './parseGraph'
import { reset } from './reset'

const socket = io('http://localhost:9476')

export function connectToServer() {
  socket.on('connected', () => {
    console.log(`${socket.id} connected`)
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
