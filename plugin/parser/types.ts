import { ClassTrace, FunctionTrace, ObjectTrace } from '../types'

export type Trace = FunctionTrace | ClassTrace | ObjectTrace

export type FileTraces = {
  calledBy: { [functionName: string]: string[] }
  exports: string[]
  traces: {
    [functionName: string]: {
      functionName: string
      externalTraces: Trace[]
      exported: boolean
    }
  }
}

export type ApplicationTraces = {
  [sourceFile: string]: FileTraces
}

export type Config = {
  debug: boolean
  includeNodeModules: boolean
  includeInternalCalls: boolean
  tsconfigPath: string
}
