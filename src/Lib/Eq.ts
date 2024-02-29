/**
 * {@link Eq} is a typeclass for "deep" equality i.e., all substructures recursively are equal by
 * value.
 */
export interface Eq<A> {
  readonly eq: (l: Readonly<A>, r: Readonly<A>) => boolean;
  readonly neq: (l: Readonly<A>, r: Readonly<A>) => boolean;
}
