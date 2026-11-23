# @solid-slopkit/flow

## 1.0.1

### Patch Changes

- 5d8e32c: Require the stable Solid 2: `solid-js` and `@solidjs/web` 2.0.3 or newer. The release candidates are no longer accepted.

  `@solid-slopkit/threejs`: a Scene component whose `args` or `object` reads an Asset that is still loading, such as `<T.Group object={model().scene} />`, waits for the Loading boundary around it again in development. Solid's development build since 2.0.0-rc.21 reported it as `PENDING_ASYNC_UNTRACKED_READ` and stopped updating.

## 1.0.0

### Major Changes

- 1.0.0: every `@solid-slopkit` package now has the same version and is released together, from one repository (https://github.com/solid-slopkit/solid-slopkit) with one docs site (https://solid-slopkit.github.io/solid-slopkit/). Use the same version for every `@solid-slopkit` package in an app. The peer ranges between the packages now start at 1.0.0.

### Patch Changes

- Dragging the Selection right after Shift-clicking a Node no longer puts every Node back. Chromium on Linux started its own drag of the Node on that press, which cancelled the pointer; a press that can drag a Node now cancels the browser's drag.
- Require `@solid-slopkit/components` 1.0. The Controls' lock button now marks its pressed state with `data-pressed` instead of `data-active`; update custom CSS that targets it.
- 1aeec78: Require Solid 2.0.0-rc.15: the `solid-js` and `@solidjs/web` peers now start at `2.0.0-rc.15`, the version the package is tested against.
- Updated dependencies
  - @solid-slopkit/components@1.0.0
