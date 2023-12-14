import type { Eq } from "./Eq.js";

/**
 * {@link Ordering} allows a single comparison to determine the precise
 * ordering of two objects -- either strictly less than (`"LT"`), strictly
 * greater than (`"GT"`), or equal (`"EQ"`).
 */
export type Ordering =
  | "LT"
  | "GT"
  | "EQ";

/**
 * {@link Ord} type class for comparing elements.
 */
export interface Ord<A> extends Eq<A> {
  readonly compare: (l: Readonly<A>, r: Readonly<A>) => Ordering;
}
