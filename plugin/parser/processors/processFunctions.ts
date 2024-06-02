import {
  ArrowFunction,
  FunctionDeclaration,
  SourceFile,
  SyntaxKind,
  Node,
  MethodDeclaration,
} from "ts-morph";
import { calls, pathPointer } from "../pathfinder";
import { addFunctionTraces } from "./traces/addFunctionTraces";

export function getDeclaredFunctions(sourceFile: SourceFile) {
  for (const functionDec of sourceFile.getFunctions()) {
    const functionName = functionDec.getName() ?? "";
    pathPointer.functionName = functionName;
    pathPointer.functionIsExported = functionDec.isExported();

    const functionBodyCalls = processFunctionBody(functionDec);

    if (functionBodyCalls) addFunctionTraces(functionBodyCalls);
  }
}

export function getDeclaredArrowFunctions(sourceFile: SourceFile) {
  for (const variableDec of sourceFile.getVariableDeclarations()) {
    const arrowFunctionBody = variableDec.getFirstChildByKind(
      SyntaxKind.ArrowFunction,
    );

    if (!arrowFunctionBody) continue;

    const functionName = variableDec.getName() ?? "";
    pathPointer.functionName = functionName;
    pathPointer.functionIsExported = variableDec.isExported();

    const functionBodyCalls = processFunctionBody(arrowFunctionBody);
    if (functionBodyCalls) addFunctionTraces(functionBodyCalls);
  }
}

export function getDeclaredObjectMethods(sourceFile: SourceFile) {
  sourceFile.getVariableDeclarations().forEach((objectDeclaration) =>
    objectDeclaration
      .getDescendantsOfKind(SyntaxKind.MethodDeclaration)
      .map((method) => {
        const objectName = objectDeclaration.getName();
        const methodName = method.getName();
        pathPointer.functionName = `${objectName}.${methodName}.o.`;
        pathPointer.functionIsExported = objectDeclaration.isExported();

        const functionBodyCalls = processFunctionBody(method);
        if (functionBodyCalls) addFunctionTraces(functionBodyCalls);
      }),
  );
}

export function getDeclaredClassMethods(sourceFile: SourceFile) {
  sourceFile
    .getChildrenOfKind(SyntaxKind.ClassDeclaration)
    .forEach((classDeclaration) =>
      classDeclaration
        .getDescendantsOfKind(SyntaxKind.MethodDeclaration)
        .map((method) => {
          const className = classDeclaration.getName();
          const methodName = method.getName();
          pathPointer.functionName = `${className}.${methodName}.c.`;
          pathPointer.functionIsExported = classDeclaration.isExported();

          const functionBodyCalls = processFunctionBody(method);
          if (functionBodyCalls) addFunctionTraces(functionBodyCalls);
        }),
    );
}

function processFunctionBody(
  func: ArrowFunction | FunctionDeclaration | MethodDeclaration,
) {
  const funcBody = func.getBody();
  if (!funcBody) return;

  createFunctionTrace();

  const functionCalls = getAllCallExpressionDecendants(funcBody);
  return functionCalls;
}

function getAllCallExpressionDecendants(body: Node) {
  const descendantTypes = [
    SyntaxKind.ExpressionStatement,
    SyntaxKind.VariableStatement,
    SyntaxKind.ReturnStatement,
  ];
  return descendantTypes
    .flatMap((descendantType) => body.getDescendantsOfKind(descendantType))
    .flatMap((desc) => desc?.getDescendantsOfKind(SyntaxKind.CallExpression));
}

export function createFunctionTrace() {
  if (!calls[pathPointer.filePath].traces[pathPointer.functionName])
    calls[pathPointer.filePath].traces[pathPointer.functionName] = {
      exported: false,
      externalTraces: [],
    };

  calls[pathPointer.filePath].traces[pathPointer.functionName].exported =
    pathPointer.functionIsExported;
}
