import { cpSync, mkdirSync, rmSync } from "fs";
import { createGraph } from "./generateNodes";
import { createCallTraces } from "./morph-plugin";
import path from "path";
import { argv } from "process";
import { Config } from "./types";

export const config: Config = {
  debug: process.argv.indexOf("--debug") > 0,
  includeNodeModules: argv.indexOf("--include-node-modules") > 0,
  includeInternalCalls: argv.indexOf("--include-internal") > 0,
  tsconfigPath:
    argv.indexOf("-p") > 0 ? argv[argv.indexOf("-p") + 1] : "tsconfig.json",
};

rmSync(".pathfinder", { recursive: true, force: true });
mkdirSync(".pathfinder");

createCallTraces();
createGraph();
if (!config.debug) rmSync(path.join(__dirname, "out.json"));
cpSync(path.join(__dirname, "./viewer"), ".pathfinder", { recursive: true });

//TODO: awaits
//TODO: exclude types / interfaces
