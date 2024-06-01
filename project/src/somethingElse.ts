import * as mod from "./another";

export const chatty = async (msg: string) => {
  await mod.testing(1);
  const result = mod.default(mod.testingNest(msg));
  console.log("1");
  return await mod.testing(1).then((num) => num);
};
