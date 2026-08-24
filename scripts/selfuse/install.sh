#!/usr/bin/env bash
# One-click wrapper around scripts/selfuse/install.mjs (WSL/Linux).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec node "$ROOT/scripts/selfuse/install.mjs" "$@"
