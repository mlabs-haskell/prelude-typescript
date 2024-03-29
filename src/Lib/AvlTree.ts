import type { Ord } from "./Ord.js";

/**
 * {@link Node} is an AVL tree i.e., a height balanced tree.
 *
 * Recall that an AVL tree satisfies the invariants:
 *
 * - the absolute value of the difference of height between `left` and `right` is
 *   at most `1`.
 */
export type Node<K> =
  | null
  | { element: K; height: number; left: Node<K>; right: Node<K> };

/**
 * {@link forEach} iterates through each element in the AVL tree from smallest
 * element to largest element.
 * This does not modify the tree.
 */
export function forEach<K>(node: Readonly<Node<K>>, f: (arg: K) => void): void {
  if (node === null) {
    return;
  } else {
    forEach(node.left, f);
    f(node.element);
    forEach(node.right, f);
    return;
  }
}

export function* iterator<K>(node: Node<K>): IterableIterator<K> {
  if (node === null) {
    return;
  } else {
    yield* iterator(node.left);
    yield node.element;
    yield* iterator(node.right);
    return;
  }
}

/**
 * Flattens the AVL tree into an array s.t. the smallest elements are first.
 */
export function toList<K>(node: Readonly<Node<K>>): K[] {
  const list: K[] = [];

  forEach(node, (arg) => {
    list.push(arg);
  });

  return list;
}

/**
 * @example
 * ```
 * alter(ordDict, f, k, node)
 * ```
 * finds the node with element `k`, say `k'` (setting `k'` to undefined if it
 * doesn't exist), runs `f(k')` where
 * - if `f(k')` is undefined, it removes `k'` from the AvlTree.
 * - otherwise `f(k')` is not undefined, so `f(k')` replaces the node element
 *   for the node in the tree.
 */
export function alter<K>(
  ordDict: Ord<K>,
  f: (arg: K | undefined) => K | undefined,
  k: K,
  node: Node<K>,
): Node<K> {
  function go(n: Node<K>): Node<K> {
    if (n === null) {
      const result = f(undefined);
      if (result === undefined) {
        return null;
      } else {
        return { element: result, height: 0, left: null, right: null };
      }
    } else {
      switch (ordDict.compare(k, n.element)) {
        case "LT":
          n.left = go(n.left);
          return balance(n);
        case "GT":
          n.right = go(n.right);
          return balance(n);
        case "EQ": {
          const result = f(n.element);
          if (result === undefined) {
            return remove(ordDict, k, n);
          } else {
            n.element = result;
            return n;
          }
        }
      }
    }
  }

  return go(node);
}

export function insert<K>(ordDict: Ord<K>, k: K, node: Node<K>): Node<K> {
  function go(n: Node<K>): Node<K> {
    if (n === null) {
      return { element: k, height: 0, left: null, right: null };
    } else {
      switch (ordDict.compare(k, n.element)) {
        case "LT":
          n.left = go(n.left);
          return balance(n);
        case "GT":
          n.right = go(n.right);
          return balance(n);
        case "EQ":
          n.element = k;
          return n;
      }
    }
  }

  return go(node);
}

export function findMin<K>(node: Node<K>): Node<K> {
  if (node === null) {
    return null;
  }
  while (node.left !== null) {
    node = node.left;
  }

  return node;
}

export function findMax<K>(node: Node<K>): Node<K> {
  if (node === null) {
    return null;
  }
  while (node.right !== null) {
    node = node.right;
  }

  return node;
}

export function remove<K>(ordDict: Ord<K>, key: K, node: Node<K>): Node<K> {
  function go(k: K, n: Node<K>): Node<K> {
    if (n === null) {
      return null;
    } else {
      switch (ordDict.compare(k, n.element)) {
        case "LT":
          n.left = go(k, n.left);
          return balance(n);
        case "GT":
          n.right = go(k, n.right);
          return balance(n);
        case "EQ":
          if (n.left !== null && n.right !== null) {
            const minNode: Node<K> = findMin(n.right)!;
            n.element = minNode.element;
            n.right = go(minNode.element, n.right);
            return balance(n);
          } else {
            return balance(n.left !== null ? n.left : n.right);
          }
      }
    }
  }

  return go(key, node);
}

