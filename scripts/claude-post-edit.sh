#!/usr/bin/env bash
# Claude Code PostToolUse hook: format and lint the edited file, then check its length.
# Exit 2 sends lint errors back to the agent.
set -uo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
if ! command -v jq >/dev/null; then
  echo "claude-post-edit.sh: jq is not installed, so edited files were not formatted or linted. Install it (brew install jq)." >&2
  exit 2
fi
file=$(jq -r '.tool_input.file_path // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

case "$file" in
  "$root"/frontend/*.ts | "$root"/frontend/*.js | "$root"/frontend/*.mjs | "$root"/frontend/*.vue | "$root"/frontend/*.json)
    if ! out=$(cd "$root/frontend" && npx biome check --write "$file" 2>&1); then
      echo "$out" >&2
      exit 2
    fi
    ;;
  "$root"/*.json)
    # Root-level files only; Biome's VCS integration crashes on paths outside frontend/, so it is off here.
    if [ "$(dirname "$file")" = "$root" ] &&
      ! out=$(cd "$root/frontend" && npx biome check --write --vcs-enabled=false "$file" 2>&1); then
      echo "$out" >&2
      exit 2
    fi
    ;;
  "$root"/backend/*.cs)
    if ! out=$(cd "$root" && scripts/with-dotnet.sh dotnet csharpier format "$file" 2>&1); then
      echo "$out" >&2
      exit 2
    fi
    ;;
esac

"$root/scripts/check-file-length.sh" "$file"
exit 0
