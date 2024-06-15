import { calls } from '../../pathfinder'
import type { Trace } from '../../types'
import { getOrAddFileTraces } from '../utils'

export function addReverseLinks() {
  const files = Object.entries(calls)

  files.forEach(([filePath, fileTraces]) => {
    Object.entries(fileTraces.traces).forEach(
      ([sourceFunctionName, traces]) => {
        traces.externalTraces.forEach((externalTrace) => {
          const targetFilePath = externalTrace.filePath
          const targetFunctionName = createCallableName(externalTrace)
          const file = getOrAddFileTraces(externalTrace.filePath)
          if (!file.calledBy[targetFunctionName]) {
            calls[targetFilePath].calledBy[targetFunctionName] = []
          }
          if (!file.calledBy[targetFunctionName].includes(filePath))
            file.calledBy[targetFunctionName].push(
              `${filePath}#${sourceFunctionName}`,
            )
        })
      },
    )
  })
}

export function createCallableName(trace: Trace): string {
  switch (trace.type) {
    case 'function':
      return trace.externalName
    case 'object':
      return `${trace.objectName}.${trace.externalName}.o.`
    case 'class':
      return `${trace.className}.${trace.externalName}.c.`
  }
}
