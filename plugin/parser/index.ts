import { cpSync, existsSync, mkdirSync, rmSync } from 'fs'
import { createGraph } from './generateNodes'
import { pathfinder } from './pathfinder'
import path from 'path'
import { argv } from 'process'
import { Config } from './types'

export const config: Config = {
  debug: process.argv.indexOf('--debug') > 0,
  includeNodeModules: argv.indexOf('--include-node-modules') > 0,
  includeInternalCalls: argv.indexOf('--include-internal') > 0,
  tsconfigPath:
    argv.indexOf('-p') > 0 ? argv[argv.indexOf('-p') + 1] : 'tsconfig.json',
}

if (!existsSync('.pathfinder')) {
  mkdirSync('.pathfinder')
}

const singleFile =
  argv.indexOf('--single-file') > 0
    ? argv[argv.indexOf('--single-file') + 1]
    : null

pathfinder(singleFile)
createGraph()
cpSync(path.join(__dirname, './viewer'), '.pathfinder', { recursive: true })
