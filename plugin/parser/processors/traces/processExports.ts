import { SourceFile, SyntaxKind } from "ts-morph";

export function processExports(sourceFile: SourceFile) {
  const syntaxKinds = [
    SyntaxKind.FunctionDeclaration,
    SyntaxKind.VariableDeclaration,
    SyntaxKind.ArrowFunction,
    SyntaxKind.ClassDeclaration,
  ];

  const exports = Array.from(sourceFile.getExportedDeclarations().values())
    .flatMap((dec) => dec)
    .filter((declaration) => syntaxKinds.includes(declaration.getKind()))
    .flatMap((dec) => {
      if (dec.isKind(SyntaxKind.ClassDeclaration)) {
        return dec
          .getDescendantsOfKind(SyntaxKind.MethodDeclaration)
          .map((method) => `${dec.getName()}.${method.getName()}.c.`);
      }
      if (
        dec.isKind(SyntaxKind.VariableDeclaration) &&
        dec.getDescendantsOfKind(SyntaxKind.MethodDeclaration).length > 0
      ) {
        return dec
          .getDescendantsOfKind(SyntaxKind.MethodDeclaration)
          .map((method) => `${dec.getName()}.${method.getName()}.o.`);
      }
      return dec.getFirstChildByKind(SyntaxKind.Identifier)?.getText() ?? "";
    })
    .filter((n) => !!n);

  return exports;
}
