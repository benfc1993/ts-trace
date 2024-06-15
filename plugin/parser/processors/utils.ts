import { cwd } from 'process'
import { calls } from '../pathfinder'

export function projectRelativePath(filePath: string) {
  return filePath.replace(cwd(), '')
}

export function getOrAddFileTraces(filePath: string) {
  if (calls[filePath]) return calls[filePath]
  calls[filePath] = {
    traces: {},
    exports: [],
    calledBy: {},
  }
  return calls[filePath]
}
