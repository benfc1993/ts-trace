import path from "path";

export function testing(a: number) {
  return a * 2;
}

testingNest2("a");

export function testingNest(a: string) {
  testingNest2(a);

  return a.repeat(34);
}

export default function testingNest2(a: string) {
  return path.join(a);
}
