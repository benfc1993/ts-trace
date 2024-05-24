export function testing(a: number) {
  return a * 2;
}

export function testingNest(a: string) {
  testingNest2(a);

  return a.repeat(34);
}

export default function testingNest2(a: string) {
  return a;
}

module.exports = {
  a: testing,
};
