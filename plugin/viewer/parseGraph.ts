import { readFileSync } from "fs";
import type { Connection, FileNodes } from "../types";
import { Vector } from "./types";
import { NODE_SPACING } from ".";
import { getNodeById } from "./getNodes";

type GraphNode = { position: Vector; functions: Record<string, Connection[]> };

export type GraphNodes = Record<string, GraphNode>;

export const nodes: GraphNodes = {};
const positions: Record<number, number> = {};

export async function parseGraph() {
  const graph = (await import("../graph.json")).default as unknown as FileNodes;

  const entries = Object.entries(graph);

  for (const [functionId, connections] of entries) {
    const [filePath, functionName] = functionId.split("#");
    if (getNodeById(functionId)) {
      const node = getNodeById(functionId);
      node.functions[functionName] = connections.in;
      continue;
    }

    const newNode: GraphNode = {
      position: { x: 0, y: 0 },
      functions: { [functionName]: connections.in },
    };

    nodes[filePath] = newNode;

    traverseConnections(newNode, connections.in);
  }

  Object.values(nodes).forEach((node) => {
    const currentY = positions[node.position.x] ?? 0;
    node.position.y =
      currentY + Object.keys(node.functions).length * 25 + NODE_SPACING;
    positions[node.position.x] = node.position.y;
  });
  return nodes;

  function traverseConnections(
    graphNode: GraphNode,
    connections: Connection[],
  ) {
    for (const connection of connections) {
      const { connectionId } = connection;
      const fileNode = graph[connectionId];
      const [filePath, functionName] = connectionId.split("#");

      if (!getNodeById(connectionId))
        nodes[filePath] = {
          position: { x: 0, y: 0 },
          functions: { [functionName]: fileNode.in },
        };

      positionDownstreamNode(graphNode, connection.connectionId);
      traverseConnections(getNodeById(connectionId), fileNode.in);
    }
  }
}

function positionDownstreamNode(
  upstreamNode: GraphNode,
  downstreamConnectionId: string,
) {
  const downstreamNode = getNodeById(downstreamConnectionId);

  if (!downstreamNode) {
    const [filePath] = downstreamConnectionId.split("#");
    nodes[filePath] = {
      position: { x: upstreamNode.position.x + NODE_SPACING, y: 0 },
      functions: {},
    };
    return;
  }

  if (upstreamNode.position.x + NODE_SPACING < downstreamNode.position.x)
    return;

  downstreamNode.position.x = upstreamNode.position.x + NODE_SPACING;
}
