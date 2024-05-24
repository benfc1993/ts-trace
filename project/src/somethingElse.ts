import { testingNest } from "./another";

export function chatty(msg: string) {
  console.log(testingNest(msg));
}
