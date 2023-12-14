{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    pre-commit-hooks-nix.url = "github:cachix/pre-commit-hooks.nix";
    pre-commit-hooks-nix.inputs.nixpkgs.follows = "nixpkgs";
    hci-effects.url = "github:hercules-ci/hercules-ci-effects";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; }
      {
        systems = [ "x86_64-linux" "x86_64-darwin" ];
        imports = [
          ./hercules-ci.nix
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
                  npmDepsHash = "sha256-EScCx9IRBLN0WXwAwJeH84PimI8Mz22qmNdV50doFo4=";
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

              # Documentation from `npm run docs`
              docs = config.packages.default.overrideAttrs (_self: (_super: {
                npmBuildScript = "docs";
                installPhase =
                  ''
                    mv ./docs $out
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
                    ${config.devShells.dev-pre-commit.shellHook}

                     # Copy the cache produced by nix somewhere else
                     # s.t. npm may write to it
                     TMP_DIR=$(mktemp -d)
                     cp -r $npmDeps/. $TMP_DIR
                     export NPM_CONFIG_CACHE=$TMP_DIR
                     find $TMP_DIR -exec chmod +777 {} \;
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
