import { calls, pathPointer } from "../../pathfinder";
import type { Trace } from "../../types";
import { getOrAddFileTraces } from "../processFiles";

//TODO: adding duplicate and invalid results
export function addReverseLinks() {
  const files = Object.entries(calls);

  files.forEach(([filePath, fileTraces]) => {
    Object.entries(fileTraces.traces).forEach(([functionName, traces]) => {
      if (filePath.includes("node_modules/typescript")) return;
      addUpstreamTraces(
        traces.externalTraces,
        `${pathPointer.filePath}#${functionName}`,
      );
    });
  });
}
function addUpstreamTraces(traces: Trace[], callingConnectionId: string) {
  traces.forEach((externalTrace) => {
    const file = getOrAddFileTraces(externalTrace.filePath);
    const callableName = createCallableName(externalTrace);

    if (!file.calledBy[callableName]) file.calledBy[callableName] = [];

    file.calledBy[callableName].push(callingConnectionId);
  });
}

export function createCallableName(trace: Trace): string {
  switch (trace.type) {
    case "function":
      return trace.externalName;
    case "object":
      return `${trace.objectName}.${trace.externalName}.o.`;
    case "class":
      return `${trace.className}.${trace.externalName}.c.`;
  }
}