/**
 * {@link nodeHeight} returns the path of the length of the longest path from
 * the tree rooted at `node` to any leaf.
 * The height of `null` is -1.
 */
export function nodeHeight<K>(node: Readonly<Node<K>>): number {
  if (node === null) {
    return -1;
  } else {
    return node.height;
  }
}

export function newHeight<K>(node: Readonly<Node<K>>): number {
  if (node === null) {
    return -1;
  } else {
    return Math.max(nodeHeight(node.left), nodeHeight(node.right)) + 1;
  }
}

/**
 * The cases consider the following scenario
 *  1. We started with an AVL tree
 *
 *  2. We inserted / or deleted something in the AVL tree so the sorting
 *  invariant is maintained, but the height invariant may have been violated by
 *  at most one.
 *
 *  It's straightforward to do the case analysis with this in mind.
 * @internal
 */
export function balance<K>(node: Node<K>): Node<K> {
  if (node === null) {
    return node;
  } else {
    if (nodeHeight(node.left) - nodeHeight(node.right) > 1) {
      // Either we've inserted something in the left subtree, or deleted
      // something in the right subtree

      if (nodeHeight(node.left!.left) >= nodeHeight(node.left!.right)) {
        // single rotation
        const l = node.left!;
        node.left = l.right;
        node.height = newHeight(node);

        l.right = node;
        l.height = newHeight(l);

        return l;
      } else {
        // double rotation
        const l = node.left!;
        const lr = l.right!;

        l.right = lr.left;
        l.height = newHeight(l);

        node.left = lr.right;
        node.height = newHeight(node);

        lr.left = l;
        lr.right = node;
        lr.height = newHeight(lr);

        return lr;
      }
    } else if (nodeHeight(node.right) - nodeHeight(node.left) > 1) {
      // Duplicated symmetric cases
      if (nodeHeight(node.right!.right) >= nodeHeight(node.right!.left)) {
        const l = node.right!;
        node.right = l.left;
        node.height = newHeight(node);

        l.left = node;
        l.height = newHeight(l);

        return l;
      } else {
        const l = node.right!;
        const lr = l.left!;

        l.left = lr.right;
        l.height = newHeight(l);

        node.right = lr.left;
        node.height = newHeight(node);

        lr.right = l;
        lr.left = node;
        lr.height = newHeight(lr);

        return lr;
      }
    } else {
      // It's balanced after an insertion / deletion, but we still need
      // to update the height.
      node.height = newHeight(node);
    }
    return node;
  }
}

export function checkInvariants<K>(
  ordDict: Ord<K>,
  node: Readonly<Node<K>>,
): void {
  function go(node: Node<K>): [number, K | null] {
    if (node === null) {
      return [-1, null];
    } else {
      const [hl, vl] = go(node.left);
      const [hr, vr] = go(node.right);

      if (!(node.height === Math.max(hl, hr) + 1 && Math.abs(hl - hr) <= 1)) {
        throw new Error(`Height invariant violated ${JSON.stringify(node)}`);
      }

      const ret: [number, K | null] = [node.height, node.element];
      if (vl === null && vr === null) {
        return ret;
      }

      if (
        vl === null && vr !== null && ordDict.compare(node.element, vr) === "LT"
      ) {
        return ret;
      }

      if (
        vl !== null && vr === null && ordDict.compare(vl, node.element) === "LT"
      ) {
        return ret;
      }

      if (
        vl !== null && vr !== null &&
        ordDict.compare(vl, node.element) === "LT" &&
        ordDict.compare(node.element, vr) === "LT"
      ) {
        return ret;
      }

      throw new Error("Sorting invariant violated");
    }
  }

  go(node);
}

