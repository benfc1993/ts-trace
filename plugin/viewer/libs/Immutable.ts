type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
    ? T
    : T extends object
      ? Immutable<T>
      : T
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

export type Immutable<TObj> = {
  readonly [K in keyof TObj]: DeepReadonly<TObj[K]>
}
