// Unit tests for functionality in `src/Prelude/Runtime/Prelude.ts`
import { describe, it } from "node:test";
import * as assert from "node:assert/strict";

import * as PMap from "../Prelude/Runtime/Map.js";
import * as PSet from "../Prelude/Runtime/Set.js";
import * as Prelude from "../Prelude/Prelude.js";
import { Scientific } from "../Prelude/Prelude.js";
import type {
  Bool,
  Char,
  Eq,
  Integer,
  Json,
  Value,
} from "../Prelude/Prelude.js";

/**
 * `eqInstanceIt` wraps `it` for verifying that the Eq instance is as expected
 */
function eqInstanceIt<A>(dict: Eq<A>, l: A, r: A, expected: Bool) {
  it(`${l} and ${r}`, () => {
    assert.deepStrictEqual(dict.eq(l, r), expected);
    assert.deepStrictEqual(dict.neq(l, r), !expected);
  });
}

/**
 * `jsonInstanceIt` wraps `it` for verifying that the Json instance is as
 * expected
 */
function jsonInstanceIt<A>(dict: Json<A>, arg: A, value: Value) {
  it(`${arg}`, () => {
    assert.deepStrictEqual(dict.toJson(arg), value);
    assert.deepStrictEqual(dict.fromJson(value), arg);
  });
}

describe("Bool instance tests", () => {
  describe("Eq Bool", () => {
    eqInstanceIt(Prelude.eqBool, true, true, true);
    eqInstanceIt(Prelude.eqBool, false, true, false);
    eqInstanceIt(Prelude.eqBool, true, false, false);
    eqInstanceIt(Prelude.eqBool, false, false, true);
  });

  describe("Json Bool", () => {
    jsonInstanceIt(Prelude.jsonBool, true, true);
    jsonInstanceIt(Prelude.jsonBool, false, false);
  });
});

describe("Integer instance tests", () => {
  describe("Eq Integer", () => {
    eqInstanceIt(Prelude.eqInteger, 0n, 0n, true);
    eqInstanceIt(Prelude.eqInteger, 10n, 10n, true);
    eqInstanceIt(Prelude.eqInteger, -10n, -10n, true);
    eqInstanceIt(Prelude.eqInteger, -10n, -13n, false);
    eqInstanceIt(Prelude.eqInteger, 3n, -13n, false);
  });

  describe("Json Integer", () => {
    jsonInstanceIt(Prelude.jsonInteger, 10n, Scientific.fromString("10"));
    jsonInstanceIt(Prelude.jsonInteger, 13n, Scientific.fromString("13"));
    jsonInstanceIt(
      Prelude.jsonInteger,
      -10n,
      Scientific.fromString("-10"),
    );
    jsonInstanceIt(
      Prelude.jsonInteger,
      -13n,
      Scientific.fromString("-13"),
    );
  });
});

describe("Bytes instance tests", () => {
  describe("Eq Bytes", () => {
    eqInstanceIt(
      Prelude.eqBytes,
      Prelude.bytesFromOctets("a"),
      Prelude.bytesFromOctets("a"),
      true,
    );
    eqInstanceIt(
      Prelude.eqBytes,
      Prelude.bytesFromOctets("b"),
      Prelude.bytesFromOctets("b"),
      true,
    );
    eqInstanceIt(
      Prelude.eqBytes,
      Prelude.bytesFromOctets("1234"),
      Prelude.bytesFromOctets("1234"),
      true,
    );
    eqInstanceIt(
      Prelude.eqBytes,
      Prelude.bytesFromOctets("ab"),
      Prelude.bytesFromOctets("ab"),
      true,
    );
    eqInstanceIt(
      Prelude.eqBytes,
      Prelude.bytesFromOctets("ab"),
      Prelude.bytesFromOctets("a"),
      false,
    );
    eqInstanceIt(
      Prelude.eqBytes,
      Prelude.bytesFromOctets("b"),
      Prelude.bytesFromOctets("a"),
      false,
    );
  });

  describe("Json Bytes", () => {
    jsonInstanceIt(
      Prelude.jsonBytes,
      Prelude.bytesFromOctets("ilikedogs"),
      "aWxpa2Vkb2dz",
    );
    jsonInstanceIt(
      Prelude.jsonBytes,
      Prelude.bytesFromOctets("Your midas touch on your chevy door"),
      "WW91ciBtaWRhcyB0b3VjaCBvbiB5b3VyIGNoZXZ5IGRvb3I=",
    );
  });
});