export function lookup<K>(
  ordDict: Ord<K>,
  k: Readonly<K>,
  node: Node<K>,
): undefined | K {
  while (node !== null) {
    switch (ordDict.compare(k, node.element)) {
      case "LT":
        node = node.left;
        break;
      case "GT":
        node = node.right;
        break;
      case "EQ":
        return node.element;
    }
  }

  return undefined;
}

export function lookupLT<K>(
  ordDict: Ord<K>,
  k: Readonly<K>,
  node: Node<K>,
): undefined | K {
  let ans: undefined | K = undefined;

  while (node !== null) {
    switch (ordDict.compare(k, node.element)) {
      case "EQ":
        node = findMax(node.left);
        if (node === null) {
          return ans;
        }
        ans = node.element;
        return ans;

      case "LT":
        node = node.left;
        break;
      case "GT":
        ans = node.element;
        node = node.right;
        break;
    }
  }

  return ans;
}

/**
 * {@link} splits the tree into a triple for which the resulting tuple has (in
 * order):
 *  - an AVL tree with all elements in `node` strictly smaller than `k`
 *  - `k` in the tree
 *  - an AVL tree with all elements in `node` strictly larger than `k`
 */
export function split<K>(
  ordDict: Ord<K>,
  k: Readonly<K>,
  node: Node<K>,
): [Node<K>, K | undefined, Node<K>] {
  function go(n: Node<K>): [Node<K>, K | undefined, Node<K>] {
    if (n === null) {
      return [null, undefined, null];
    } else {
      switch (ordDict.compare(k, n.element)) {
        case "EQ":
          return [n.left, n.element, n.right];

        case "LT": {
          const [ll, lk, lr] = go(n.left);
          return [ll, lk, join(ordDict, n.element, lr, n.right)];
        }
        case "GT": {
          const [rl, rk, rr] = go(n.right);
          return [join(ordDict, n.element, n.left, rl), rk, rr];
        }
      }
    }
  }

  return go(node);
}

/**
 * {@link join} concatenates the two trees `left` and `right`, and the single element
 * `k` into a new AVL tree with all the elements from `left`, `right`, and k`
 * assuming that
 * ```
 * l < k < r
 * ```
 * is satisfied for every `l` in `left` and `r` in `right`
 */
export function join<K>(
  ordDict: Ord<K>,
  k: Readonly<K>,
  left: Node<K>,
  right: Node<K>,
): Node<K> {
  const lh = nodeHeight(left);
  const rh = nodeHeight(right);

  if (lh === -1) {
    right = insert(ordDict, k, right);
    return right;
  }

  if (rh === -1) {
    left = insert(ordDict, k, left);
    return left;
  }

  if (lh === rh) {
    const node = { element: k, height: -1, left, right };
    node.height = newHeight(node);
    return node;
  }

  let small: Node<K> = undefined as unknown as Node<K>;
  let smallh = -1;
  let large: Node<K> = undefined as unknown as Node<K>;

  if (lh < rh) {
    small = left;
    smallh = lh;
    large = right;
  } else {
    small = right;
    smallh = rh;
    large = left;
  }

  function goL(n: Node<K>): Node<K> {
    if (n!.height <= smallh + 1) {
      const nl = n!.left;

      n!.left = { element: k, height: -1, left: small, right: nl };
      n!.left.height = newHeight(n!.left);

      return balance(n);
    } else {
      n!.left = goL(n!.left);
      return balance(n);
    }
  }

  function goR(n: Node<K>): Node<K> {
    if (n!.height <= smallh + 1) {
      const nr = n!.right;

      n!.right = { element: k, height: -1, left: nr, right: small };
      n!.right.height = newHeight(n!.right);

      return balance(n);
    } else {
      n!.right = goR(n!.right);
      return balance(n);
    }
  }

  if (lh < rh) {
    return goL(large);
  } else {
    return goR(large);
  }
}
