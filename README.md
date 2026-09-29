# SuperKraft (SK)

## What is SK?

SuperKraft is a framework that aims to make development of web applications (both websites and desktop apps) easier and more streamlined.

## What does SK offer?

- Website development
- Desktop app development with SK++ and Electron
- Supports mobile responsiveness
- An extensive built-in UI library with many different components such as label, button, checkbox, list, infinite list, ice rink scroller, icon, image, rating, etc...
- Support for PWA witch event listeners for e.g screen rotation
- Cookie manager
- Cursor manager for custom cursors, supports SVG's as cursor
- Tweening class with all kinds of easings such as `linear`, `easeInQuad`, `easeOutElastic` and many many more.
- Localization for mutliple languages
- Directional trackpad pinch (horizontal / vertical / diagonal) for Electron apps on macOS

## Directional pinch

Browsers report a trackpad pinch as a ctrl+wheel with no direction. In Electron (dapp) apps on macOS, SK reads the finger positions natively and dispatches a bubbling `sk_pinch` event on the element under the pointer:

```js
element.addEventListener('sk_pinch', e => {
    var {phase, axis, scale, scaleX, scaleY, clientX, clientY} = e.detail
    // phase: 'begin' | 'update' | 'end'
    // axis:  'x' | 'y' | 'xy', locked for the whole gesture
    // scale > 1 zooms in; scaleX / scaleY are 1 on the axis not zooming
})

element.addEventListener('wheel', e => {
    if (sk.pinch.isPinchWheel(e)) return // Chromium's ctrl+wheel copy of the same pinch
    // ...
})
```

Elsewhere (Windows, SK++, websites) `sk_pinch` never fires and `sk.pinch.isPinchWheel()` returns `false`, so a normal ctrl+wheel zoom keeps working as the fallback. No build step is needed; a universal (Apple Silicon + Intel) binary ships prebuilt. See [engines/dapp/modules/sk_dapp_pinch](engines/dapp/modules/sk_dapp_pinch/README.md) for how it works and how to rebuild it.
