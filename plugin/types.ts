export type ExternalTrace = {
  functionName: string;
  externalName: string;
  filePath: string;
  lineNumber: number;
};

export type Connection = ExternalTrace & {
  connectionId: string;
};

export type FileNodes = Record<
  string,
  { exported: boolean; out: string[]; in: Connection[] }
>;
