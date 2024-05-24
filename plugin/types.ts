export type ExternalTrace = {
  functionName: string;
  externalName: string;
  filePath: string;
  lineNumber: number;
};

export type CallTrace = {
  exports: string[];
  functionCalls: { [functionName: string]: ExternalTrace[] };
};

export type CallTraces = {
  [sourceFile: string]: CallTrace;
};

export type CallData = {
  callName: string;
  lineNumber: string;
};

export type Config = {
  debug: boolean;
  includeNodeModules: boolean;
  includeInternalCalls: boolean;
};