describe("Char instance tests", () => {
  describe("Eq Char", () => {
    eqInstanceIt(
      Prelude.eqChar,
      Prelude.charFromString("a"),
      Prelude.charFromString("a"),
      true,
    );
    eqInstanceIt(
      Prelude.eqChar,
      Prelude.charFromString("b"),
      Prelude.charFromString("b"),
      true,
    );
    eqInstanceIt(
      Prelude.eqChar,
      Prelude.charFromString("1"),
      Prelude.charFromString("1"),
      true,
    );
    eqInstanceIt(
      Prelude.eqChar,
      Prelude.charFromString("a"),
      Prelude.charFromString("b"),
      false,
    );
    eqInstanceIt(
      Prelude.eqChar,
      Prelude.charFromString("b"),
      Prelude.charFromString("a"),
      false,
    );
  });

  describe("Json Char", () => {
    jsonInstanceIt(Prelude.jsonChar, Prelude.charFromString("i"), "i");
    jsonInstanceIt(
      Prelude.jsonChar,
      Prelude.charFromString("𠮷"),
      "𠮷",
    );
  });
});

describe("Text instance tests", () => {
  describe("Eq Text", () => {
    eqInstanceIt(Prelude.eqText, "aa", "aa", true);
    eqInstanceIt(Prelude.eqText, "bb", "bb", true);
    eqInstanceIt(Prelude.eqText, "1", "1", true);
    eqInstanceIt(Prelude.eqText, "a", "b", false);
    eqInstanceIt(Prelude.eqText, "b", "a", false);
  });

  describe("Json Text", () => {
    jsonInstanceIt(Prelude.jsonText, "aabbbc", "aabbbc");
  });
});

describe("Maybe instance tests", () => {
  describe("Eq Maybe", () => {
    eqInstanceIt(
      Prelude.eqMaybe(Prelude.eqInteger),
      { name: "Just", fields: 212n },
      { name: "Just", fields: 212n },
      true,
    );
    eqInstanceIt(
      Prelude.eqMaybe(Prelude.eqInteger),
      { name: "Just", fields: -212n },
      { name: "Just", fields: -212n },
      true,
    );
    eqInstanceIt(
      Prelude.eqMaybe(Prelude.eqInteger),
      { name: "Nothing" },
      { name: "Nothing" },
      true,
    );
    eqInstanceIt(
      Prelude.eqMaybe(Prelude.eqInteger),
      { name: "Nothing" },
      { name: "Just", fields: 212n },
      false,
    );
    eqInstanceIt(
      Prelude.eqMaybe(Prelude.eqInteger),
      { name: "Just", fields: 212n },
      { name: "Nothing" },
      false,
    );
  });

  describe("Json Maybe", () => {
    jsonInstanceIt(Prelude.jsonMaybe(Prelude.jsonInteger), {
      name: "Nothing",
    }, {
      name: "Nothing",
      fields: [],
    });
    jsonInstanceIt(Prelude.jsonMaybe(Prelude.jsonInteger), {
      name: "Just",
      fields: 12n,
    }, {
      name: "Just",
      fields: [Scientific.fromString("12")],
    });
  });
});

describe("Either instance tests", () => {
  describe("Eq Either", () => {
    eqInstanceIt(
      Prelude.eqEither(Prelude.eqInteger, Prelude.eqText),
      { name: "Left", fields: 212n },
      { name: "Left", fields: 212n },
      true,
    );
    eqInstanceIt(
      Prelude.eqEither(Prelude.eqInteger, Prelude.eqText),
      { name: "Right", fields: "ever green" },
      { name: "Right", fields: "ever green" },
      true,
    );
    eqInstanceIt(
      Prelude.eqEither(Prelude.eqInteger, Prelude.eqText),
      { name: "Left", fields: 212n },
      { name: "Right", fields: "ever green" },
      false,
    );
    eqInstanceIt(
      Prelude.eqEither(Prelude.eqInteger, Prelude.eqText),
      { name: "Right", fields: "ever green" },
      { name: "Left", fields: 212n },
      false,
    );
    describe("Json Either", () => {
      jsonInstanceIt(
        Prelude.jsonEither(Prelude.jsonInteger, Prelude.jsonText),
        { name: "Right", fields: "ever green" },
        { name: "Right", fields: ["ever green"] },
      );
      jsonInstanceIt(
        Prelude.jsonEither(Prelude.jsonInteger, Prelude.jsonText),
        { name: "Left", fields: 212n },
        { name: "Left", fields: [Scientific.fromString("212")] },
      );
    });
  });
});

