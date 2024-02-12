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
 * {@link RemoveCommand} a command for looking up a key
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
 * {@link LengthCommand} a command for getting the length
 */
class LengthCommand implements fc.Command<Model, Real> {
  constructor() {}

  check(_m: Readonly<Model>) {
    return true;
  }

  run(m: Model, r: Real) {
    PMap.checkInvariants(Prelude.ordText, r);
    assert.equal(r.length, m.size);
  }

  toString() {
    return `length`;
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
      fc.constant(new LengthCommand()),
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

  // We have some "small string" tests s.t. we can be almost certain that the
  it(`Small ASCII string tests`, () => {
    const allCommands = [
      fc.tuple(fc.hexaString(smallStringOptions), fc.hexaString()).map((
        [k, v],
      ) => new InsertCommand(k, v)),
      fc.hexaString(smallStringOptions).map((str) => new LookupCommand(str)),
      fc.hexaString(smallStringOptions).map((str) => new LookupLTCommand(str)),
      fc.hexaString(smallStringOptions).map((str) => new RemoveCommand(str)),
      fc.constant(new LengthCommand()),
    ];
    fc.assert(
      fc.property(
        fc.commands(allCommands, { maxCommands: 256, size: "max" }),
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
