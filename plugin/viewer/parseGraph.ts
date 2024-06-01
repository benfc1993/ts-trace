import type { Connection, FileNodes } from "../types";
import { Vector } from "./types";
import { getNodeById } from "./getNodes";
import { NODE_SPACING, NODE_WIDTH } from "./drawFile";

export type GraphNode = {
  position: Vector;
  functions: Record<string, { connections: Connection[]; exported: boolean }>;
};

export type GraphNodes = Record<string, GraphNode>;

export const nodes: GraphNodes = {};
const positions: Record<number, number> = {};

export async function parseGraph() {
  const graph = await fetch("graph.json").then((res) => res.json());
  const entries = Object.entries(graph as FileNodes);

  for (const [functionId, functionData] of entries) {
    const [filePath, functionName] = functionId.split("#");
    if (getNodeById(functionId)) {
      const node = getNodeById(functionId);
      node.functions[functionName] = {
        exported: functionData.exported,
        connections: functionData.in,
      };
      continue;
    }

    const newNode: GraphNode = {
      position: { x: 0, y: 0 },
      functions: {
        [functionName]: {
          exported: functionData.exported,
          connections: functionData.in,
        },
      },
    };

    nodes[filePath] = newNode;

    traverseConnections(graph, newNode, functionData.in);
  }

  Object.values(nodes).forEach((node) => {
    const currentY = positions[node.position.x] ?? 0;
    node.position.y =
      currentY + Object.keys(node.functions).length * 25 + NODE_SPACING;
    positions[node.position.x] = node.position.y;
  });
  return nodes;
}

function traverseConnections(
  graph: FileNodes,
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
        functions: {
          [functionName]: {
            exported: fileNode.exported,
            connections: fileNode.in,
          },
        },
      };

    positionDownstreamNode(graphNode, connection.connectionId);
    traverseConnections(graph, getNodeById(connectionId), fileNode.in);
  }
}

function positionDownstreamNode(
  upstreamNode: GraphNode,
  downstreamConnectionId: string,
) {
  const xSpacing = NODE_WIDTH * 1.5;
  const downstreamNode = getNodeById(downstreamConnectionId);

  if (!downstreamNode) {
    const [filePath] = downstreamConnectionId.split("#");
    nodes[filePath] = {
      position: { x: upstreamNode.position.x + xSpacing, y: 0 },
      functions: {},
    };
    return;
  }

  if (upstreamNode.position.x + xSpacing < downstreamNode.position.x) return;

  downstreamNode.position.x = upstreamNode.position.x + xSpacing;
}
