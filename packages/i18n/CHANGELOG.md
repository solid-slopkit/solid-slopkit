# @solid-slopkit/i18n

## 1.0.0

### Major Changes

- 1.0.0: every `@solid-slopkit` package now has the same version and is released together, from one repository (https://github.com/solid-slopkit/solid-slopkit) with one docs site (https://solid-slopkit.github.io/solid-slopkit/). Use the same version for every `@solid-slopkit` package in an app. The peer ranges between the packages now start at 1.0.0.

## 0.1.1

### Patch Changes

- 768a783: Requires Solid 2.0.0-rc.15 or newer: the `solid-js` and `@solidjs/web` peer ranges are now `>=2.0.0-rc.15 <3`, the version the package is tested against. Nothing in the package's behavior changes.

## 0.1.0

No changes in this release.

## 0.0.1

### Patch Changes

- First release: translations for SolidJS 2.x that live next to the components using them. A Vite plugin at `/vite` compiles each `*.i18n.jsonc` file into a module with typed messages, and the active locale comes from the reactive owner. Ships its LLM references and skills.
