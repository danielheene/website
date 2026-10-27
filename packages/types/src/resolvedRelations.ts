/**
 * The shape of a polymorphic relation as emitted by Payload: an object holding
 * the target collection slug and either the referenced id (`string`) or the
 * already-populated document.
 */
export type Relation = {
  relationTo: string
  value: unknown
}

// oxlint-disable-next-line typescript/no-explicit-any -- matching any callable signature
type AnyFunction = (...args: any[]) => any

/**
 * Recursively resolves every polymorphic relation in `T` so that each relation's
 * `value` is guaranteed to be the referenced document — the bare id (`string`)
 * is excluded. Non-relation objects and arrays are walked so nested relations at
 * any depth are resolved as well.
 */
export type ResolvedRelations<T> = T extends AnyFunction
  ? T
  : T extends Relation
    ? { [K in keyof T]: K extends 'value' ? ResolvedRelations<Exclude<T[K], string>> : T[K] }
    : T extends object
      ? { [K in keyof T]: ResolvedRelations<T[K]> }
      : T
