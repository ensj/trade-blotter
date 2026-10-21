#!/usr/bin/env bash
# Runs a command with the .NET 8 SDK from ~/.dotnet on PATH.
. "$(dirname "$0")/dotnet-env.sh"
exec "$@"
