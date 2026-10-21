# Sourced, not run: puts ~/.dotnet first on PATH when present; git hooks and scripts don't read ~/.zshenv.
if [ -d "$HOME/.dotnet" ]; then
  export DOTNET_ROOT="$HOME/.dotnet" PATH="$HOME/.dotnet:$PATH"
fi
