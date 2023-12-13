{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    pre-commit-hooks-nix.url = "github:cachix/pre-commit-hooks.nix";
    pre-commit-hooks-nix.inputs.nixpkgs.follows = "nixpkgs";
    hercules-ci-effects.url = "github:hercules-ci/hercules-ci-effects";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; }
      {
        systems = [ "x86_64-linux" "x86_64-darwin" ];
        imports = [
          inputs.pre-commit-hooks-nix.flakeModule
          inputs.hercules-ci-effects.flakeModule

          ./pre-commit.nix
        ];
        perSystem = { pkgs, config, ... }:
          {
            packages = {
              default =
                let
                  packageJson = builtins.fromJSON (builtins.readFile ./package.json);
                in
                pkgs.buildNpmPackage {
                  # See: https://github.com/NixOS/nixpkgs/tree/master/pkgs/build-support/node/build-npm-package
                  # for helpful documentation
                  pname = packageJson.name;
                  version = packageJson.version;
                  src = ./.;
                  npmDepsHash = "sha256-wSSYPXAfsoqghsYu5quUZCyimVHtWu+Cp7yee7qAi7E=";
                };

              # Tarball created from `npm pack`
              tgz = config.packages.default.overrideAttrs (_self: (super: {
                name = "${super.pname}-${super.version}.tgz";
                makeCacheWritable = true;
                installPhase =
                  ''
                    tgzFile=$(npm --log-level=verbose pack | tail -n 1)
                    mv $tgzFile $out
                  '';
              }));

            };

            # Provides a development environment
            devShells = {
              default = config.packages.default.overrideAttrs (_self: (_super: {
                # What does this do?
                # `buildNpmPackage` is creates an npm cache in the
                # directory `$npmDeps`, so we tell `npm` to use that cache
                # when building things.
                # Unfortunately, that cache is in the nix store (and hence
                # cannot be written to), so we copy it out to a temporary
                # directory and point npm to the temporary directory.
                shellHook =
                  ''
                    # Copy the cache produced by nix somewhere else
                    # s.t. npm may write to it
                    TMP_DIR=$(mktemp -d)
                    cp -r $npmDeps/. $TMP_DIR
                    export NPM_CONFIG_CACHE=$TMP_DIR
                  '';
              }));
            };

            # Runs `npm test`
            checks.default =
              config.packages.default.overrideAttrs (_self: (_super: {
                postBuild =
                  ''
                    npm --log-level=verbose test
                  '';
              }));
          };
      };
}
