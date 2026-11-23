# @solid-slopkit/threejs

## 1.0.1

### Patch Changes

- 5d8e32c: Require the stable Solid 2: `solid-js` and `@solidjs/web` 2.0.3 or newer. The release candidates are no longer accepted.

  `@solid-slopkit/threejs`: a Scene component whose `args` or `object` reads an Asset that is still loading, such as `<T.Group object={model().scene} />`, waits for the Loading boundary around it again in development. Solid's development build since 2.0.0-rc.21 reported it as `PENDING_ASYNC_UNTRACKED_READ` and stopped updating.

## 1.0.0

### Major Changes

- 1.0.0: every `@solid-slopkit` package now has the same version and is released together, from one repository (https://github.com/solid-slopkit/solid-slopkit) with one docs site (https://solid-slopkit.github.io/solid-slopkit/). Use the same version for every `@solid-slopkit` package in an app. The peer ranges between the packages now start at 1.0.0.

## 0.1.1

### Patch Changes

- e390678: Require Solid 2.0.0-rc.15 or later: the `solid-js` and `@solidjs/web` peer ranges now start at `2.0.0-rc.15`.

## 0.1.0

No changes in this release.

## 0.0.1

### Patch Changes

- First release: three.js scenes as SolidJS 2.x components. `Canvas`, a Scene component for every three.js scene-graph class in `T`, `sceneComponent()` for others, Partial values, Attach and Rebuild, frames on demand with `onFrame` and `onRender`, cameras, pointer events, `loadAsset` with a shared Asset cache, server rendering, orbit controls at `/controls` and WebGPU at `/webgpu`. Ships its LLM references and skills.
