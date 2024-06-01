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

  writeFileSync(".pathfinder/graph.json", JSON.stringify(nodes));
}

//TODO: if function is not exported and doesn't make external calls exclude it

function generateNodes(traces: CallTraces) {
  Object.entries(traces).map(([filePath, callTrace]) => {
    [...Object.keys(callTrace.functionCalls), ...callTrace.exports].forEach(
      (trace) =>
        (nodes[`${filePath}#${trace}`] = {
          exported: callTrace.functionCalls[trace]?.exported ?? false,
          in: [],
          out: [],
        }),
    );
  });
}

function generateEdges(traces: CallTraces) {
  Object.entries(traces).forEach(([sourceFilePath, callTrace]) => {
    Object.entries(callTrace.functionCalls).forEach(([functionName, calls]) => {
      calls.externalTraces.forEach((call) => {
        const externalPath = `${call.filePath}#${call.externalName}`;
        const externalCall = { connectionId: externalPath, ...call };
        if (!nodes[externalPath])
          nodes[externalPath] = {
            exported:
              traces[call.filePath]?.functionCalls[call.externalName]
                ?.exported ?? false,
            in: [],
            out: [],
          };
        nodes[`${sourceFilePath}#${functionName}`].in.push(externalCall);
      });
    });

    Object.entries(callTrace.upstream).forEach(([functionName, calls]) => {
      calls.forEach((call) => {
        const nodeKey = `${sourceFilePath}#${functionName}`;
        if (!nodes[nodeKey])
          nodes[nodeKey] = {
            exported:
              traces[sourceFilePath]?.functionCalls[functionName]?.exported ??
              false,
            in: [],
            out: [],
          };
        nodes[nodeKey].out.push(call);
      });
    });
  });
}
