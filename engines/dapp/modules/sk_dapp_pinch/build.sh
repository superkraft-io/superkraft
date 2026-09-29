#!/bin/sh
# Rebuilds prebuilt/darwin-universal/sk_dapp_pinch.node (arm64 + x64).
# Pure N-API, so one build works across Electron versions; rerun only when src/ changes.
set -e

cd "$(dirname "$0")"

ELECTRON_VERSION="${ELECTRON_VERSION:-$(node -p "require('electron/package.json').version")}"
OUT=prebuilt/darwin-universal
# Outside build/: node-gyp rebuild wipes it per arch.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT"

for ARCH in arm64 x64; do
    npx node-gyp rebuild --target="$ELECTRON_VERSION" --arch="$ARCH" --dist-url=https://electronjs.org/headers
    cp build/Release/sk_dapp_pinch.node "$TMP/sk_dapp_pinch-$ARCH.node"
done

lipo -create "$TMP/sk_dapp_pinch-arm64.node" "$TMP/sk_dapp_pinch-x64.node" -output "$OUT/sk_dapp_pinch.node"
rm -rf build

lipo -info "$OUT/sk_dapp_pinch.node"
