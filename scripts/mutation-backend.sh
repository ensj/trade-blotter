#!/usr/bin/env bash
# Runs Stryker.NET on backend Features/**. Extra args pass through, e.g. --since:main.
set -euo pipefail
. "$(dirname "$0")/dotnet-env.sh"
cd "$(dirname "$0")/../backend"
cores=$(getconf _NPROCESSORS_ONLN)
dotnet tool restore >/dev/null
dotnet stryker --concurrency "$((cores > 1 ? cores - 1 : 1))" "$@"
