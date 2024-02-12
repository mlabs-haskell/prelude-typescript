import type { Ord } from "./Ord.js";
import * as PAvlTree from "./AvlTree.js";
import type { Node } from "./AvlTree.js";
import type { Maybe } from "./Maybe.js";

/**
 * A mapping from `K` to `V` where `K` must have a {@link Ord} instance.
 *
 * @example
 * ```ts
 * import * as Prelude from "prelude/Map.js"
 *
 * let map : Map<string, string> = new Map();
 * insert(Prelude.ordString,  "a", "b", map)
 * lookup(Prelude.ordString,  "a", map) // returns `"b"`
 * map.length // is 1
 *
 * insert(Prelude.ordString. "a", "c", map)
 * lookup(Prelude.ordString,  "a", map) // returns `"c"`
 * map.length // is 1
 *
 * remove(Prelude.ordString,  "a", map)
 * lookup(Prelude.ordString,  "a", map) // returns `undefined`
 * map.length // is 0
 * ```
 */
export class Map<K, V> {
  tree: Node<[K, V]>;
  length: number;

  constructor() {
    this.tree = null;
    this.length = 0;
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
        ++map.length;
        return [key, value];
      } else {
        return [key, value];
      }
    },
    [key, null as V],
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
        --map.length;
        return undefined;
      }
    },
    [key, null as V],
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
    null as V,
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
    null as V,
  ], map.tree);
  if (lkup === undefined) {
    return { name: "Nothing" };
  } else {
    return { name: "Just", fields: lkup[1] };
  }
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
