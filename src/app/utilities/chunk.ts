/**
 * Creates a chunked array, based on the given size.
 */
export const chunk = <T, R extends number = number>(arr: T[], size: R): Tuple<T, R>[] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size) as Tuple<T, R>,
  )

type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>
