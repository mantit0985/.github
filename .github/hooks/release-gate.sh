#!/bin/sh
# Release gate script validating tags before pushing.
#
# Assertions verified:
# 1. Tag name matches v+VERSION file (ignoring optional leading v).
# 2. Tagged commit equals current origin main tip.
# 3. Latest CI run for that commit succeeded.
# 4. Tag is an annotated GPG signed tag.
set -eu

# Resolve tag name from first argument; support refs/tags/ prefix.
TAG_REF="$1"
TAG=${TAG_REF#refs/tags/}

# Path to repository root; optional second argument.
REPO_ROOT=${2:-$(git rev-parse --show-toplevel)}

# Fetch the tag to ensure it is present.
origin_url=$(git remote get-url origin)
# In a git repo without tags locally, fetch the tag object first.
if ! git rev-parse "$TAG_REF" > /dev/null 2>&1; then
    git fetch "$origin_url" "$TAG_REF" || { echo "FAIL[fetch]: Could not fetch $TAG_REF" >&2; exit 1; }
fi

TAG_COMMIT=$(git rev-parse --verify "$TAG_REF^{commit}")

# 1. Verify VERSION file at tagged commit.
# Allow optional v prefix.
# Grab file content via git show at that commit.
VERSION_CONTENT=$(git show "$TAG_COMMIT:VERSION" 2>/dev/null || echo "")
VERSION=$(echo "$VERSION_CONTENT" | tr -d '[:space:]')
# Normalize both tag and version by removing leading 'v'
TAG_NUM=${TAG#v}
VER_NUM=${VERSION#v}
if [ "$TAG_NUM" != "$VER_NUM" ]; then
    echo "FAIL[1]: Tag name $TAG – version \"$VERSION\" mismatch" >&2
    exit 1
fi

echo "PASS[1] Tag name matches VERSION"

# 2. Check that tag commit equals origin main tip.
REMOTE_MAIN=$(git ls-remote "$origin_url" refs/heads/main | cut -f1)
if [ "$TAG_COMMIT" != "$REMOTE_MAIN" ]; then
    echo "FAIL[2]: Tag commit $TAG_COMMIT != origin main tip $REMOTE_MAIN" >&2
    exit 1
fi

echo "PASS[2] Tag commit matches remote main tip"

# 3. Check latest CI run for that commit.
REPO=$(git remote get-url --push origin | sed -E -e 's|\.git/?$||' -e 's|.*github\.com[/:]([^/]+)/([^/]+)/?$|\1/\2|')
# gh API requires https://api.github.com/...; gh handles auth via GITHUB_TOKEN env.
CI_CONCLUSION=$(gh api repos/${REPO}/actions/runs?head_sha=${TAG_COMMIT} |
  jq -r '.workflow_runs[] | select(.name=="CI") | .conclusion' | head -n1)
if [ -z "$CI_CONCLUSION" ]; then
    echo "FAIL[3]: No CI run found for commit $TAG_COMMIT" >&2
    exit 1
fi
if [ "$CI_CONCLUSION" != "success" ]; then
    echo "FAIL[3]: CI run concluded $CI_CONCLUSION" >&2
    exit 1
fi

echo "PASS[3] Latest CI run succeeded"

# 4. Ensure GPG signed tag.
# Verify tag object.
if ! git verify-tag "$TAG_REF" > /dev/null 2>&1; then
    echo "FAIL[4]: Tag $TAG_REF failed GPG verification" >&2
    exit 1
fi

echo "PASS[4] Tag is GPG signed"
exit 0
