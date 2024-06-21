import { testing } from './another'
import { Testing } from './inherit'

const test = () => {
  const a = new Testing()
  testing(a.myMethod())
  a.otherMethod()
}
