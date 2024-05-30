import { readFileSync, writeFileSync } from "fs";
import type { CallTraces } from "./types";
import path from "path";
import type { FileNodes } from "../types";

const nodes: FileNodes = {};

export function createGraph() {
  const traces: CallTraces = JSON.parse(
    readFileSync(path.join(__dirname, "out.json"), "utf-8"),
  );
  generateNodes(traces);
  generateEdges(traces);

  writeFileSync(path.join(__dirname, "../graph.json"), JSON.stringify(nodes));
}

function generateNodes(traces: CallTraces) {
  Object.entries(traces).map(([filePath, callTrace]) => {
    [...Object.keys(callTrace.functionCalls), ...callTrace.exports].forEach(
      (trace) => (nodes[`${filePath}#${trace}`] = { in: [], out: [] }),
    );
  });
}

function generateEdges(traces: CallTraces) {
  Object.entries(traces).forEach(([sourceFilePath, callTrace]) => {
    Object.entries(callTrace.functionCalls).forEach(([functionName, calls]) => {
      calls.forEach((call) => {
        const externalPath = `${call.filePath}#${call.externalName}`;
        const externalCall = { connectionId: externalPath, ...call };
        if (!nodes[externalPath]) nodes[externalPath] = { in: [], out: [] };
        nodes[`${sourceFilePath}#${functionName}`].in.push(externalCall);
      });
    });

    Object.entries(callTrace.upstream).forEach(([functionName, calls]) => {
      calls.forEach((call) => {
        const nodeKey = `${sourceFilePath}#${functionName}`;
        if (!nodes[nodeKey]) nodes[nodeKey] = { in: [], out: [] };
        nodes[nodeKey].out.push(call);
      });
    });
  });
}
