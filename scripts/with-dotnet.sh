#!/usr/bin/env bash
# Runs a command with ~/.dotnet first on PATH when present; git hooks don't read ~/.zshenv.
if [ -d "$HOME/.dotnet" ]; then
  export DOTNET_ROOT="$HOME/.dotnet" PATH="$HOME/.dotnet:$PATH"
fi
exec "$@"
