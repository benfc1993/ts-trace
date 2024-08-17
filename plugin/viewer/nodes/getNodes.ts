import { nodes } from '../parseGraph'

export function getNodeById(connectionId: string) {
  const [filePath] = connectionId.split('#')
  return nodes[filePath]
}

export function getFunctionById(connectionId: string) {
  const [filePath, functionName] = connectionId.split('#')
  return nodes[filePath].functions[functionName]
}
