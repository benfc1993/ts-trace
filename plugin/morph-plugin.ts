import { writeFileSync } from "fs";
import type { CallExpression, SourceFile } from "ts-morph";

import { Project, SyntaxKind, Identifier } from "ts-morph";
import type { CallTraces, ExternalTrace } from "./types";
import { cwd } from "process";
import path from "path";
import { config } from ".";

export function createCallTraces() {
  const project = new Project();
  project.addSourceFilesFromTsConfig("./tsconfig.json");
  const sourceFiles = project.getSourceFiles();

  let calls: CallTraces = {};

  sourceFiles.forEach((sourceFile) => {
    const fileKey = projectRelativePath(sourceFile.getFilePath());
    calls[fileKey] = { exports: [], functionCalls: {} };

    calls[fileKey].exports = sourceFile
      .getExportSymbols()
      .map((symbol) => symbol.getName());

    const newCalls = getWrappedCallExpressions(sourceFile);
    calls[fileKey].functionCalls = newCalls;

    const topLevelCallIdentifiers = sourceFile
      ?.getChildrenOfKind(SyntaxKind.ExpressionStatement)
      .flatMap((desc) => desc?.getDescendantsOfKind(SyntaxKind.CallExpression));

    if (topLevelCallIdentifiers.length > 0)
      calls[fileKey].functionCalls["_root"] = callExpressionsToExternalTrace(
        topLevelCallIdentifiers,
        projectRelativePath(sourceFile.getFilePath()),
      );
  });

  writeFileSync(path.join(__dirname, "out.json"), JSON.stringify(calls));
}

function getWrappedCallExpressions(sourceFile: SourceFile) {
  const wrappedCallExpressions: Record<string, ExternalTrace[]> = {};

  sourceFile.getFunctions().forEach((functionDec) => {
    const funcName = functionDec.getName() ?? "";
    const calls = [
      ...(functionDec
        .getBody()
        ?.getDescendantsOfKind(SyntaxKind.ExpressionStatement) ?? []),
      ...(functionDec
        .getBody()
        ?.getDescendantsOfKind(SyntaxKind.ReturnStatement) ?? []),
    ].flatMap((desc) => desc?.getDescendantsOfKind(SyntaxKind.CallExpression));

    if (calls.length === 0) return;

    const callPaths = callExpressionsToExternalTrace(
      calls,
      projectRelativePath(sourceFile.getFilePath()),
    );

    if (callPaths) wrappedCallExpressions[funcName] = callPaths;
  });

  return wrappedCallExpressions;
}

function callExpressionsToExternalTrace(
  callExpressions: CallExpression[],
  sourceFileProjectPath: string,
) {
  const identifiers = callExpressions
    ?.flatMap((call) => {
      const expression = call.getExpression();
      if (expression instanceof Identifier) return expression;

      return expression.getLastChildByKind(SyntaxKind.Identifier);
    })
    .filter((e) => !!e) as Identifier[];

  return identifiers
    .map((exp) => {
      const exportedName =
        exp?.getDefinitions()[0]?.getName() ?? exp?.getText();

      const identifierName = exp?.getText();

      return {
        functionName: identifierName,
        externalName: exportedName,
        filePath: projectRelativePath(
          exp?.getDefinitions()[0]?.getSourceFile().getFilePath().toString() ??
            "node_internal",
        ),
        lineNumber: exp?.getStartLineNumber(),
      };
    })
    .filter((call) => {
      const isNodeModule =
        call.filePath.includes("node_modules") ||
        call.filePath.includes("node_internal");
      const isInternal = call.filePath.includes(sourceFileProjectPath);
      return (
        (config.includeNodeModules && isNodeModule) ||
        (config.includeInternalCalls && isInternal) ||
        (!isInternal && !isNodeModule)
      );
    });
}

function projectRelativePath(filePath: string) {
  return filePath.replace(cwd(), "");
}
