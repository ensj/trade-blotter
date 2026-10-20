#!/usr/bin/env bash
# Soft 500-line limit: warns on stderr, never fails. Usage: check-file-length.sh [files...] (default: all tracked files).
limit=500
if [ $# -eq 0 ]; then
  cd "$(dirname "$0")/.." || exit 0
  set -- $(git ls-files)
fi
for f in "$@"; do
  case "$f" in
    *package-lock.json | *.svg | */Migrations/* | docs/* | transcripts/*) continue ;;
  esac
  [ -f "$f" ] || continue
  lines=$(wc -l <"$f" | tr -d ' ')
  if [ "$lines" -gt "$limit" ]; then
    echo "warning: $f has $lines lines (soft limit $limit); consider splitting it." >&2
  fi
done
exit 0
