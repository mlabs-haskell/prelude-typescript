// This module provides model property based testing for maps i.e., we have an
// "idealized" _model_ of a map, and verify that an operation on our _real_ map
// "commutes" with the same operation on the model of our idealized map.
//
// In particular, the idealized model of our real map will be JS' actual
// builtin Map for strings (since JS' builtin map's notion of equality for keys
// coincides with ours for the string type).
//
// Most of the code here follows from the documentation in [1].
//
// References:
//  [1]: https://fast-check.dev/docs/advanced/model-based-testing/
import { describe, it } from "node:test";

import * as assert from "node:assert/strict";
import * as Prelude from "../Prelude/Prelude.js";
import * as PMap from "../Prelude/Runtime/Map.js";
import * as fc from "fast-check";

type Model = Map<Prelude.Text, Prelude.Text>;
type Real = PMap.Map<Prelude.Text, Prelude.Text>;

/**
 * {@link InsertCommand} a command for inserting a key value pair
 */
class InsertCommand implements fc.Command<Model, Real> {
  #k: Prelude.Text;
  #v: Prelude.Text;

  constructor(k: Readonly<Prelude.Text>, v: Readonly<Prelude.Text>) {
    this.#k = k;
    this.#v = v;
  }

  check(_m: Readonly<Model>) {
    return true;
  }

