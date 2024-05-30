import { rmSync } from "fs";
import { createGraph } from "./generateNodes";
import { createCallTraces } from "./morph-plugin";
import path from "path";
import { argv } from "process";
import { Config } from "./types";

export const config: Config = {
  debug: process.argv.indexOf("--debug") > 0,
  includeNodeModules: argv.indexOf("--include-node-modules") > 0,
  includeInternalCalls: argv.indexOf("--include-internal") > 0,
};

createCallTraces();
createGraph();
if (!config.debug) rmSync(path.join(__dirname, "out.json"));
