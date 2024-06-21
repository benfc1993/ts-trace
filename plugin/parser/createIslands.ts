import { ApplicationTraces } from './types'

export function generateIslands(nodes: ApplicationTraces) {
  const fileIslands: Record<string, [number, boolean]> = {}
  let islandIndex = -1

  Object.entries(nodes).forEach(([filePath, node]) => {
    const isIsland = Object.values(node.calledBy).length === 0
    if (!fileIslands[filePath])
      fileIslands[filePath] = [++islandIndex, isIsland]
    if (fileIslands[filePath])
      fileIslands[filePath][1] = isIsland && fileIslands[filePath][1]
  })
  console.log(fileIslands)

  const rootFiles = Object.entries(fileIslands).reduce(
    (acc: string[], [filePath, island]) => {
      if (island[1]) acc.push(filePath)
      return acc
    },
    [],
  )

  return rootFiles
}
