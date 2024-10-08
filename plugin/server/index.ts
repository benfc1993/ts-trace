import { execFile } from 'node:child_process'

import express from 'express'
import { watch, writeFileSync } from 'fs'
import { createServer } from 'http'
import { cwd } from 'process'
import { Server } from 'socket.io'
import { readFile } from 'fs/promises'
import { argv } from 'node:process'
import { dirname } from 'node:path'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer)
const responses: Set<string> = new Set()
const filePositionUpdatesQueue: {
  filePath: string
  position: { x: number; y: number }
}[] = []

let updateFilePositionLock = false
const rootDir = dirname(argv[argv.indexOf('-p') + 1])

io.on('connection', async (client) => {
  client.on('pong', () => {
    responses.delete(client.id)
  })

  client.on(
    'updateFilePosition',
    (data: { filePath: string; position: { x: number; y: number } }) => {
      filePositionUpdatesQueue.push(data)
      if (!updateFilePositionLock) {
        updateFilePositionLock = true
        saveUpdatedFilePositions()
      }
    },
  )
  client.on('saveFrame', saveFrame)
})

app.use(express.static(`${cwd()}/.pathfinder`))

app.get('/', (_req, res) => {
  res.sendFile(`./.pathfinder/index.html`)
})

httpServer.listen(9476, () => {
  console.log('Pathfinder is running on http://localhost:9476')

  if (process.argv.indexOf('--watch') < 0) return
  const watcher = watch(rootDir, { persistent: true, recursive: true })
  watcher.on('change', async (_, fileName) => {
    if (!fileName.includes('.pathfinder') && fileName.at(-1) === '~') {
      console.log(`file changed: ${fileName}`)
      execFile(
        `${cwd()}/bin/pathfinder`,
        [...argv, '--single-file', `${(fileName as string).replace('~', '')}`],
        async () => {
          io.emit('reload')
        },
      )
    }
  })
  watcher.unref()
})

async function saveUpdatedFilePositions() {
  const savedFilePositions = await readFile(
    `./.pathfinder/filePositions.json`,
    'utf-8',
  )
    .then((str) => JSON.parse(str))
    .catch(() => ({}))

  while (filePositionUpdatesQueue.length > 0) {
    const data = filePositionUpdatesQueue.shift()
    if (!data) break

    savedFilePositions[data.filePath] = data.position
  }

  writeFileSync(
    `./.pathfinder/filePositions.json`,
    JSON.stringify(savedFilePositions),
  )
  updateFilePositionLock = false
}

async function saveFrame(frameData: {
  id: string
  name: string
  nodes: string[]
}) {
  const savedFrames = await readFile(`./.pathfinder/frames.json`, 'utf-8')
    .then((str) => JSON.parse(str))
    .catch(() => ({}))

  savedFrames[frameData.id] = frameData

  writeFileSync('./.pathfinder/frames.json', JSON.stringify(savedFrames))
}
