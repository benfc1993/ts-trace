import { FunctionDeclaration, Project, SourceFile, SyntaxKind } from "ts-morph";
const project = new Project();
project.addSourceFilesFromTsConfig("./tsconfig.json");
const sourceFiles = project.getSourceFiles();

const mapping: Record<string, Record<string, string[]>> = {};
let calls = {};

type ImportInfo = {
  name: string;
  filePath: string;
  sourceFile: string;
};

sourceFiles.forEach((sourceFile) => {
  const newCalls = getWrappedCallExpressions(sourceFile);
  if (newCalls) calls = { ...calls, ...newCalls };

  const importDeclarations = sourceFile.getImportDeclarations();
  importDeclarations.forEach((importDeclaration) => {
    const importInfo = {
      name: "",
      filePath:
        importDeclaration.getModuleSpecifierSourceFile()?.getFilePath() ?? "",
      sourceFile: sourceFile.getFilePath(),
    };
    if (importDeclaration.getDefaultImport()) {
      const definition = importDeclaration.getDefaultImport()?.getDefinitions();
      if (definition) {
        importInfo.name = definition[0]?.getName();
        addMapping(importInfo);
      }
    }
    importDeclaration.getNamedImports().forEach((namedImport) => {
      importInfo.name = namedImport.getName();
      addMapping(importInfo);
    });
  });
});

console.log(mapping);
console.log(calls);

function addMapping(info: ImportInfo) {
  if (!mapping[info.filePath]) mapping[info.filePath] = {};
  if (!mapping[info.filePath][info.name])
    mapping[info.filePath][info.name] = [];
  mapping[info.filePath][info.name].push(info.sourceFile);
}

function getWrappedCallExpressions(sourceFile: SourceFile) {
  const wrappedCallExpressions: Record<string, string[]> = {};

  sourceFile.getFunctions().forEach((functionDec) => {
    const funcName = functionDec.getName() ?? "";
    const calls = functionDec
      .getBody()
      ?.getChildrenOfKind(SyntaxKind.ExpressionStatement)[0]
      ?.getChildrenOfKind(SyntaxKind.CallExpression)
      .map((exp) => exp.getChildrenOfKind(SyntaxKind.Identifier)[0]?.getText())
      .filter((e) => !!e);
    if (!funcName || !calls || calls.length < 1) return;
    wrappedCallExpressions[funcName] = calls;
  });

  return wrappedCallExpressions;
}
