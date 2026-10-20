#!/usr/bin/env bash
# Claude Code PostToolUse hook: format and lint the edited file, then check its length.
# Exit 2 sends lint errors back to the agent.
set -uo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
file=$(jq -r '.tool_input.file_path // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

case "$file" in
  "$root"/frontend/*.ts | "$root"/frontend/*.js | "$root"/frontend/*.mjs | "$root"/frontend/*.vue | "$root"/frontend/*.json)
    if ! out=$(cd "$root/frontend" && npx biome check --write "$file" 2>&1); then
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
