export type ExternalTrace = {
  internalName: string
  externalName: string
  filePath: string
  lineNumber: number
}

export type FunctionTrace = ExternalTrace & {
  type: 'function'
}

export type ClassTrace = ExternalTrace & {
  type: 'class'
  className: string
}

export type ObjectTrace = ExternalTrace & {
  type: 'object'
  objectName: string
}

export type Connection = ExternalTrace & {
  connectionId: string
}

export type FileNodes = {
  [functionPath: string]: FileNode
}

export type FileNode = {
  filePath: string
  exported: boolean
  in: string[]
  out: Connection[]
  islandIndex: number
}
