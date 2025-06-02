// eslint-disable-next-line @typescript-eslint/array-type
export type UnwrapArray<T> = T extends Array<infer A> | ReadonlyArray<infer A> ? A : never;
