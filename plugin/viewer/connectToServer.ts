import io from 'socket.io-client'
import { GraphNode } from './parseGraph'
import { reset } from './reset'

const socket = io('http://localhost:9476')

export function connectToServer() {
  console.log('test')
  socket.on('connected', () => {
    console.log(`${socket.id} connected`)
  })
  socket.on('hello', (arg, callback) => {
    console.log(arg)
    callback('ack')
  })
  socket.on('reload', () => {
    reset()
    // document.location.reload()
  })
  socket.on('ping', () => {
    console.log('ping')
    socket.emit('pong')
  })
}

export function updateFilePosition(node: GraphNode) {
  socket.emit('updateFilePosition', {
    filePath: node.filePath,
    position: node.position,
  })
}
