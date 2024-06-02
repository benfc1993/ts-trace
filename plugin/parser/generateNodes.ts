import { readFileSync, writeFileSync } from "fs";
import type { ApplicationTraces } from "./types";
import path from "path";
import type { FileNodes } from "../types";
import { createCallableName } from "./processors/traces/reverseTraces";

const nodes: FileNodes = {};

export function createGraph() {
  const traces: ApplicationTraces = JSON.parse(
    readFileSync(path.join(__dirname, "out.json"), "utf-8"),
  );
  generateNodes(traces);
  generateEdges(traces);

  writeFileSync(".pathfinder/graph.json", JSON.stringify(nodes));
}

//TODO: if function is not exported and doesn't make external calls exclude it
//TODO: Refactor to work with objects and classes

function generateNodes(traces: ApplicationTraces) {
  Object.entries(traces).map(([filePath, callTrace]) => {
    [...Object.keys(callTrace.traces), ...callTrace.exports].forEach(
      (trace) =>
        (nodes[`${filePath}#${trace}`] = {
          exported: callTrace.traces[trace]?.exported ?? false,
          in: [],
          out: [],
        }),
    );
  });
}

function generateEdges(applicationTraces: ApplicationTraces) {
  Object.entries(applicationTraces).forEach(([sourceFilePath, fileTrace]) => {
    Object.entries(fileTrace.traces).forEach(([functionName, callable]) => {
      callable.externalTraces.forEach((externalTrace) => {
        const callableName = createCallableName(externalTrace);
        const externalPath = `${externalTrace.filePath}#${callableName}`;
        const externalCall = { connectionId: externalPath, ...externalTrace };
        if (!nodes[externalPath])
          nodes[externalPath] = {
            exported:
              applicationTraces[externalTrace.filePath]?.traces[
                externalTrace.externalName
              ]?.exported ?? false,
            in: [],
            out: [],
          };
        nodes[`${sourceFilePath}#${functionName}`].out.push(externalCall);
      });
    });

    Object.entries(fileTrace.calledBy).forEach(([functionName, calls]) => {
      calls.forEach((call) => {
        const nodeKey = `${sourceFilePath}#${functionName}`;
        if (!nodes[nodeKey])
          nodes[nodeKey] = {
            exported:
              applicationTraces[sourceFilePath]?.traces[functionName]
                ?.exported ?? false,
            in: [],
            out: [],
          };
        nodes[nodeKey].in.push(call);
      });
    });
  });
}
