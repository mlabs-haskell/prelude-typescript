// Mostly duplicated tests from `./Map-test.ts`
import { describe } from "node:test";
import * as assert from "node:assert/strict";

import * as Prelude from "../Prelude/Prelude.js";
import { Set } from "../Prelude/Runtime/Set.js";
import * as PSet from "../Prelude/Runtime/Set.js";
import type { Ord } from "../Prelude/Prelude.js";

/**
 * Inserts the element in the set and checks
 *  1. the invariants are satisfied
 *  2. the element is now in the set
 */
export function insertAndCheck<K>(
  ordDict: Ord<K>,
  k: K,
  set: Set<K>,
) {
  PSet.insert(ordDict, k, set);
  PSet.checkInvariants(ordDict, set);

  const lkup = PSet.member(ordDict, k, set);

  if (!lkup) {
    throw new Error(
      `Insertion for ${k} failed for set ${JSON.stringify(set.tree)}`,
    );
  }
}

export function removeAndCheck<K>(ordDict: Ord<K>, k: K, set: Set<K>) {
  PSet.remove(ordDict, k, set);
  PSet.checkInvariants(ordDict, set);

  if (PSet.member(ordDict, k, set)) {
    throw new Error(
      `Removal failed for ${k} for set ${JSON.stringify(set.tree)}`,
    );
  }
}

export function checkSetLength<K>(set: Set<K>, expectedLength: number) {
  if (set.length !== expectedLength) {
    throw new Error(
      `Expected set of length ${expectedLength} but got ${set.length} for set ${
        JSON.stringify(set.tree)
      }`,
    );
  }
}

export function randomIntUpToButNotIncluding(max: number) {
  return Math.floor(Math.random() * max);
}

