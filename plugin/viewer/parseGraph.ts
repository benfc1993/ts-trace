import { readFileSync } from "fs";
import type { Connection, FileNodes } from "../types";
import { Vector } from "./types";

export type GraphNodes = Record<
  string,
  { position: Vector; functions: Record<string, Connection[]> }
>;

export const nodes: GraphNodes = {};
const positions: Set<string> = new Set();

export async function parseGraph() {
  const graph = (await import("../graph.json")).default as unknown as FileNodes;
  console.log(graph);

  Object.entries(graph).forEach(([file, connections]) => {
    console.log(file);
    const [fileName, functionName] = file.split("#");
    const position = calculateFilePosition(connections.in);
    console.log(position);
    if (!nodes[fileName])
      nodes[fileName] = {
        position: position ?? { x: 0, y: 0 },
        functions: {},
      };

    if (
      nodes[fileName].position &&
      position !== null &&
      position.x < nodes[fileName].position.x
    )
      nodes[fileName].position = position;
    nodes[fileName].functions[functionName] = connections.in;
  });

  console.log(nodes);
  return nodes;
}

function calculateFilePosition(connections: Connection[]): Vector | null {
  for (let i = 0; i < connections.length; i++) {
    const connection = connections[i];
    if (nodes[connection.filePath]) {
      const proposedPosition = {
        x: nodes[connection.filePath].position.x - 200,
        y: 0,
      };

      return checkPosition(proposedPosition);
    }
  }

  return null;
}

function checkPosition(proposedPosition: Vector) {
  console.log("checking position", proposedPosition);
  console.log(positions);
  if (positions.has(`${proposedPosition.x},${proposedPosition.y}`)) {
    console.log("position exists");
    proposedPosition.y += 100;
    checkPosition(proposedPosition);
  }
  positions.add(`${proposedPosition.x},${proposedPosition.y}`);
  return proposedPosition;
}
