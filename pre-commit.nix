{ ... }: {
  perSystem = { config, ... }: {
    devShells.dev-pre-commit = config.pre-commit.devShell;
    pre-commit.settings = {
      hooks = {
        nixpkgs-fmt.enable = true;
        deadnix.enable = true;
        denolint.enable = true;
        denofmt.enable = true;
        markdownlint.enable = true;
      };
    };
  };
}
