import { Project, SourceFile, SyntaxKind } from "ts-morph";
import { calls, pathPointer, projectRelativePath } from "../pathfinder";
import {
  createFunctionTrace,
  getDeclaredArrowFunctions,
  getDeclaredClassMethods,
  getDeclaredFunctions,
  getDeclaredObjectMethods,
} from "./processFunctions";
import { addFunctionTraces } from "./traces/addFunctionTraces";
import { processExports } from "./traces/processExports";
import { addReverseLinks } from "./traces/reverseTraces";

export function processFiles(project: Project) {
  const sourceFiles = project.getSourceFiles();
  sourceFiles.forEach((sourceFile) => {
    pathPointer.filePath = projectRelativePath(sourceFile.getFilePath());

    const file = getOrAddFileTraces(pathPointer.filePath);
    file.exports = processExports(sourceFile);

    getFileRootFunctionCalls(sourceFile);
    getDeclaredFunctions(sourceFile);
    getDeclaredArrowFunctions(sourceFile);
    getDeclaredObjectMethods(sourceFile);
    getDeclaredClassMethods(sourceFile);
    addReverseLinks();
  });
}

function getFileRootFunctionCalls(sourceFile: SourceFile) {
  pathPointer.functionName = "_root";
  pathPointer.functionIsExported = false;

  createFunctionTrace();

  const topLevelCallIdentifiers = sourceFile
    ?.getChildrenOfKind(SyntaxKind.ExpressionStatement)
    .flatMap((desc) => desc?.getDescendantsOfKind(SyntaxKind.CallExpression));

  addFunctionTraces(topLevelCallIdentifiers);
}

export function getOrAddFileTraces(filePath: string) {
  if (calls[filePath]) return calls[filePath];
  calls[filePath] = {
    traces: {},
    exports: [],
    calledBy: {},
  };
  return calls[filePath];
}