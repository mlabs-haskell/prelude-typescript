import { describe } from "node:test";

import * as assert from "node:assert/strict";
import * as Prelude from "../Lib/index.js";
import { Map } from "../Lib/Map.js";
import * as PMap from "../Lib/Map.js";
import type { Eq, Ord } from "../Lib/index.js";

/**
 * Inserts the element in the map and checks
 *  1. the invariants are satisfied
 *  2. the element is now in the map
 */
export function insertAndCheck<K, V>(
  ordDict: Ord<K>,
  eqDict: Eq<V>,
  k: K,
  v: V,
  map: Map<K, V>,
) {
  PMap.insert(ordDict, k, v, map);
  PMap.checkInvariants(ordDict, map);

  const lkup = PMap.lookup(ordDict, k, map);

  if (!(lkup.name === "Just" && eqDict.eq(lkup.fields, v))) {
    throw new Error(
      `Insertion for [${k}, ${v}] failed for map ${JSON.stringify(map.tree)}`,
    );
  }
}

export function removeAndCheck<K, V>(ordDict: Ord<K>, k: K, map: Map<K, V>) {
  PMap.remove(ordDict, k, map);
  PMap.checkInvariants(ordDict, map);

  if (PMap.lookup(ordDict, k, map).name === "Just") {
    throw new Error(
      `Removal failed for ${k} for map ${JSON.stringify(map.tree)}`,
    );
  }
}

export function randomIntUpToButNotIncluding(max: number) {
  return Math.floor(Math.random() * max);
}

