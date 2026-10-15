#!/usr/bin/env bash
# Release publish helper: dispatch → watch → download → verify → sign → upload.
# Usage: release-publish.sh <owner/repo> <tag>
# Runs after the pre-push gate has passed and the signed tag is on origin.
set -euo pipefail

REPO="${1:?usage: release-publish.sh <owner/repo> <tag>}"
TAG="${2:?usage: release-publish.sh <owner/repo> <tag>}"

# 1. Dispatch the reusable release workflow
gh workflow run release.yml -R "$REPO" -f tag="$TAG"
echo "PASS[dispatch] release workflow dispatched for $TAG on $REPO"

# 2. Watch the run to completion
RUN_ID=$(gh run list -R "$REPO" --workflow=release.yml --limit 1 --json databaseId,createdAt --jq '.[0].databaseId')
gh run watch "$RUN_ID" -R "$REPO" --exit-status
echo "PASS[run] release workflow succeeded (run $RUN_ID)"

# 3. Download assets to a fresh temp dir and verify the checksum manifest
DIR=$(mktemp -d)
gh release download "$TAG" -R "$REPO" -D "$DIR" -p SHA256SUMS -p '*-source.tar.gz'
(cd "$DIR" && sha256sum -c SHA256SUMS)
echo "PASS[checksums] every asset matches SHA256SUMS"

# 4. Detach-sign SHA256SUMS locally (private key never leaves this machine)
(cd "$DIR" && gpg --batch --yes --detach-sign --local-user "${RELEASE_KEY:-5EFC12ED8C0F0586}" -o SHA256SUMS.sig SHA256SUMS)
echo "PASS[sign] SHA256SUMS.sig created with key ${RELEASE_KEY:-5EFC12ED8C0F0586}"

# 5. Upload the signature
gh release upload "$TAG" -R "$REPO" "$DIR/SHA256SUMS.sig"

# 6. Final verification
(cd "$DIR" && gpg --verify SHA256SUMS.sig SHA256SUMS)
echo "PASS[publish] Release $TAG fully verified (gate → checksums → signature)"
echo "Artifacts checked in: $DIR"
