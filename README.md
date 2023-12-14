# prelude-typescript

A Prelude for TypeScript.

The primary motivation for this is to provide a Haskell-like runtime system for
[LambdaBuffers](https://github.com/mlabs-haskell/lambda-buffers), but this may
find interest elsewhere. It implements type classes via dictionary passing where
the programmer must manually pass the desired instance to functions requiring
such a type class.

The following functionality has been implemented.

- `Eq`, `Ord`, and `JSON` instances for various types.

- `Map` and `Set` containers where keys are ordered by a given `Ord` instance

- `JSON` serializers and deserializers which can parse large numbers.

## Documentation

- [API reference](https://mlabs-haskell.github.io/prelude-typescript/index.html)
