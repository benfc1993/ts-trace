import { ExternalTrace } from "../types";

export type CallTrace = {
  exports: string[];
  functionCalls: { [functionName: string]: ExternalTrace[] };
};

export type CallTraces = {
  [sourceFile: string]: CallTrace;
};

export type Config = {
  debug: boolean;
  includeNodeModules: boolean;
  includeInternalCalls: boolean;
};
