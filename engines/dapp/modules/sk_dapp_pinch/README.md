# sk_dapp_pinch

Directional trackpad pinch for dapp (Electron) windows on macOS. For how to use `sk_pinch` in an app, see the [SuperKraft README](../../../../README.md#directional-pinch).

## Why native

Chromium turns a trackpad pinch into a `wheel` event with `ctrlKey: true` and a single `deltaY`. The page gets no finger positions, so it cannot tell a horizontal pinch from a vertical one. macOS does report the fingers, so a small Objective-C addon reads them.

## How it works

```
sk_dapp_pinch.node (Obj-C)   local NSEvent monitor on attached windows
        │                    magnify events: phase + magnification (no touches)
        │                    gesture events: normalized finger positions + trackpad size
        ▼
sk_dapp_pinch.js (main)      pairs each magnify with the latest finger positions,
        │                    emits 'pinch-gesture' on the BrowserWindow
        ▼
dapp/rootView.js             forwards to the page via UMS ('sk_be_pinch-' + viewID),
        │                    sets sk.nativePinch before the page renders
        ▼
frontend/libs/sk_pinch       locks the axis from the finger angle at gesture start
                             (within 30° of vertical: y, otherwise x),
                             dispatches 'sk_pinch' on the element under the pointer
```

The `pinch-gesture` payload is `{phase, magnification, touches: [{x, y}], deviceWidth, deviceHeight}`. Touches are normalized trackpad positions (0 to 1) and the device size is in points. Axis logic is kept in JS so it can be tuned without recompiling.

If the addon cannot load, or the platform is not macOS, `attach()` returns `false`, `sk.nativePinch` is `false`, and nothing is emitted.

## Binary

`prebuilt/darwin-universal/sk_dapp_pinch.node` is a universal binary (arm64 + x86_64, macOS 11+) and is committed, so apps need no build step. It uses only Node-API, which is ABI-stable, so the same binary works across Electron versions.

The loader tries, in order:

1. `build/Release/sk_dapp_pinch.node` (a local `node-gyp` build, gitignored)
2. `prebuilt/darwin-universal/sk_dapp_pinch.node`

## Rebuilding

Only needed when `src/sk_dapp_pinch.mm` changes. From a project that has `electron` and `node-gyp` installed:

```sh
./build.sh
```

This builds arm64 and x64 against the installed Electron's headers (override with `ELECTRON_VERSION=x.y.z`), merges them with `lipo` into `prebuilt/darwin-universal/`, and removes `build/`. Commit the updated binary.

To check both slices load, run the app's x64 Electron under Rosetta (`arch -x86_64 .../Electron.app/Contents/MacOS/Electron`) and confirm `require('./sk_dapp_pinch.js').addon` is set.