describe("List instance tests", () => {
  describe("Eq List", () => {
    eqInstanceIt(
      Prelude.eqList(Prelude.eqInteger),
      [1n],
      [1n],
      true,
    );
    eqInstanceIt(
      Prelude.eqList(Prelude.eqInteger),
      [1n, 2n],
      [1n, 2n],
      true,
    );
    eqInstanceIt(
      Prelude.eqList(Prelude.eqInteger),
      [],
      [],
      true,
    );
    eqInstanceIt(
      Prelude.eqList(Prelude.eqInteger),
      [1n],
      [],
      false,
    );
    eqInstanceIt(
      Prelude.eqList(Prelude.eqInteger),
      [1n, 2n],
      [2n, 1n],
      false,
    );
    eqInstanceIt(
      Prelude.eqList(Prelude.eqInteger),
      [],
      [1n],
      false,
    );
  });

  describe("Json List", () => {
    jsonInstanceIt(
      Prelude.jsonList(Prelude.jsonInteger),
      [1n, 2n, 3n],
      [
        Scientific.fromString("1"),
        Scientific.fromString("2"),
        Scientific.fromString("3"),
      ],
    );
    jsonInstanceIt(
      Prelude.jsonList(Prelude.jsonInteger),
      [],
      [],
    );
  });
});

describe("Pair instance tests", () => {
  describe("Eq Pair", () => {
    eqInstanceIt(
      Prelude.eqPair(Prelude.eqInteger, Prelude.eqInteger),
      [1n, 69n],
      [1n, 69n],
      true,
    );
    eqInstanceIt(
      Prelude.eqPair(Prelude.eqInteger, Prelude.eqInteger),
      [-69n, 2n],
      [-69n, 2n],
      true,
    );
    eqInstanceIt(
      Prelude.eqPair(Prelude.eqInteger, Prelude.eqChar),
      [-69n, Prelude.charFromString("a")],
      [-69n, Prelude.charFromString("a")],
      true,
    );

    eqInstanceIt(
      Prelude.eqPair(Prelude.eqInteger, Prelude.eqInteger),
      [1n, 69n],
      [0n, 69n],
      false,
    );
    eqInstanceIt(
      Prelude.eqPair(Prelude.eqInteger, Prelude.eqInteger),
      [-69n, 2n],
      [-69n, 3n],
      false,
    );
    eqInstanceIt(
      Prelude.eqPair(Prelude.eqInteger, Prelude.eqChar),
      [-69n, Prelude.charFromString("b")],
      [-69n, Prelude.charFromString("a")],
      false,
    );
    eqInstanceIt(
      Prelude.eqPair(Prelude.eqInteger, Prelude.eqChar),
      [-69n, Prelude.charFromString("b")],
      [-68n, Prelude.charFromString("b")],
      false,
    );
  });

  describe("Json Pair", () => {
    jsonInstanceIt(
      Prelude.jsonPair(Prelude.jsonInteger, Prelude.jsonInteger),
      [1n, 2n] as [Integer, Integer],
      [
        Scientific.fromString("1"),
        Scientific.fromString("2"),
      ],
    );
    jsonInstanceIt(
      Prelude.jsonPair(Prelude.jsonInteger, Prelude.jsonChar),
      [1n, Prelude.charFromString("a")] as [Integer, Char],
      [
        Scientific.fromString("1"),
        "a",
      ],
    );
  });
});

