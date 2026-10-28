---
name: solid-update
description: Move every package and the docs site to a new Solid 2.x prerelease (solid-js, @solidjs/web and the packages released with them) - read the changelogs, check the code against every change, bump the ranges and the peer floor, fix what breaks, and verify in tests and the docs site. Use when the user asks to update, upgrade or migrate Solid, solid-js or @solidjs/*, or names a version like "rc.16".
---

# Updating Solid

`solid-js`, `@solidjs/web`, `@solidjs/signals`, `@solidjs/diagnostics`, `@solidjs/compiler` and `@solidjs/babel-plugin` release in lockstep as `2.0.0-rc.N`. `@solidjs/router`, `@solidjs/vite-plugin`, `@solidjs/meta` and `@solidjs/testing-library` release separately, and some of them peer on a minimum rc. Moving to a new rc means reading what changed, checking our code against it, then bumping. A green test run alone isn't enough, because a change can alter behavior that no test covers yet.

Update to the version the user names, even if a newer one exists. Mention the newer one at the end.

Run every command with mise's Node: start each shell with `eval "$(mise env -s bash)"`.

## 1. See where we are

- `git status --short` is clean. If it isn't, ask before mixing the update into other work.
- Declared ranges: `grep -rn "solid" package.json apps/*/package.json packages/*/package.json`. Every package under `packages/` declares `solid-js` and `@solidjs/web` as peers (`>=2.0.0-rc.N <3`) and `@solidjs/diagnostics` as a dev dependency. `apps/docs` declares the rest.
- What is actually installed. The lockfile can be ahead of the declared ranges or behind them:

  ```bash
  grep -nE "^  '?(solid-js|@solidjs/[a-z-]+)@" pnpm-lock.yaml
  ```

- What exists: `npm view <pkg> dist-tags` for each package. Solid 2.x is on the `next` tag.

## 2. Read the changelogs, all of them

The release notes are on GitHub, one release per package and version. Read every rc between the installed one and the target, not just the target:

```bash
for p in solid-js @solidjs/signals @solidjs/web @solidjs/diagnostics; do
  echo "======== $p"
  gh release view "$p@2.0.0-rc.N" --repo solidjs/solid --json body -q .body | grep -v "Updated dependencies"
done > <scratchpad>/solid-rc.N.md
```

Most of the changes live in `@solidjs/signals` and `@solidjs/web`. The `solid-js` release mostly lists dependency bumps. The notes run to tens of KB, so save them to the scratchpad and go through them in two passes:

1. `grep -n -iE "breaking|renamed|removed|no longer|deprecat|instead of"` for the headline changes.
2. A skim of every entry's first line (`grep -nE "^(- |  - )" | cut -c1-260`), because behavior changes are often not marked "breaking".

The router's releases are in `solidjs/solid-router`, tagged `v2.0.0-next.N`:

```bash
gh release list --repo solidjs/solid-router --limit 8
gh release view v2.0.0-next.N --repo solidjs/solid-router --json body -q .body
```

Most of the notes are about SSR, frames, server functions and hydration internals. Pick out the entries that can reach a package. Each package has its own places to look:

### `@solid-slopkit/components` (paths under `packages/components`)

| Kind of change                                                    | Where to look in our code                                                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Signal, memo or store semantics (writable derived values, holds)  | `createSignal(() => …)`, `createStore(fn)`, `createProjection`, `createOptimistic*`, `isPending`, `latest` |
| JSX and compiler (event names, attributes, `style`, `class`)      | `on*` props, spreads, `dynamic()` / polymorphic `as`                                                       |
| DOM runtime (form values, `select`, `value`, `checked`)           | Inputs: Checkbox, Radio, Switch, NativeSelect, and their tests                                             |
| Element claims (`registerElementClaim`, link state)               | `test/link-claims.ts`, every component that renders links or can render as one                             |
| Hydration and SSR                                                 | `test/ssr.tsx`, the `expectHydration` tests                                                                |
| Diagnostics codes and matchers (`toHaveNoWaste`, budgets, checks) | `test/diagnostics.ts`, `captureArtifact` tests                                                             |
| Renamed or removed exports and types                              | `grep -rn` for each name                                                                                   |

### `@solid-slopkit/signal-forms` (paths under `packages/signal-forms`)

| Kind of change                                                           | Where to look in this repo                                                                                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Store semantics (`createStore`, `reconcile`, `snapshot`, derived stores) | The form model is a store (ADR 0018): `src/form.ts`, `src/internal.ts`                                                  |
| Owners and roots (`getOwner`, `runWithOwner`, `createRoot`)              | A form belongs to the current owner (ADR 0020)                                                                          |
| Effects, async and `latest`                                              | Scope and async validation as one owned effect (ADR 0022): `async.test.ts`, `createEffect` uses                         |
| DOM runtime for form controls (`value`, `checked`, `select`)             | `src/bind.ts` and `src/control.ts` (ADR 0021) and `bind.inputs.test.tsx`. Native input behavior changes land here first |
| Spreads, `assign`, `merge`, `omit`                                       | The binding layers in `src/bind.ts` and `src/control.ts`                                                                |
| Diagnostics codes and matchers, rerun budgets                            | The `budget` vitest project (`*.budget.test.ts(x)`)                                                                     |
| Renamed or removed exports and types                                     | `grep -rn` for each name                                                                                                |

### `@solid-slopkit/i18n` (paths under `packages/i18n`)

| Kind of change                                                | Where to look in this repo                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| Owners and context (`getOwner`, `runWithOwner`, `useContext`) | Locale resolution from the reactive owner (ADR 0024): `src/runtime` |
| Async: `Loading`, `Errored`, `isPending`, `latest`, holds     | Message loading and locale switching in `src/runtime`               |
| SSR and hydration (`renderToString`, `isServer`)              | The `ssr` vitest project (`*.ssr.test.tsx`)                         |
| Compiler and vite plugin                                      | `src/vite.ts`, `src/compile`, `src/cli.ts`, and their tests         |
| `dynamic`, spreads and `assign`                               | `grep -rn "dynamic(\|spread\|assign("` in `src/runtime`             |
| Diagnostics codes and matchers, rerun budgets                 | The `budget` vitest project (`*.budget.test.tsx`)                   |
| Renamed or removed exports and types                          | `grep -rn` for each name                                            |

### `@solid-slopkit/flow` (paths under `packages/flow`)

| Kind of change                                                                  | Where to look in this repo                                                                                                               |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Store and projection semantics (derived stores, `reconcile`, `snapshot`, holds) | The graph model, history and changes (`src/model`, `src/history`, `src/changes`): `createStore`, `createProjection`, `snapshot`          |
| Writable derived signals and memos                                              | `createSignal(() => …)` and `createMemo` in node, edge and selection state                                                               |
| `latest`, `onSettled`, `flush` timing                                           | `grep -rn "latest(\|onSettled\|flush()"`; the editor and layout code                                                                     |
| `<Show>` / `<For>` and list reconciliation                                      | Node, edge and port rendering (`src/node`, `src/edge`, `src/port`)                                                                       |
| DOM runtime, spreads and `assign`                                               | `spread`/`assign`/`merge` uses; the browser tests (`*.browser.test.tsx`, `test/layout.browser.test.tsx`, `test/styles.browser.test.tsx`) |
| SSR (`renderToString`)                                                          | `test/render.tsx` and the `server` vitest project (`*.server.test.tsx`)                                                                  |
| Diagnostics codes and matchers                                                  | `test/capture.ts` and the tests that call `captureArtifact`                                                                              |
| Renamed or removed exports and types                                            | `grep -rn` for each name                                                                                                                 |

### `@solid-slopkit/threejs` (paths under `packages/threejs`)

| Kind of change                                                                       | Where to look in this repo                                                                                                                                               |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Effects and cleanup (`createEffect`, `createRenderEffect`, `onCleanup`, `onSettled`) | Scenes are components without a custom renderer (ADR 0025): objects are created and disposed through effects and owners, in `src/scene-component`, `src/t`, `src/canvas` |
| Writable derived signals, `untrack`, `flush` timing                                  | Nested field updates with partial values (ADR 0026); `createSignal` uses                                                                                                 |
| Async: `Loading`, `Errored`, `refresh`, `latest`                                     | Asset loading (`src/assets`) and its boundaries                                                                                                                          |
| SSR and hydration (`hydrate`, `isServer`)                                            | `test/ssr.tsx` and `test/harness.ts`                                                                                                                                     |
| WebGL/WebGPU in the browser                                                          | The `browser` vitest project (`*.browser.test.ts`, `test/webgl.browser.test.ts`)                                                                                         |
| Diagnostics codes and matchers                                                       | Tests that call `captureArtifact`                                                                                                                                        |
| Renamed or removed exports and types                                                 | `grep -rn` for each name                                                                                                                                                 |

Search with `grep -rnE … --include='*.ts' --include='*.tsx' --include='*.md' --exclude-dir=node_modules --exclude-dir=dist packages apps`. Quote the include globs, because zsh expands them otherwise.

For each change that touches us, decide one of:

- **No effect:** say why in a line, for example "the write only happens uncontrolled, where the source never changes".
- **Fixes something we document:** add a test that pins the documented behavior.
- **Breaks or changes something:** fix it, or bring it to the user if it is a design decision (a public attribute, a prop, an ADR).

## 3. Check the companion packages

A new rc can make the router or the vite plugin need a matching version, and a new router can need the new rc:

```bash
for p in @solidjs/router @solidjs/vite-plugin @solidjs/meta @solidjs/testing-library; do
  echo "$p: $(npm view $p@next peerDependencies --json | tr -d '\n ')"
done
npm view @solidjs/router versions --json | tail -5
```

Pick the newest router version whose peer range accepts the target rc, not just the newest one. Read its changelog for breaking changes, such as route params becoming decoded. The docs app and the components' tests are the only users of the router here.

## 4. Bump

Edit the ranges in `apps/docs/package.json` and every `packages/*/package.json`:

- `solid-js`, `@solidjs/web` and `@solidjs/diagnostics`: `^2.0.0-rc.N`.
- The peer floor in every package: `>=2.0.0-rc.N <3`. Raise it to the target, because the tests only run against that version.
- The router and other companions, if step 3 said so.

Then install, and make pnpm move the whole family:

```bash
pnpm install
pnpm -r update solid-js @solidjs/signals @solidjs/compiler @solidjs/babel-plugin
pnpm peers check
grep -nE "^  '?(solid-js|@solidjs/[a-z-]+)@" pnpm-lock.yaml
```

`pnpm install` alone can keep the old `solid-js` even though nothing accepts it anymore. It also keeps `@solidjs/compiler` and `@solidjs/babel-plugin` (which the vite plugin depends on) at the old rc. Every lockstep package must end on the target rc, and `pnpm peers check` must report no issues. Check that `git diff -- '*.json'` changes only the ranges you meant to change.

## 5. Run the checks

```bash
pnpm build && pnpm lint && pnpm format:check && pnpm test && pnpm --filter docs build && pnpm typecheck && pnpm release:check
```

Send the output to a scratchpad log and grep it (`Test Files|Tests |error TS| FAIL `), because it is long. Lint warnings in files you didn't touch were there before. If a Solid diagnostic code shows up, read `node_modules/solid-js/skills/reactivity-diagnostics/SKILL.md` for the fix. That skill ships with the installed version, so read it after the bump.

## 6. Verify what the changelog says in practice

When a change can't be ruled out by reading, check it with a throwaway test in `packages/<package>/src/__probe/`. Render what's involved, print what you need through a failing `expect(...).toEqual({})`, run it with `npx vitest run <file>` from the package's folder, then delete the folder. Then pin each finding with a real test next to the code.

If the change is visible in the browser, check the docs site too. `.claude/launch.json` runs it on port 3100. If another session holds that port, add a temporary entry on another port (with `--force` so Vite re-bundles the new dependencies), use it, and `git checkout -- .claude/launch.json` when you're done. Read computed values with `javascript_tool`. The pane may be hidden, which pauses CSS transitions, so take a screenshot before trusting a computed color.

## 7. Changeset and commit (ask first)

Add one changeset that lists every package whose peer floor moved. Raising the peer floor is a `patch`. Breaking changes to our own API take a `major`. Name what users will notice: the new minimum version and any behavior that changed. If an unreleased changeset from an earlier Solid update is still pending, replace it instead of adding a second minimum-version note.

Show the user the result and ask before committing. Keep the dependency bump in its own commit (`build: require Solid 2.0.0-rc.N`), separate from any fix it led to. When staging a changeset you moved with `git mv`, use `git add -A <old> <new>`. Write in the commit body what you checked and why nothing else needed to change. End commit messages with the attribution lines the conversation gives.

## Don'ts

- Don't upgrade past the version the user asked for.
- Don't change a public attribute, prop or ADR decision on your own. Show the evidence and ask.
- Don't leave the lockstep packages on different rcs.
- Don't push. That's the user's call, like the release (`.claude/skills/release/SKILL.md`).
