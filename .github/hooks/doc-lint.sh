#!/bin/sh
# doc-lint — lint the documents changed in a push range.
# Part of the hook baseline (.github/hooks). Config resolution:
# repo-local .markdownlint.json when present, otherwise the hub baseline
# config is fetched from the hub main branch.
# Usage: doc-lint.sh <from_commitish> <to_commitish>
#   <from> empty means "lint every tracked document in the tree".
set -eu

FROM=${1:-}
TO=${2:?usage: doc-lint.sh <from_commitish> <to_commitish>}

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

LIST=$(mktemp)
trap 'rm -f "$LIST"' EXIT

if [ -n "$FROM" ]; then
    git diff --name-only "$FROM" "$TO" -- '*.md' '*.markdown' > "$LIST"
else
    git ls-files -- '*.md' '*.markdown' > "$LIST"
fi

if [ ! -s "$LIST" ]; then
    echo "PASS[doc-lint] no documents changed"
    exit 0
fi

if ! command -v npx >/dev/null 2>&1; then
    echo "FAIL[doc-lint]: node/npx not available; install Node.js to satisfy the document lint" >&2
    exit 1
fi

CFG_ARGS=""
if [ ! -f .markdownlint.json ]; then
    echo "info: repo has no .markdownlint.json; fetching the hub baseline config" >&2
    CFG_DIR=$(mktemp -d)
    curl -fsSL https://raw.githubusercontent.com/mantit0985/.github/main/.markdownlint.json \
      -o "$CFG_DIR/markdownlint.json"
    CFG_ARGS="-c $CFG_DIR/markdownlint.json"
fi

xargs -d '\n' npx --yes markdownlint-cli@0.44.0 $CFG_ARGS < "$LIST" \
  && echo "PASS[doc-lint] all documents clean" \
  || { echo "FAIL[doc-lint]: markdownlint issues above block the push" >&2; exit 1; }