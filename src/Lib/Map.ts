/**
 * An implementation of maps from keys to values using the key's {@link Ord}
 * instance.
 *
 * @example
 * ```ts
 * import * as PMap from "prelude/Map.js"
 * import * as Prelude from "prelude"
 *
 * let pmap : Map<string, string> = new Map();
 * PMap.insert(Prelude.ordString, "a", "b", pmap)
 * PMap.lookup(Prelude.ordString, "a", pmap) // returns `Just "b"`
 *
 * PMap.insert(Prelude.ordString, "a", "c", pmap)
 * PMap.lookup(Prelude.ordString, "a", pmap) // returns `Just "c"`
 *
 * PMap.remove(Prelude.ordString, "a", pmap)
 * PMap.lookup(Prelude.ordString, "a", pmap) // returns `Nothing`
 * ```
 *
 * @module prelude/Map.js
 */

import type { Ord } from "./Ord.js";
import * as PAvlTree from "./AvlTree.js";
import type { Node } from "./AvlTree.js";
import type { Maybe } from "./Maybe.js";

/**
 * A mapping from `K` to `V` where `K` must have a {@link Ord} instance.
 */
export class Map<K, V> {
  tree: Node<[K, V]>;

  constructor() {
    this.tree = null;
  }

  *[Symbol.iterator](): IterableIterator<Readonly<[K, V]>> {
    yield* PAvlTree.iterator(this.tree);
  }
}

/**
 * {@link ordOnFst} compares pairs on the first projection.
 *
 * @privateRemarks
 * This isn't a total order, but it is useful to implement a `Map` from a `Set`
 */
function ordOnFst<K, V>(ordDict: Ord<K>): Ord<[K, V]> {
  return {
    eq: (l, r) => {
      return ordDict.eq(l[0], r[0]);
    },
    neq: (l, r) => {
      return ordDict.neq(l[0], r[0]);
    },
    compare: (l, r) => {
      return ordDict.compare(l[0], r[0]);
    },
  };
}

/**
 * {@link insert} adds a key value pair in the map. If the key already exists, the
 * value is replaced with the new value.
 *
 * Complexity: `O(log n)`
 */
export function insert<K, V>(
  ordDict: Ord<K>,
  key: K,
  value: V,
  map: Map<K, V>,
): void {
  map.tree = PAvlTree.alter(
    ordOnFst(ordDict),
    (arg) => {
      if (arg === undefined) {
        return [key, value];
      } else {
        return [key, value];
      }
    },
    [key, undefined as V],
    map.tree,
  );
}

/**
 * {@link remove} removes a key (and its corresponding value) in the map. If the key
 * does not exist, then this does nothing.
 *
 * Complexity: `O(log n)`
 */
export function remove<K, V>(ordDict: Ord<K>, key: K, map: Map<K, V>): void {
  map.tree = PAvlTree.alter(
    ordOnFst(ordDict),
    (arg) => {
      if (arg === undefined) {
        return undefined;
      } else {
        return undefined;
      }
    },
    [key, undefined as V],
    map.tree,
  );
}

/**
 * {@link lookup} looks up the value corresponding to the given key returning
 * `Just` the corresponding value or `Nothing` if it does not exist.
 *
 * Complexity: `O(log n)`
 */
export function lookup<K, V>(
  ordDict: Ord<K>,
  key: K,
  map: Readonly<Map<K, V>>,
): Maybe<V> {
  const lkup: undefined | [K, V] = PAvlTree.lookup(ordOnFst(ordDict), [
    key,
    undefined as V,
  ], map.tree);
  if (lkup === undefined) {
    return { name: "Nothing" };
  } else {
    return { name: "Just", fields: lkup[1] };
  }
}

/**
 * {@link lookupLT} looks up the largest value in the {@link Map} for which its
 * corresponding key is strictly smaller than the given key returning `Just` if
 * such a value exists or `Nothing` otherwise.
 *
 * Complexity: `O(log n)`
 */
export function lookupLT<K, V>(
  ordDict: Ord<K>,
  key: K,
  map: Readonly<Map<K, V>>,
): Maybe<V> {
  const lkup: undefined | [K, V] = PAvlTree.lookupLT(ordOnFst(ordDict), [
    key,
    undefined as V,
  ], map.tree);
  if (lkup === undefined) {
    return { name: "Nothing" };
  } else {
    return { name: "Just", fields: lkup[1] };
  }
}

/**
 * {@link split} splits the {@link Map} into the values whose associated key is
 * strictly smaller than the provided `key`, the provided `key`'s value, and
 * the values whose associated key are strictly larger than the provided `key`.
 *
 * Complexity: `O((log n)^2)`
 */
export function split<K, V>(
  ordDict: Ord<K>,
  key: K,
  map: Map<K, V>,
): [Map<K, V>, Maybe<V>, Map<K, V>] {
  const [lt, found, gt] = PAvlTree.split<[K, V]>(ordOnFst(ordDict), [
    key,
    undefined as V,
  ], map.tree);

  const ltMap = new Map<K, V>();
  ltMap.tree = lt;

  const gtMap = new Map<K, V>();
  gtMap.tree = gt;

  return [
    ltMap,
    found !== undefined
      ? { name: `Just`, fields: found[1] }
      : { name: `Nothing` },
    gtMap,
  ];
}

/**
 * Returns a list of key value pairs in ascending order
 *
 * Complexity: `O(n)`
 */
export function toList<K, V>(map: Readonly<Map<K, V>>): [K, V][] {
  return PAvlTree.toList(map.tree);
}

/**
 * Checks the invariants of the internal AVL tree.
 *
 * @throws {@link Error}
 * This exception is thrown if the invariants are violated
 *
 * @internal
 */
export function checkInvariants<K, V>(
  ordDict: Ord<K>,
  map: Readonly<Map<K, V>>,
): void {
  return PAvlTree.checkInvariants(ordOnFst(ordDict), map.tree);
}
