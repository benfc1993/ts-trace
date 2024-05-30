import { ExternalTrace } from "../types";

export type CallTrace = {
  upstream: { [functionName: string]: string[] };
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
