import { writeFileSync } from 'fs'
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

export function pathfinder() {
  const project = new Project({
    tsConfigFilePath: config.tsconfigPath,
  })
  processFiles(project)
  writeFileSync(path.join(__dirname, 'out.json'), JSON.stringify(calls))
}