describe("Set instance tests", () => {
  describe("Eq Set", () => {
    {
      const set1: PSet.Set<Integer> = new PSet.Set();
      const set2: PSet.Set<Integer> = new PSet.Set();
      PSet.insert(Prelude.ordInteger, 0n, set1);
      PSet.insert(Prelude.ordInteger, 0n, set2);
      eqInstanceIt(
        Prelude.eqSet(Prelude.eqInteger),
        set1,
        set2,
        true,
      );
    }

    {
      const set1: PSet.Set<Integer> = new PSet.Set();
      const set2: PSet.Set<Integer> = new PSet.Set();
      PSet.insert(Prelude.ordInteger, 1n, set1);
      PSet.insert(Prelude.ordInteger, 1n, set2);
      PSet.insert(Prelude.ordInteger, 0n, set1);
      PSet.insert(Prelude.ordInteger, 0n, set2);
      eqInstanceIt(
        Prelude.eqSet(Prelude.eqInteger),
        set1,
        set2,
        true,
      );
    }
    {
      const set1: PSet.Set<Integer> = new PSet.Set();
      const set2: PSet.Set<Integer> = new PSet.Set();
      PSet.insert(Prelude.ordInteger, 1n, set1);
      PSet.insert(Prelude.ordInteger, 0n, set2);
      PSet.insert(Prelude.ordInteger, 0n, set1);
      PSet.insert(Prelude.ordInteger, 0n, set2);
      eqInstanceIt(
        Prelude.eqSet(Prelude.eqInteger),
        set1,
        set2,
        false,
      );
    }
  });

  describe("Json Set", () => {
    {
      const set1: PSet.Set<Integer> = new PSet.Set();
      PSet.insert(Prelude.ordInteger, 1n, set1);
      PSet.insert(Prelude.ordInteger, 2n, set1);

      jsonInstanceIt(
        Prelude.jsonSet(Prelude.ordInteger, Prelude.jsonInteger),
        set1,
        [
          Scientific.fromString("1"),
          Scientific.fromString("2"),
        ],
      );
    }

    {
      const set1: PSet.Set<Integer> = new PSet.Set();
      PSet.insert(Prelude.ordInteger, 1n, set1);
      PSet.insert(Prelude.ordInteger, 1n, set1);

      jsonInstanceIt(
        Prelude.jsonSet(Prelude.ordInteger, Prelude.jsonInteger),
        set1,
        [
          Scientific.fromString("1"),
        ],
      );
    }

    {
      const set1: PSet.Set<Integer> = new PSet.Set();
      PSet.insert(Prelude.ordInteger, 1n, set1);
      PSet.insert(Prelude.ordInteger, 1n, set1);

      const set2: PSet.Set<Integer> = new PSet.Set();
      PSet.insert(Prelude.ordInteger, 1n, set2);
      PSet.insert(Prelude.ordInteger, 1n, set2);

      const set3: PSet.Set<PSet.Set<Integer>> = new PSet.Set();
      PSet.insert(Prelude.ordSet(Prelude.ordInteger), set1, set3);
      PSet.insert(Prelude.ordSet(Prelude.ordInteger), set2, set3);

      jsonInstanceIt(
        Prelude.jsonSet(
          Prelude.ordSet(Prelude.ordInteger),
          Prelude.jsonSet(Prelude.ordInteger, Prelude.jsonInteger),
        ),
        set3,
        [
          [Scientific.fromString("1")],
        ],
      );
    }
  });
});

