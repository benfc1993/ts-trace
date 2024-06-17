import b, { testing } from './another'
import { chatty } from './somethingElse'

export type DoNotFindMe = string | number

testing(5)
chatty(b('s'))
b('s')