  run(m: Model, r: Real) {
    m.set(this.#k, this.#v);
    PMap.insert(Prelude.ordText, this.#k, this.#v, r);

    PMap.checkInvariants(Prelude.ordText, r);
  }

  toString() {
    return `insert(${JSON.stringify(this.#k)}, ${JSON.stringify(this.#v)})`;
  }
}

/**
 * {@link LookupCommand} a command for looking up a key
 */
class LookupCommand implements fc.Command<Model, Real> {
  #k: Prelude.Text;

  constructor(k: Readonly<Prelude.Text>) {
    this.#k = k;
  }

  check(_m: Readonly<Model>) {
    return true;
  }

  run(m: Model, r: Real) {
    const modelV = m.get(this.#k);
    const rV = PMap.lookup(Prelude.ordText, this.#k, r);

    PMap.checkInvariants(Prelude.ordText, r);

    if (modelV === undefined && rV.name === "Nothing") {
      return;
    } else if (
      (modelV !== undefined && rV.name === "Just") &&
      (modelV === rV.fields)
    ) {
      return;
    } else {
      assert.fail(
        `lookup(${this.#k}): failed. Model has \`${modelV}\` but implementation has \`${
          JSON.stringify(rV)
        }\``,
      );
    }
  }

  toString() {
    return `lookup(${JSON.stringify(this.#k)})`;
  }
}

/**
 * {@link LookupLTCommand} a command for looking up the largest key which is
 * strictly less than the provided key
 */
class LookupLTCommand implements fc.Command<Model, Real> {
  #k: Prelude.Text;

  constructor(k: Readonly<Prelude.Text>) {
    this.#k = k;
  }

  check(_m: Readonly<Model>) {
    return true;
  }

  run(m: Model, r: Real) {
    let answer: [Prelude.Text, Prelude.Text] | undefined = undefined;

    for (const [k, v] of m) {
      // we only care about elements strictly smaller
      if (Prelude.ordText.compare(k, this.#k) !== "LT") {
        continue;
      }

      if (answer === undefined) {
        answer = [k, v];
      } else if (Prelude.ordText.compare(answer[0], k) === "EQ") {
        assert.fail(`Map has not unique keys invariant violated`);
      } else if (Prelude.ordText.compare(answer[0], k) === "LT") {
        // `answer[0]` is strictly smaller than `k`, but recall `k` is
        // still smaller than this.#k, so `k` is the better solution
        answer = [k, v];
      }
    }

    const modelV = answer === undefined ? undefined : answer[1];

    const rV = PMap.lookupLT(Prelude.ordText, this.#k, r);

    PMap.checkInvariants(Prelude.ordText, r);

    if (modelV === undefined && rV.name === "Nothing") {
      return;
    } else if (
      (modelV !== undefined && rV.name === "Just") &&
      (modelV === rV.fields)
    ) {
      return;
    } else {
      assert.fail(
        `lookupLT(${this.#k}): failed. Model has \`${modelV}\` but implementation has \`${
          JSON.stringify(rV)
        }\``,
      );
    }
  }

  toString() {
    return `lookupLT(${JSON.stringify(this.#k)})`;
  }
}

/**
 * {@link RemoveCommand} a command for removing a key
 */
class RemoveCommand implements fc.Command<Model, Real> {
  #k: Prelude.Text;

  constructor(k: Readonly<Prelude.Text>) {
    this.#k = k;
  }

  check(_m: Readonly<Model>) {
    return true;
  }

  run(m: Model, r: Real) {
    m.delete(this.#k);

    PMap.remove(Prelude.ordText, this.#k, r);

    PMap.checkInvariants(Prelude.ordText, r);
  }

  toString() {
    return `remove(${JSON.stringify(this.#k)})`;
  }
}

/**
 * {@link SplitCommand} a command for splitting the tree
 */
class SplitCommand implements fc.Command<Model, Real> {
  #k: Prelude.Text;
  #stay: Prelude.Bool; // false ===> keep the smaller part, true ===> keep the larger part

  constructor(k: Readonly<Prelude.Text>, stay: Prelude.Bool) {
    this.#k = k;
    this.#stay = stay;
  }

  check(_m: Readonly<Model>) {
    return true;
  }

  run(m: Model, r: Real) {
    const [rl, found, rg] = PMap.split(Prelude.ordText, this.#k, r);

    PMap.checkInvariants(Prelude.ordText, rl);
    PMap.checkInvariants(Prelude.ordText, rg);

    if (
      !((found.name === "Nothing" && m.get(this.#k) === undefined) ||
        (found.name === "Just" && found.fields === m.get(this.#k)))
    ) {
      assert.fail(
        `Real has ${
          JSON.stringify(found)
        } as the found value during a split, but the model has ${
          m.get(this.#k)
        }`,
      );
    }

    const nm = new Map();

    if (this.#stay === false) {
      for (const [key, value] of m) {
        if (Prelude.ordText.compare(key, this.#k) === "LT") {
          nm.set(key, value);
        }
      }

      m.clear();

      for (const [key, value] of nm) {
        m.set(key, value);
      }

      r.tree = rl.tree;
    } else {
      for (const [key, value] of m) {
        if (Prelude.ordText.compare(key, this.#k) === "GT") {
          nm.set(key, value);
        }
      }

      m.clear();

      for (const [key, value] of nm) {
        m.set(key, value);
      }

      r.tree = rg.tree;
    }

    // Check if the maps satisfy the ordering invariant
    for (const [key, _value] of rl) {
      assert.ok(
        Prelude.ordText.compare(key, this.#k) === `LT`,
        `LT map in split should all be strictly less than ${this.#k}`,
      );
    }

    for (const [key, _value] of rg) {
      assert.ok(
        Prelude.ordText.compare(key, this.#k) === `GT`,
        `GT map in split should all be strictly greater than ${this.#k}`,
      );
    }
  }

  toString() {
    return `split(${JSON.stringify(this.#k)}, ${JSON.stringify(this.#stay)})`;
  }
}

describe(`Map<Prelude.Text,Prelude.Text> model tests`, () => {
  it(`General tests`, () => {
    const allCommands = [
      fc.tuple(fc.string(), fc.string()).map(([k, v]) =>
        new InsertCommand(k, v)
      ),
      fc.string().map((str) => new LookupCommand(str)),
      fc.string().map((str) => new LookupLTCommand(str)),
      fc.string().map((str) => new RemoveCommand(str)),
      fc.tuple(fc.string(), fc.boolean()).map(([str, stay]) =>
        new SplitCommand(str, stay)
      ),
    ];
    fc.assert(
      fc.property(fc.commands(allCommands, {}), (cmds) => {
        function s() {
          return { model: new Map(), real: new PMap.Map() };
        }
        fc.modelRun(s, cmds);
      }),
      {
        numRuns: 10_000,
      },
    );
  });

  const smallStringOptions = { minLength: 0, maxLength: 4 };

  // We have some "small string" tests s.t. we can be almost certain that we'll
  // have "hits" in insertions + deletions
  it(`Small ASCII string tests`, () => {
    const allCommands = [
      fc.tuple(fc.hexaString(smallStringOptions), fc.hexaString()).map((
        [k, v],
      ) => new InsertCommand(k, v)),
      fc.hexaString(smallStringOptions).map((str) => new LookupCommand(str)),
      fc.hexaString(smallStringOptions).map((str) => new LookupLTCommand(str)),
      fc.hexaString(smallStringOptions).map((str) => new RemoveCommand(str)),
      fc.tuple(fc.hexaString(smallStringOptions), fc.boolean()).map((
        [str, stay],
      ) => new SplitCommand(str, stay)),
    ];
    fc.assert(
      fc.property(
        fc.commands(allCommands, { maxCommands: 512, size: "max" }),
        (cmds) => {
          function s() {
            return { model: new Map(), real: new PMap.Map() };
          }
          fc.modelRun(s, cmds);
        },
      ),
      {
        numRuns: 10_000,
      },
    );
  });

  // We make it more likely to generate an insertion so nontrivial maps are
  // more likely
  it(`Small ASCII string tests biased with more insertions`, () => {
    const allCommands = [
      fc.tuple(fc.hexaString(smallStringOptions), fc.hexaString()).map((
        [k, v],
      ) => new InsertCommand(k, v)),
      fc.tuple(fc.hexaString(smallStringOptions), fc.hexaString()).map((
        [k, v],
      ) => new InsertCommand(k, v)),
      fc.tuple(fc.hexaString(smallStringOptions), fc.hexaString()).map((
        [k, v],
      ) => new InsertCommand(k, v)),
      fc.tuple(fc.hexaString(smallStringOptions), fc.hexaString()).map((
        [k, v],
      ) => new InsertCommand(k, v)),
      fc.tuple(fc.hexaString(smallStringOptions), fc.hexaString()).map((
        [k, v],
      ) => new InsertCommand(k, v)),
      fc.tuple(fc.hexaString(smallStringOptions), fc.hexaString()).map((
        [k, v],
      ) => new InsertCommand(k, v)),
      fc.tuple(fc.hexaString(smallStringOptions), fc.hexaString()).map((
        [k, v],
      ) => new InsertCommand(k, v)),
      fc.hexaString(smallStringOptions).map((str) => new LookupCommand(str)),
      fc.hexaString(smallStringOptions).map((str) => new LookupLTCommand(str)),
      fc.hexaString(smallStringOptions).map((str) => new RemoveCommand(str)),
      fc.tuple(fc.hexaString(smallStringOptions), fc.boolean()).map((
        [str, stay],
      ) => new SplitCommand(str, stay)),
    ];
    fc.assert(
      fc.property(
        fc.commands(allCommands, { maxCommands: 512, size: "max" }),
        (cmds) => {
          function s() {
            return { model: new Map(), real: new PMap.Map() };
          }
          fc.modelRun(s, cmds);
        },
      ),
      {
        numRuns: 10_000,
      },
    );
  });
});
