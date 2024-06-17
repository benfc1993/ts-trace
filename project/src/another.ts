import path from 'path'

export const testing = async (a: number) => {
  return a * 2
}

export const testingNest = (a: string) => {
  testingNest2(a)

  return a.repeat(34)
}

const testingNest2 = (a: string) => {
  return path.join(a)
}

testingNest2('a')

export default testingNest2
