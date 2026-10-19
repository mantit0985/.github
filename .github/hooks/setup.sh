#!/bin/sh
# Hook baseline installer — single entry point.
# Hooks accounted for: commit-msg, pre-push, doc-lint.sh, release-gate.sh.
# release-publish.sh is hub-internal and is NOT part of the host install.
# Usage: run from any repo via `make hooks`, or: setup.sh | sh
set -eu

DEST="${GIT_HOOKS_HOME:-$HOME/.git-hooks}"
BASE_URL="https://raw.githubusercontent.com/mantit0985/.github/main/.github/hooks"

mkdir -p "$DEST"
for hook in commit-msg pre-push doc-lint.sh release-gate.sh; do
    curl -fsSL "$BASE_URL/$hook" -o "$DEST/$hook"
    chmod +x "$DEST/$hook"
done

git config --global core.hooksPath "$DEST"
echo "hook baseline installed: commit-msg pre-push doc-lint.sh release-gate.sh -> $DEST/"
