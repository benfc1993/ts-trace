import { readFileSync, writeFileSync } from 'fs'
import { Project } from 'ts-morph'
import type { ApplicationTraces } from './types'
import path from 'path'
import { config } from '.'
import { processFiles } from './processors/processFiles'

export const calls: ApplicationTraces = {}

export const pathPointer = {
  filePath: '',
  functionName: '',
  functionIsExported: false,
}

export function pathfinder(singleFile: string | null = null) {
  const project = new Project({
    tsConfigFilePath: config.tsconfigPath,
  })
  if (singleFile) {
    const sourceFile = project.getSourceFile(singleFile)
    if (!sourceFile) return
    processFiles([sourceFile])
    const existing = JSON.parse(
      readFileSync('.pathfinder/out.json', 'utf-8') ?? '{}',
    ) as ApplicationTraces

    Object.entries(calls).forEach(
      ([filePath, { traces, exports, calledBy }]) => {
        const existingForFile = existing[filePath]
        existingForFile.exports = existingForFile.exports.concat(exports)
        Object.entries(traces).forEach(([functionName, trace]) => {
          existingForFile.traces[functionName] = trace
          existingForFile.traces[functionName].exported = trace.exported
        })
        Object.entries(calledBy).forEach(([functionName, calledBy]) => {
          if (existingForFile.calledBy[functionName]) {
            existingForFile.calledBy[functionName] =
              existingForFile.calledBy[functionName].concat(calledBy)
          }
        })
      },
    )
    writeFileSync('.pathfinder/out.json', JSON.stringify(existing))
  } else {
    processFiles(project.getSourceFiles())
    writeFileSync('.pathfinder/out.json', JSON.stringify(calls))
  }
}
