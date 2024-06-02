import {
  CallExpression,
  DefinitionInfo,
  Expression,
  Identifier,
  SyntaxKind,
} from "ts-morph";
import { calls, pathPointer, projectRelativePath } from "../../pathfinder";
import { config } from "../..";
import { ExternalTrace } from "../../../types";

export function addFunctionTraces(callExpressions: CallExpression[]) {
  const identifiers = callExpressions
    ?.flatMap((call) => {
      const expression = call.getExpression();
      if (expression instanceof Identifier) return expression;

      return expression.getLastChildByKind(SyntaxKind.Identifier);
    })
    .filter((e) => !!e) as Identifier[];

  identifiers.map((expression) => {
    const def = expression?.getDefinitions()[0];
    if (def.getKind() === "function") addFunctionTrace(expression, def);
    if (def.getKind() === "method") {
      if (isClass(def)) {
        addClassTrace(expression, def);
      } else {
        addObjectTrace(expression, def);
      }
    }
  });
}

function addFunctionTrace(expression: Expression, definition: DefinitionInfo) {
  const traceData = getTraceData(expression, definition);
  if (!traceData) return;

  calls[pathPointer.filePath].traces[
    pathPointer.functionName
  ].externalTraces.push({
    type: "function",
    ...traceData,
  });
}

function addClassTrace(expression: Expression, definition: DefinitionInfo) {
  const traceData = getTraceData(expression, definition);
  if (!traceData) return;

  const className = definition.getContainerName();

  calls[pathPointer.filePath].traces[
    pathPointer.functionName
  ].externalTraces.push({
    type: "class",
    className: className,
    ...traceData,
  });
}

function addObjectTrace(expression: Expression, definition: DefinitionInfo) {
  const traceData = getTraceData(expression, definition);
  if (!traceData) return;

  const className = definition.getContainerName();

  calls[pathPointer.filePath].traces[
    pathPointer.functionName
  ].externalTraces.push({
    type: "object",
    objectName: className,
    ...traceData,
  });
}

function getTraceData(
  expression: Expression,
  definition: DefinitionInfo,
): ExternalTrace | null {
  const filePath = projectRelativePath(
    definition.getSourceFile().getFilePath().toString() ?? "node_internal",
  );

  const isTypescriptInternal = filePath.includes("node_modules/typescript");

  const isNodeModule =
    filePath.includes("node_modules") || filePath.includes("node_internal");
  const isInternal = filePath.includes(pathPointer.filePath);
  if (
    (!isTypescriptInternal && config.includeNodeModules && isNodeModule) ||
    (config.includeInternalCalls && isInternal) ||
    (!isInternal && !isNodeModule)
  )
    return {
      externalName: definition.getName() ?? expression.getText(),
      internalName: expression.getText(),
      lineNumber: expression?.getStartLineNumber(),
      filePath,
    };

  return null;
}

function isClass(def: DefinitionInfo): boolean {
  return !!def
    .getDeclarationNode()
    ?.getParentIfKind(SyntaxKind.ClassDeclaration);
}