describe("Map instance tests", () => {
  describe("Eq Map", () => {
    {
      const map1: PMap.Map<Integer, Integer> = new PMap.Map();
      const map2: PMap.Map<Integer, Integer> = new PMap.Map();
      PMap.insert(Prelude.ordInteger, 0n, 0n, map1);
      PMap.insert(Prelude.ordInteger, 0n, 0n, map2);
      eqInstanceIt(
        Prelude.eqMap(Prelude.eqInteger, Prelude.eqInteger),
        map1,
        map2,
        true,
      );
    }

    {
      const map1: PMap.Map<Integer, Integer> = new PMap.Map();
      const map2: PMap.Map<Integer, Integer> = new PMap.Map();
      PMap.insert(Prelude.ordInteger, 1n, 1n, map1);
      PMap.insert(Prelude.ordInteger, 0n, 1n, map1);

      PMap.insert(Prelude.ordInteger, 1n, 1n, map2);
      PMap.insert(Prelude.ordInteger, 0n, 1n, map2);
      eqInstanceIt(
        Prelude.eqMap(Prelude.eqInteger, Prelude.eqInteger),
        map1,
        map2,
        true,
      );
    }
    {
      const map1: PMap.Map<Integer, Integer> = new PMap.Map();
      const map2: PMap.Map<Integer, Integer> = new PMap.Map();
      PMap.insert(Prelude.ordInteger, 1n, 0n, map1);
      PMap.insert(Prelude.ordInteger, 0n, 1n, map1);

      PMap.insert(Prelude.ordInteger, 0n, 0n, map2);
      PMap.insert(Prelude.ordInteger, 0n, 1n, map2);
      eqInstanceIt(
        Prelude.eqMap(Prelude.eqInteger, Prelude.eqInteger),
        map1,
        map2,
        false,
      );
    }

    {
      const map1: PMap.Map<Integer, Integer> = new PMap.Map();
      const map2: PMap.Map<Integer, Integer> = new PMap.Map();
      PMap.insert(Prelude.ordInteger, 0n, 0n, map1);
      PMap.insert(Prelude.ordInteger, 1n, 1n, map1);

      PMap.insert(Prelude.ordInteger, 0n, 0n, map2);
      PMap.insert(Prelude.ordInteger, 1n, 0n, map2);
      eqInstanceIt(
        Prelude.eqMap(Prelude.eqInteger, Prelude.eqInteger),
        map1,
        map2,
        false,
      );
    }
  });

  describe("Json Map", () => {
    {
      const map1: PMap.Map<Integer, Integer> = new PMap.Map();
      PMap.insert(Prelude.ordInteger, 1n, 2n, map1);
      PMap.insert(Prelude.ordInteger, 2n, 3n, map1);

      jsonInstanceIt(
        Prelude.jsonMap(
          Prelude.ordInteger,
          Prelude.jsonInteger,
          Prelude.jsonInteger,
        ),
        map1,
        [
          [Scientific.fromString("1"), Scientific.fromString("2")],
          [Scientific.fromString("2"), Scientific.fromString("3")],
        ],
      );
    }

    {
      const map1: PMap.Map<Integer, Integer> = new PMap.Map();
      PMap.insert(Prelude.ordInteger, 1n, 12n, map1);
      PMap.insert(Prelude.ordInteger, 1n, 69n, map1);

      jsonInstanceIt(
        Prelude.jsonMap(
          Prelude.ordInteger,
          Prelude.jsonInteger,
          Prelude.jsonInteger,
        ),
        map1,
        [
          [Scientific.fromString("1"), Scientific.fromString("69")],
        ],
      );
    }

    {
      const map1: PMap.Map<Integer, Integer> = new PMap.Map();
      PMap.insert(Prelude.ordInteger, 1n, 1n, map1);
      PMap.insert(Prelude.ordInteger, 1n, 1n, map1);

      const map2: PMap.Map<Integer, Integer> = new PMap.Map();
      PMap.insert(Prelude.ordInteger, 1n, 1n, map2);
      PMap.insert(Prelude.ordInteger, 1n, 1n, map2);

      const map3: PMap.Map<PMap.Map<Integer, Integer>, Integer> = new PMap
        .Map();
      PMap.insert(
        Prelude.ordMap(Prelude.ordInteger, Prelude.ordInteger),
        map1,
        0n,
        map3,
      );
      PMap.insert(
        Prelude.ordMap(Prelude.ordInteger, Prelude.ordInteger),
        map2,
        0n,
        map3,
      );

      jsonInstanceIt(
        Prelude.jsonMap(
          Prelude.ordMap(Prelude.ordInteger, Prelude.ordInteger),
          Prelude.jsonMap(
            Prelude.ordInteger,
            Prelude.jsonInteger,
            Prelude.jsonInteger,
          ),
          Prelude.jsonInteger,
        ),
        map3,
        [
          [
            [[Scientific.fromString("1"), Scientific.fromString("1")]],
            Scientific.fromString("0"),
          ],
        ],
      );
    }
  });
});
