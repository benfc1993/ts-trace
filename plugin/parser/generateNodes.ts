import { readFileSync, writeFileSync } from 'fs'
import type { ApplicationTraces } from './types'
import type { FileNodes } from '../types'
import { createCallableName } from './processors/traces/reverseTraces'
import { generateIslands } from './createIslands'

const nodes: FileNodes = {}
const seen = new Set<string>()

export function createGraph() {
  const traces: ApplicationTraces = JSON.parse(
    readFileSync('.pathfinder/out.json', 'utf-8'),
  )
  const islandRoots = generateIslands(traces)

  generateNodes(traces, islandRoots)
  generateEdges(traces)

  const islandSplitNodes = Object.entries(nodes).reduce(
    (acc: Record<string, FileNodes>, [functionPath, fileNode]) => {
      if (!acc[fileNode.islandIndex]) acc[fileNode.islandIndex] = {}
      acc[fileNode.islandIndex][functionPath] = fileNode
      return acc
    },
    {},
  )

  writeFileSync('.pathfinder/graph.json', JSON.stringify(islandSplitNodes))
}

//TODO: if function is not exported and doesn't make external calls exclude it
//TODO: fix include internal calls

function generateNodes(traces: ApplicationTraces, islandRoots: string[]) {
  for (let i = 0; i < islandRoots.length; i++) {
    let islandIndex = i
    const islandRoot = islandRoots[i]
    const toVisit: string[] = [islandRoot]

    while (toVisit.length > 0) {
      const filePath = toVisit.shift()
      if (!filePath) break

      const callTrace = traces[filePath]
      if (!callTrace) continue

      const tracesArray = [
        ...Object.keys(callTrace.traces),
        ...callTrace.exports,
      ]
      let skip = false

      for (const trace of tracesArray) {
        if (seen.has(`${filePath}#${trace}`)) continue
        seen.add(`${filePath}#${trace}`)
        if (
          nodes[`${filePath}#${trace}`] &&
          nodes[`${filePath}#${trace}`].islandIndex !== islandIndex &&
          nodes[`${filePath}#${trace}`].islandIndex !== i
        ) {
          islandIndex = nodes[`${filePath}#${trace}`].islandIndex
          toVisit.unshift(islandRoot)
          skip = true
          break
        }
        nodes[`${filePath}#${trace}`] = {
          filePath,
          exported: callTrace.traces[trace]?.exported ?? false,
          in: [],
          out: [],
          islandIndex,
        }
      }

      if (!skip)
        Object.values(callTrace.traces).forEach((trace) => {
          trace.externalTraces.forEach((ext) => {
            if (!toVisit.includes(ext.filePath) && ext.filePath !== filePath)
              toVisit.push(ext.filePath)
          })
        })
    }
  }

  Object.entries(traces).forEach(([filePath]) => {
    const callTrace = traces[filePath]
    const tracesArray = [...Object.keys(callTrace.traces), ...callTrace.exports]
    tracesArray.forEach((trace) => {
      if (!seen.has(`${filePath}#${trace}`) && callTrace) {
        console.log('here')
        seen.add(`${filePath}#${trace}`)
        nodes[`${filePath}#${trace}`] = {
          filePath,
          exported: callTrace.traces[trace]?.exported ?? false,
          in: [],
          out: [],
          islandIndex: -1,
        }
      }
    })
  })
}

function generateEdges(applicationTraces: ApplicationTraces) {
  Object.entries(applicationTraces).forEach(([sourceFilePath, fileTrace]) => {
    Object.entries(fileTrace.traces).forEach(([functionName, callable]) => {
      callable.externalTraces.forEach((externalTrace) => {
        const callableName = createCallableName(externalTrace)
        const externalPath = `${externalTrace.filePath}#${callableName}`
        const externalCall = { connectionId: externalPath, ...externalTrace }
        const id = `${sourceFilePath}#${functionName}`
        if (!nodes[externalPath])
          nodes[externalPath] = {
            filePath: externalTrace.filePath,
            exported:
              applicationTraces[externalTrace.filePath]?.traces[
                externalTrace.externalName
              ]?.exported ?? false,
            in: [],
            out: [],
            islandIndex: nodes[id].islandIndex,
          }
        if (
          !nodes[id].out.find(
            (connection) =>
              connection.connectionId === externalCall.connectionId &&
              connection.lineNumber === externalCall.lineNumber,
          )
        )
          nodes[id].out.push(externalCall)
      })
    })

    Object.entries(fileTrace.calledBy).forEach(([functionName, calls]) => {
      calls.forEach((call) => {
        const nodeKey = `${sourceFilePath}#${functionName}`
        if (!nodes[nodeKey])
          nodes[nodeKey] = {
            filePath: sourceFilePath,
            exported:
              applicationTraces[sourceFilePath]?.traces[functionName]
                ?.exported ?? false,
            in: [],
            out: [],
            islandIndex: -1,
          }
        if (!nodes[nodeKey].in.includes(call)) nodes[nodeKey].in.push(call)
      })
    })
  })
}
