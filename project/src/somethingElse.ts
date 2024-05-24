import * as mod from "./another";

export function chatty(msg: string) {
  mod.testing(1);
  mod.default(mod.testingNest(msg));
  console.log("1");
  return mod.testing(1);
}