describe("Map tests", () => {
  describe("Ascending insertion invariant checks", () => {
    const map: Map<number, number> = new Map();

    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 1, 1, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 2, 2, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 3, 3, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 4, 4, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 5, 5, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 6, 6, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 7, 7, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 8, 8, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 9, 9, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 10, 10, map);

    for (let i = 0; i <= 10; ++i) {
      if (PMap.lookup(Prelude.ordPrimitive, i, map).name === "Nothing") {
        throw new Error(
          `${i} not found in the map: ${JSON.stringify(map.tree)}`,
        );
      }
    }

    for (let i = 11; i <= 20; ++i) {
      if (PMap.lookup(Prelude.ordPrimitive, i, map).name === "Just") {
        throw new Error(`${i} is in the map: ${JSON.stringify(map.tree)}`);
      }
    }
  });

  describe("Descending insertion invariant checks", () => {
    const map: Map<number, number> = new Map();

    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 10, 10, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 9, 9, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 8, 8, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 7, 7, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 6, 6, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 5, 5, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 4, 4, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 3, 3, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 2, 2, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 1, 1, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);

    for (let i = 0; i <= 10; ++i) {
      if (PMap.lookup(Prelude.ordPrimitive, i, map).name === "Nothing") {
        throw new Error(
          `${i} not found in the map: ${JSON.stringify(map.tree)}`,
        );
      }
    }

    for (let i = 11; i <= 20; ++i) {
      if (PMap.lookup(Prelude.ordPrimitive, i, map).name === "Just") {
        throw new Error(`${i} is in the map: ${JSON.stringify(map.tree)}`);
      }
    }
  });

  describe("Insert replaces elements", () => {
    const map: Map<number, number> = new Map();

    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 1, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 2, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 3, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 4, map);
  });

  describe("Assorted insertion invariant checks 1.", () => {
    const map: Map<number, number> = new Map();

    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 9, 9, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 7, 7, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 8, 8, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 10, 10, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 5, 5, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 1, 1, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 6, 6, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 3, 3, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 4, 4, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 2, 2, map);

    for (let i = 0; i <= 10; ++i) {
      if (PMap.lookup(Prelude.ordPrimitive, i, map).name === "Nothing") {
        throw new Error(
          `${i} not found in the map: ${JSON.stringify(map.tree)}`,
        );
      }
    }

    for (let i = 11; i <= 20; ++i) {
      if (PMap.lookup(Prelude.ordPrimitive, i, map).name === "Just") {
        throw new Error(`${i} is in the map: ${JSON.stringify(map.tree)}`);
      }
    }
  });

  describe("Assorted insertion invariant checks 2.", () => {
    const map: Map<number, number> = new Map();
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 2, 2, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 4, 4, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 3, 3, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 6, 6, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 1, 1, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 5, 5, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 10, 10, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 8, 8, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 7, 7, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 9, 9, map);

    for (let i = 0; i <= 10; ++i) {
      if (PMap.lookup(Prelude.ordPrimitive, i, map).name === "Nothing") {
        throw new Error(
          `${i} not found in the map: ${JSON.stringify(map.tree)}`,
        );
      }
    }

    for (let i = 11; i <= 20; ++i) {
      if (PMap.lookup(Prelude.ordPrimitive, i, map).name === "Just") {
        throw new Error(`${i} is in the map: ${JSON.stringify(map.tree)}`);
      }
    }
  });

  describe("Large random insertion invariant checks 1. ", () => {
    const map: Map<number, number> = new Map();
    const insertions: { [index: number]: number } = {};
    const NUM_INSERTIONS = 5000;

    for (let i = 0; i < NUM_INSERTIONS; ++i) {
      const k = randomIntUpToButNotIncluding(NUM_INSERTIONS);
      const v = randomIntUpToButNotIncluding(NUM_INSERTIONS);
      insertions[k] = v;

      insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, k, v, map);
    }

    for (const [key, value] of Object.entries(insertions)) {
      if (
        Prelude.eqMaybe(Prelude.eqPrimitive).neq(
          PMap.lookup(Prelude.ordPrimitive, key, map),
          { name: "Just", fields: value },
        )
      ) {
        throw new Error(
          `[${key}, ${value}] is either not in the map or the wrong value in the map: ${
            JSON.stringify(map.tree)
          }`,
        );
      }
    }
  });

  describe("Large random insertion invariant checks 2. ", () => {
    // Same test as above, but we insert a smaller set of keys
    const map: Map<number, number> = new Map();
    const insertions: { [index: number]: number } = {};
    const NUM_INSERTIONS = 5000;

    for (let i = 0; i < NUM_INSERTIONS; ++i) {
      const k = randomIntUpToButNotIncluding(NUM_INSERTIONS / 4);
      const v = randomIntUpToButNotIncluding(NUM_INSERTIONS / 4);
      insertions[k] = v;

      insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, k, v, map);
    }

    for (const [key, value] of Object.entries(insertions)) {
      if (
        Prelude.eqMaybe(Prelude.eqPrimitive).neq(
          PMap.lookup(Prelude.ordPrimitive, key, map),
          { name: "Just", fields: value },
        )
      ) {
        throw new Error(
          `[${key}, ${value}] is either not in the map or the wrong value in the map: ${
            JSON.stringify(map.tree)
          }`,
        );
      }
    }
  });

  describe("Small ascending insertion / deletion invariant checks 1.", () => {
    const map: Map<number, number> = new Map();

    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 1, 1, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 2, 2, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 3, 3, map);

    removeAndCheck(Prelude.ordPrimitive, 3, map);

    removeAndCheck(Prelude.ordPrimitive, 0, map);

    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);

    removeAndCheck(Prelude.ordPrimitive, 2, map);
  });

  describe("Small ascending insertion / deletion invariant checks 2.", () => {
    const map: Map<number, number> = new Map();

    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 3, 3, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 2, 2, map);
    removeAndCheck(Prelude.ordPrimitive, 3, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 1, 1, map);
    removeAndCheck(Prelude.ordPrimitive, 0, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);
    removeAndCheck(Prelude.ordPrimitive, 2, map);
  });

  describe("Small ascending insertion / deletion invariant checks 3.", () => {
    const map: Map<number, number> = new Map();

    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 3, 3, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 0, 0, map);
    insertAndCheck(Prelude.ordPrimitive, Prelude.eqPrimitive, 2, 2, map);
    removeAndCheck(Prelude.ordPrimitive, 69, map);
  });

  describe("Large random insertion/deletion invariant checks 1.", () => {
    const map: Map<number, number> = new Map();
    const insertions: { [index: number]: number } = {};
    const NUM_INSERTIONS_DELETIONS = 5000;

    for (let i = 0; i < NUM_INSERTIONS_DELETIONS; ++i) {
      if (Math.random() > 0.5) {
        const keys = Object.keys(insertions);
        if (keys.length === 0) {
          // just delete something random since nothing exists in the map

          const k = randomIntUpToButNotIncluding(NUM_INSERTIONS_DELETIONS);
          removeAndCheck(Prelude.ordPrimitive, k, map);
        } else {
          // delete something already existing in the map
          const randomkey: number = insertions[
            parseInt(keys[Math.floor(keys.length * Math.random())]!)
          ]!;
          delete insertions[randomkey];

          removeAndCheck(Prelude.ordPrimitive, randomkey, map);
        }
      } else {
        // insert
        const k = randomIntUpToButNotIncluding(NUM_INSERTIONS_DELETIONS);
        const v = randomIntUpToButNotIncluding(NUM_INSERTIONS_DELETIONS);
        insertions[k] = v;

        insertAndCheck(
          Prelude.ordPrimitive,
          Prelude.eqPrimitive,
          k,
          v,
          map,
        );
      }
    }

    for (const [key, value] of Object.entries(insertions)) {
      if (
        Prelude.eqMaybe(Prelude.eqPrimitive).neq(
          PMap.lookup(Prelude.ordPrimitive, key, map),
          { name: "Just", fields: value },
        )
      ) {
        throw new Error(
          `[${key}, ${value}] is either not in the map or the wrong value in the map: ${
            JSON.stringify(map.tree)
          }`,
        );
      }
    }
  });

  describe("Large random insertion/deletion invariant checks 2.", () => {
    // Same test as above, but we insert a smaller set of keys
    const map: Map<number, number> = new Map();
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

        removeAndCheck(Prelude.ordPrimitive, randomkey, map);
      } else {
        // insert
        const k = randomIntUpToButNotIncluding(NUM_INSERTIONS_DELETIONS / 4);
        const v = randomIntUpToButNotIncluding(NUM_INSERTIONS_DELETIONS / 4);
        insertions[k] = v;

        insertAndCheck(
          Prelude.ordPrimitive,
          Prelude.eqPrimitive,
          k,
          v,
          map,
        );
      }
    }

    for (const [key, value] of Object.entries(insertions)) {
      if (
        Prelude.eqMaybe(Prelude.eqPrimitive).neq(
          PMap.lookup(Prelude.ordPrimitive, key, map),
          { name: "Just", fields: value },
        )
      ) {
        throw new Error(
          `[${key}, ${value}] is either not in the map or the wrong value in the map: ${
            JSON.stringify(map.tree)
          }`,
        );
      }
    }
  });

  describe("toList ascending string tests", () => {
    const map: Map<string, string> = new Map();

    insertAndCheck(
      Prelude.ordPrimitive,
      Prelude.eqPrimitive,
      "b",
      "c",
      map,
    );
    insertAndCheck(
      Prelude.ordPrimitive,
      Prelude.eqPrimitive,
      "a",
      "b",
      map,
    );
    insertAndCheck(
      Prelude.ordPrimitive,
      Prelude.eqPrimitive,
      "d",
      "f",
      map,
    );

    const old = "";
    for (const [k, _v] of PMap.toList(map)) {
      if (!(old < k)) {
        throw new Error("toList not strictly increasing");
      }
    }
  });

  describe("toList is same as iterator", () => {
    const map: Map<string, string> = new Map();

    insertAndCheck(
      Prelude.ordPrimitive,
      Prelude.eqPrimitive,
      "b",
      "c",
      map,
    );
    insertAndCheck(
      Prelude.ordPrimitive,
      Prelude.eqPrimitive,
      "a",
      "b",
      map,
    );
    insertAndCheck(
      Prelude.ordPrimitive,
      Prelude.eqPrimitive,
      "d",
      "f",
      map,
    );
    assert.deepStrictEqual(
      Array.from(map[Symbol.iterator]()),
      PMap.toList(map),
    );
  });
});
