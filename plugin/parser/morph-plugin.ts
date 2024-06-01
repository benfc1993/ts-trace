import { writeFileSync } from "fs";
import type { CallExpression, SourceFile } from "ts-morph";

import { Project, SyntaxKind, Identifier } from "ts-morph";
import type { CallTraces } from "./types";
import { cwd } from "process";
import path from "path";
import { config } from ".";
import type { ExternalTrace } from "../types";
import { isVariableDeclaration } from "typescript";

export function createCallTraces() {
  const project = new Project({
    tsConfigFilePath: config.tsconfigPath,
  });
  const sourceFiles = project.getSourceFiles();

  let calls: CallTraces = {};

  sourceFiles.forEach((sourceFile) => {
    const fileKey = projectRelativePath(sourceFile.getFilePath());
    if (!calls[fileKey])
      calls[fileKey] = { exports: [], functionCalls: {}, upstream: {} };

    calls[fileKey].exports = sourceFile
      .getExportDeclarations()
      .filter(
        (s) =>
          s.getFirstChildByKind(SyntaxKind.FunctionDeclaration) ||
          s
            .getFirstChildByKind(SyntaxKind.VariableDeclaration)
            ?.getFirstChildByKind(SyntaxKind.ArrowFunction),
      )
      .map((symbol) => symbol.getSymbol()?.getName()) as string[];

    const newCalls = getWrappedCallExpressions(sourceFile);
    calls[fileKey].functionCalls = newCalls;

    addReverseLinks(newCalls, calls, fileKey);

    const topLevelCallIdentifiers = [
      ...sourceFile?.getChildrenOfKind(SyntaxKind.ExpressionStatement),
      ...((sourceFile
        ?.getChildrenOfKind(SyntaxKind.VariableDeclaration)
        ?.map((variable) =>
          variable.getFirstChildByKind(SyntaxKind.ArrowFunction),
        )
        .filter((arrowFunction) => arrowFunction) as any[] | undefined) ?? []),
    ].flatMap((desc) => desc?.getDescendantsOfKind(SyntaxKind.CallExpression));

    if (topLevelCallIdentifiers.length > 0)
      calls[fileKey].functionCalls["_root"] = {
        externalTraces: callExpressionsToExternalTrace(
          topLevelCallIdentifiers,
          projectRelativePath(sourceFile.getFilePath()),
        ),
        exported: false,
      };
  });

  writeFileSync(path.join(__dirname, "out.json"), JSON.stringify(calls));
}

function getWrappedCallExpressions(sourceFile: SourceFile) {
  const wrappedCallExpressions: Record<
    string,
    { externalTraces: ExternalTrace[]; exported: boolean }
  > = {};

  sourceFile.getVariableDeclarations().forEach((variable) => {
    const funcName = variable.getName();
    const isExported = variable.isExported();

    const arrowFunction = variable.getFirstDescendantByKind(
      SyntaxKind.ArrowFunction,
    );

    if (!arrowFunction) return;

    if (isExported)
      wrappedCallExpressions[funcName] = {
        externalTraces: [],
        exported: isExported,
      };

    const calls = [
      ...(arrowFunction
        .getFirstDescendantByKind(SyntaxKind.Block)
        ?.getDescendantsOfKind(SyntaxKind.ExpressionStatement) ?? []),
      ...(arrowFunction
        .getFirstDescendantByKind(SyntaxKind.Block)
        ?.getDescendantsOfKind(SyntaxKind.VariableStatement) ?? []),
      ...(arrowFunction
        .getFirstDescendantByKind(SyntaxKind.Block)
        ?.getDescendantsOfKind(SyntaxKind.ReturnStatement) ?? []),
    ].flatMap((desc) => desc?.getDescendantsOfKind(SyntaxKind.CallExpression));

    if (calls.length === 0) return;

    const externalTraces = callExpressionsToExternalTrace(
      calls,
      projectRelativePath(sourceFile.getFilePath()),
    );
    console.log(funcName, variable.isExported());

    wrappedCallExpressions[funcName] = {
      externalTraces: externalTraces ?? [],
      exported: isExported,
    };
  });

  sourceFile.getFunctions().forEach((functionDec) => {
    const funcName = functionDec.getName() ?? "";
    const isExported = functionDec.isExported();

    if (isExported)
      wrappedCallExpressions[funcName] = {
        externalTraces: [],
        exported: isExported,
      };

    const calls = [
      ...(functionDec
        .getBody()
        ?.getDescendantsOfKind(SyntaxKind.ExpressionStatement) ?? []),
      ...(functionDec
        .getBody()
        ?.getDescendantsOfKind(SyntaxKind.VariableStatement) ?? []),
      ...(functionDec
        .getBody()
        ?.getDescendantsOfKind(SyntaxKind.ReturnStatement) ?? []),
    ].flatMap((desc) => desc?.getDescendantsOfKind(SyntaxKind.CallExpression));

    if (calls.length === 0) return;

    const externalTraces = callExpressionsToExternalTrace(
      calls,
      projectRelativePath(sourceFile.getFilePath()),
    );

    wrappedCallExpressions[funcName] = {
      externalTraces: externalTraces ?? [],
      exported: functionDec.isExported(),
    };
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
      const isTypescriptInternal = call.filePath.includes(
        "node_modules/typescript",
      );
      if (isTypescriptInternal) return false;

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
function addReverseLinks(
  newCalls: Record<
    string,
    { externalTraces: ExternalTrace[]; exported: boolean }
  >,
  calls: CallTraces,
  fileKey: string,
) {
  Object.entries(newCalls).forEach(([functionName, externalCalls]) => {
    externalCalls.externalTraces.forEach((call) => {
      if (call.filePath.includes("node_modules/typescript")) return;
      if (!calls[call.filePath])
        calls[call.filePath] = {
          exports: [],
          functionCalls: {},
          upstream: { [call.externalName]: [] },
        };
      if (!calls[call.filePath].upstream[call.externalName]) {
        calls[call.filePath].upstream[call.externalName] = [];
      }

      calls[call.filePath].upstream[call.externalName].push(
        `${fileKey}#${functionName}`,
      );
    });
  });
}
