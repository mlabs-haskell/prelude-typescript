{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    pre-commit-hooks-nix.url = "github:cachix/pre-commit-hooks.nix";
    pre-commit-hooks-nix.inputs.nixpkgs.follows = "nixpkgs";
    hci-effects.url = "github:hercules-ci/hercules-ci-effects";
    flake-lang.url = "github:mlabs-haskell/flake-lang.nix?ref=jared/ts-tgz-to-folder";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; }
      {
        systems = [ "x86_64-linux" "x86_64-darwin" ];
        imports = [
          ./hercules-ci.nix
          ./pre-commit.nix
        ];
        perSystem = { system, config, ... }:
          let
            tsFlake = inputs.flake-lang.lib.${system}.typescriptFlake
              {
                name = "prelude";
                src = ./.;
                npmExtraDependencies = [ ];
                devShellHook =
                  ''
                    ${config.devShells.dev-pre-commit.shellHook}
                  '';
              };
          in
          {

            packages = {
              # Tarball of the package
              tgz = tsFlake.packages.prelude-typescript-tgz;

              # Unpacked tarball of the package
              lib = tsFlake.packages.prelude-typescript-lib;

              # Documentation
              docs = tsFlake.packages.prelude-typescript.overrideAttrs (_self: (_super: {
                name = "docs";
                npmBuildScript = "docs";
                installPhase =
                  ''
                    mv ./docs $out
                  '';
              }));
            };


            # Provides a development environment
            devShells.default = tsFlake.devShells.prelude-typescript;

            # Runs `npm test`
            checks.default = tsFlake.checks.prelude-typescript-test;
          };
      };
}