describe("Set tests", () => {
  describe("Ascending insertion invariant checks", () => {
    const set: Set<number> = new Set();

    checkSetLength(set, 0);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 1);
    insertAndCheck(Prelude.ordPrimitive, 1, set);
    checkSetLength(set, 2);
    insertAndCheck(Prelude.ordPrimitive, 2, set);
    checkSetLength(set, 3);
    insertAndCheck(Prelude.ordPrimitive, 3, set);
    checkSetLength(set, 4);
    insertAndCheck(Prelude.ordPrimitive, 4, set);
    checkSetLength(set, 5);
    insertAndCheck(Prelude.ordPrimitive, 5, set);
    checkSetLength(set, 6);
    insertAndCheck(Prelude.ordPrimitive, 6, set);
    checkSetLength(set, 7);
    insertAndCheck(Prelude.ordPrimitive, 7, set);
    checkSetLength(set, 8);
    insertAndCheck(Prelude.ordPrimitive, 8, set);
    checkSetLength(set, 9);
    insertAndCheck(Prelude.ordPrimitive, 9, set);
    checkSetLength(set, 10);
    insertAndCheck(Prelude.ordPrimitive, 10, set);
    checkSetLength(set, 11);

    for (let i = 0; i <= 10; ++i) {
      if (!PSet.member(Prelude.ordPrimitive, i, set)) {
        throw new Error(
          `${i} not found in the set: ${JSON.stringify(set.tree)}`,
        );
      }
      // member shouldn't change the length
      checkSetLength(set, 11);
    }

    for (let i = 11; i <= 20; ++i) {
      if (PSet.member(Prelude.ordPrimitive, i, set)) {
        throw new Error(`${i} is in the set: ${JSON.stringify(set.tree)}`);
      }
    }
  });

  describe("Descending insertion invariant checks", () => {
    const set: Set<number> = new Set();

    checkSetLength(set, 0);
    insertAndCheck(Prelude.ordPrimitive, 10, set);
    checkSetLength(set, 1);
    insertAndCheck(Prelude.ordPrimitive, 9, set);
    checkSetLength(set, 2);
    insertAndCheck(Prelude.ordPrimitive, 8, set);
    checkSetLength(set, 3);
    insertAndCheck(Prelude.ordPrimitive, 7, set);
    checkSetLength(set, 4);
    insertAndCheck(Prelude.ordPrimitive, 6, set);
    checkSetLength(set, 5);
    insertAndCheck(Prelude.ordPrimitive, 5, set);
    checkSetLength(set, 6);
    insertAndCheck(Prelude.ordPrimitive, 4, set);
    checkSetLength(set, 7);
    insertAndCheck(Prelude.ordPrimitive, 3, set);
    checkSetLength(set, 8);
    insertAndCheck(Prelude.ordPrimitive, 2, set);
    checkSetLength(set, 9);
    insertAndCheck(Prelude.ordPrimitive, 1, set);
    checkSetLength(set, 10);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 11);

    for (let i = 0; i <= 10; ++i) {
      if (!PSet.member(Prelude.ordPrimitive, i, set)) {
        throw new Error(
          `${i} not found in the set: ${JSON.stringify(set.tree)}`,
        );
      }
      checkSetLength(set, 11);
    }

    for (let i = 11; i <= 20; ++i) {
      if (PSet.member(Prelude.ordPrimitive, i, set)) {
        throw new Error(`${i} is in the set: ${JSON.stringify(set.tree)}`);
      }
    }
  });

  describe("Inserting the same element doesn't change the size", () => {
    const set: Set<number> = new Set();

    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 1);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 1);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 1);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 1);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 1);
  });

  describe("Assorted insertion invariant checks 1.", () => {
    const set: Set<number> = new Set();

    checkSetLength(set, 0);
    insertAndCheck(Prelude.ordPrimitive, 9, set);
    checkSetLength(set, 1);
    insertAndCheck(Prelude.ordPrimitive, 7, set);
    checkSetLength(set, 2);
    insertAndCheck(Prelude.ordPrimitive, 8, set);
    checkSetLength(set, 3);
    insertAndCheck(Prelude.ordPrimitive, 10, set);
    checkSetLength(set, 4);
    insertAndCheck(Prelude.ordPrimitive, 5, set);
    checkSetLength(set, 5);
    insertAndCheck(Prelude.ordPrimitive, 1, set);
    checkSetLength(set, 6);
    insertAndCheck(Prelude.ordPrimitive, 6, set);
    checkSetLength(set, 7);
    insertAndCheck(Prelude.ordPrimitive, 3, set);
    checkSetLength(set, 8);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 9);
    insertAndCheck(Prelude.ordPrimitive, 4, set);
    checkSetLength(set, 10);
    insertAndCheck(Prelude.ordPrimitive, 2, set);
    checkSetLength(set, 11);

    for (let i = 0; i <= 10; ++i) {
      if (!PSet.member(Prelude.ordPrimitive, i, set)) {
        throw new Error(
          `${i} not found in the set: ${JSON.stringify(set.tree)}`,
        );
      }
      checkSetLength(set, 11);
    }

    for (let i = 11; i <= 20; ++i) {
      if (PSet.member(Prelude.ordPrimitive, i, set)) {
        throw new Error(`${i} is in the set: ${JSON.stringify(set.tree)}`);
      }
    }
  });

  describe("Assorted insertion invariant checks 2.", () => {
    const set: Set<number> = new Set();
    checkSetLength(set, 0);
    insertAndCheck(Prelude.ordPrimitive, 2, set);
    checkSetLength(set, 1);
    insertAndCheck(Prelude.ordPrimitive, 4, set);
    checkSetLength(set, 2);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 3);
    insertAndCheck(Prelude.ordPrimitive, 3, set);
    checkSetLength(set, 4);
    insertAndCheck(Prelude.ordPrimitive, 6, set);
    checkSetLength(set, 5);
    insertAndCheck(Prelude.ordPrimitive, 1, set);
    checkSetLength(set, 6);
    insertAndCheck(Prelude.ordPrimitive, 5, set);
    checkSetLength(set, 7);
    insertAndCheck(Prelude.ordPrimitive, 10, set);
    checkSetLength(set, 8);
    insertAndCheck(Prelude.ordPrimitive, 8, set);
    checkSetLength(set, 9);
    insertAndCheck(Prelude.ordPrimitive, 7, set);
    checkSetLength(set, 10);
    insertAndCheck(Prelude.ordPrimitive, 9, set);
    checkSetLength(set, 11);

    for (let i = 0; i <= 10; ++i) {
      if (!PSet.member(Prelude.ordPrimitive, i, set)) {
        throw new Error(
          `${i} not found in the set: ${JSON.stringify(set.tree)}`,
        );
      }
      checkSetLength(set, 11);
    }

    for (let i = 11; i <= 20; ++i) {
      if (PSet.member(Prelude.ordPrimitive, i, set)) {
        throw new Error(`${i} is in the set: ${JSON.stringify(set.tree)}`);
      }
    }
  });

  describe("Large random insertion invariant checks 1. ", () => {
    const set: Set<number> = new Set();
    const insertions: { [index: number]: number } = {};
    const NUM_INSERTIONS = 5000;

    for (let i = 0; i < NUM_INSERTIONS; ++i) {
      const k = randomIntUpToButNotIncluding(NUM_INSERTIONS);
      const v = randomIntUpToButNotIncluding(NUM_INSERTIONS);
      insertions[k] = v;

      insertAndCheck(Prelude.ordPrimitive, k, set);
    }

    for (const [key, _value] of Object.entries(insertions)) {
      if (!PSet.member(Prelude.ordPrimitive, Number.parseInt(key), set)) {
        throw new Error(
          `${key} is not in the set: ${JSON.stringify(set.tree)}`,
        );
      }
    }
  });

  describe("Large random insertion invariant checks 2. ", () => {
    // Same test as above, but we insert a smaller set of keys
    const set: Set<number> = new Set();
    const insertions: { [index: number]: number } = {};
    const NUM_INSERTIONS = 5000;

    for (let i = 0; i < NUM_INSERTIONS; ++i) {
      const k = randomIntUpToButNotIncluding(NUM_INSERTIONS / 4);
      const v = 0;
      insertions[k] = v;

      insertAndCheck(Prelude.ordPrimitive, k, set);
    }

    for (const [key, _value] of Object.entries(insertions)) {
      if (!PSet.member(Prelude.ordPrimitive, Number.parseInt(key), set)) {
        throw new Error(
          `${key} is not in the set: ${JSON.stringify(set.tree)}`,
        );
      }
    }
  });

  describe("Small ascending insertion / deletion invariant checks 1.", () => {
    const set: Set<number> = new Set();

    insertAndCheck(Prelude.ordPrimitive, 0, set);
    insertAndCheck(Prelude.ordPrimitive, 1, set);
    insertAndCheck(Prelude.ordPrimitive, 2, set);
    insertAndCheck(Prelude.ordPrimitive, 3, set);
    checkSetLength(set, 4);

    removeAndCheck(Prelude.ordPrimitive, 3, set);
    checkSetLength(set, 3);

    removeAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 2);

    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 3);

    removeAndCheck(Prelude.ordPrimitive, 2, set);
    checkSetLength(set, 2);
  });

  describe("Small ascending insertion / deletion invariant checks 2.", () => {
    const set: Set<number> = new Set();

    insertAndCheck(Prelude.ordPrimitive, 3, set);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    insertAndCheck(Prelude.ordPrimitive, 2, set);
    checkSetLength(set, 3);
    removeAndCheck(Prelude.ordPrimitive, 3, set);
    checkSetLength(set, 2);
    insertAndCheck(Prelude.ordPrimitive, 1, set);
    checkSetLength(set, 3);
    removeAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 2);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    checkSetLength(set, 3);
    removeAndCheck(Prelude.ordPrimitive, 2, set);
    checkSetLength(set, 2);
  });

  describe("Small ascending insertion / deletion invariant checks 3.", () => {
    const set: Set<number> = new Set();

    insertAndCheck(Prelude.ordPrimitive, 3, set);
    insertAndCheck(Prelude.ordPrimitive, 0, set);
    insertAndCheck(Prelude.ordPrimitive, 2, set);
    checkSetLength(set, 3);
    removeAndCheck(Prelude.ordPrimitive, 69, set);
    checkSetLength(set, 3);
  });

  describe("Large random insertion/deletion invariant checks 1.", () => {
    const set: Set<number> = new Set();
    const insertions: { [index: number]: number } = {};
    const NUM_INSERTIONS_DELETIONS = 5000;

    for (let i = 0; i < NUM_INSERTIONS_DELETIONS; ++i) {
      if (Math.random() > 0.5) {
        const keys = Object.keys(insertions);
        if (keys.length === 0) {
          continue;
        }

        const randomkey: number =
          insertions[parseInt(keys[Math.floor(keys.length * Math.random())]!)]!;
        delete insertions[randomkey];

        removeAndCheck(Prelude.ordPrimitive, randomkey, set);
      } else {
        // insert
        const k = randomIntUpToButNotIncluding(NUM_INSERTIONS_DELETIONS);
        const v = randomIntUpToButNotIncluding(NUM_INSERTIONS_DELETIONS);
        insertions[k] = v;

        insertAndCheck(
          Prelude.ordPrimitive,
          k,
          set,
        );
      }
      checkSetLength(set, Object.keys(insertions).length);
    }

    for (const [key, _value] of Object.entries(insertions)) {
      if (!PSet.member(Prelude.ordPrimitive, Number.parseInt(key), set)) {
        throw new Error(
          `${key} is not in the set: ${JSON.stringify(set.tree)}`,
        );
      }
    }

    checkSetLength(set, Object.keys(insertions).length);
  });

  describe("Large random insertion/deletion invariant checks 2.", () => {
    // Same test as above, but we insert a smaller set of keys
    const set: Set<number> = new Set();
    const insertions: { [index: number]: number } = {};
    const NUM_INSERTIONS_DELETIONS = 5000;

    for (let i = 0; i < NUM_INSERTIONS_DELETIONS; ++i) {
      if (Math.random() > 0.5) {
        const keys = Object.keys(insertions);
        if (keys.length === 0) {
          continue;
        }

        const randomkey: number =
          insertions[parseInt(keys[Math.floor(keys.length * Math.random())]!)]!;
        delete insertions[randomkey];

        removeAndCheck(Prelude.ordPrimitive, randomkey, set);
      } else {
        // insert
        const k = randomIntUpToButNotIncluding(NUM_INSERTIONS_DELETIONS / 4);
        insertions[k] = 0;

        insertAndCheck(
          Prelude.ordPrimitive,
          k,
          set,
        );
      }
      checkSetLength(set, Object.keys(insertions).length);
    }

    for (const [key, _value] of Object.entries(insertions)) {
      if (!PSet.member(Prelude.ordPrimitive, Number.parseInt(key), set)) {
        throw new Error(
          `${key} is not in the set: ${JSON.stringify(set.tree)}`,
        );
      }
    }

    checkSetLength(set, Object.keys(insertions).length);
  });

  describe("toList ascending string tests", () => {
    const set: Set<string> = new Set();

    insertAndCheck(Prelude.ordPrimitive, "b", set);
    insertAndCheck(Prelude.ordPrimitive, "a", set);
    insertAndCheck(Prelude.ordPrimitive, "d", set);

    const old = "";
    for (const k of PSet.toList(set)) {
      if (!(old < k)) {
        throw new Error("toList not strictly increasing");
      }
    }
  });

  describe("toList is same as iterator", () => {
    const set: Set<string> = new Set();

    insertAndCheck(Prelude.ordPrimitive, "b", set);
    insertAndCheck(Prelude.ordPrimitive, "a", set);
    insertAndCheck(Prelude.ordPrimitive, "d", set);
    insertAndCheck(Prelude.ordPrimitive, "e", set);
    insertAndCheck(Prelude.ordPrimitive, "a", set);
    insertAndCheck(Prelude.ordPrimitive, "aa", set);
    insertAndCheck(Prelude.ordPrimitive, "f", set);
    insertAndCheck(Prelude.ordPrimitive, "g", set);
    insertAndCheck(Prelude.ordPrimitive, "z", set);
    insertAndCheck(Prelude.ordPrimitive, "dd", set);
    insertAndCheck(Prelude.ordPrimitive, "ff", set);
    insertAndCheck(Prelude.ordPrimitive, "y", set);
    insertAndCheck(Prelude.ordPrimitive, "aa", set);
    insertAndCheck(Prelude.ordPrimitive, "d", set);

    assert.deepStrictEqual(set.length, 11);

    assert.deepStrictEqual(
      Array.from(set[Symbol.iterator]()),
      PSet.toList(set),
    );
  });
});
