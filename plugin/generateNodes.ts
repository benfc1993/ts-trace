import { readFileSync, writeFileSync } from "fs";
import { CallData, CallTraces } from "./types";
import path from "path";

type Nodes = Record<string, string[]>;

const nodes: Nodes = {};

export function createGraph() {
  const traces: CallTraces = JSON.parse(
    readFileSync(path.join(__dirname, "out.json"), "utf-8"),
  );
  generateNodes(traces);
  generateEdges(traces);

  // getGraphData
  const res = Object.entries(nodes).flatMap(([key, node]) =>
    node.map((connection) => ({
      from: key,
      id: getNodeID(connection),
      data: getCallData(connection),
    })),
  );

  writeFileSync(path.join(__dirname, "graph.json"), JSON.stringify(nodes));
  writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(res));
}

function generateNodes(traces: CallTraces) {
  Object.entries(traces).map(([filePath, callTrace]) => {
    [...Object.keys(callTrace.functionCalls), ...callTrace.exports].forEach(
      (trace) => (nodes[`${filePath}#${trace}`] = []),
    );
  });
}

function generateEdges(traces: CallTraces) {
  Object.entries(traces).forEach(([sourceFilePath, callTrace]) => {
    Object.entries(callTrace.functionCalls).forEach(([functionName, calls]) => {
      calls.forEach((call) => {
        const externalPath = `${call.filePath}#${call.externalName}`;
        const externalCall = `${externalPath}>callName:${call.functionName},lineNumber:${call.lineNumber}`;
        if (!nodes[externalPath]) nodes[externalPath] = [];
        nodes[`${sourceFilePath}#${functionName}`].push(externalCall);
      });
    });
  });
}

function getNodeID(connectionString: string) {
  return connectionString.split(">")[0];
}

function getCallData(connectionString: string): CallData {
  const data = connectionString.split(">")[1].split(",");
  return data.reduce((acc: Record<string, string>, kv: string) => {
    const [k, v] = kv.split(":");
    acc[k] = v;
    return acc;
  }, {}) as CallData;
}
