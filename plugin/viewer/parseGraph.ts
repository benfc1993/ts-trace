import { readFileSync } from "fs";
import type { Connection, FileNodes } from "../types";
import { Vector } from "./types";

export const nodes: Record<
  string,
  { position: Vector; functions: Record<string, Connection[]> }
> = {};

export async function parseGraph() {
  const graph = await import("../graph.json");

  Object.entries(graph).forEach(([file, connections]) => {
    const [fileName, functionName] = file.split("#");
    const position = calculateFilePosition(connections);
    if (!nodes[fileName])
      nodes[fileName] = { position: position ?? { x: 0, y: 0 }, functions: {} };

    if (
      nodes[fileName].position &&
      position !== null &&
      position.x < nodes[fileName].position.x
    )
      nodes[fileName].position = position;
    nodes[fileName].functions[functionName] = connections;
  });
  console.log(nodes);
}

function calculateFilePosition(connections: Connection[]): Vector | null {
  for (let i = 0; i < connections.length; i++) {
    const connection = connections[i];
    if (nodes[connection.filePath]) {
      return {
        x: nodes[connection.filePath].position.x - 200,
        y: nodes[connection.filePath].position.y,
      };
    }
  }

  return null;
}
