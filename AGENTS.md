# Agent Guide

This is a SolidJS 2.x project. Solid is not React: components run once (there is no re-render), reactivity is fine-grained through signals, and effects/memos have Solid-specific semantics. Do not port React patterns.

## Never define a component inside another component

Every component is a top-level function that gets its data through props. Do not declare a component (or a JSX-returning helper) inside another component's body and let it read the parent's props or signals through the closure.

Wrong:

```tsx
function List(props: { items: string[] }) {
  function ListItem(index: number) {
    return <div>{props.items[index]}</div>;
  }

  return <For each={props.items}>{(_, i) => ListItem(i())}</For>;
}
```

Right:

```tsx
function List(props: { items: string[] }) {
  return <For each={props.items}>{(item) => <ListItem item={item()} />}</For>;
}

function ListItem(props: { item: string }) {
  return <div>{props.item}</div>;
}
```

The nested version hides what the inner component depends on, cannot be reused or tested on its own, and blurs which scope owns which reactive reads. If the inner piece needs the parent's state, pass it as props (or through context), never through the closure.

## Versioned skills (in node_modules — read on demand)

The installed packages ship agent skills that match their exact installed versions:

- `node_modules/solid-js/skills/reactivity-diagnostics/SKILL.md` — repair guide mapping every dev-mode diagnostic code (e.g. `REACTIVE_WRITE_IN_OWNED_SCOPE`, `STRICT_READ_UNTRACKED`) to its prescribed fix. Read it whenever a Solid diagnostic code appears in test output or the browser console.
- `node_modules/@solidjs/diagnostics/skills/agent-loops/SKILL.md` — how to capture reactive evidence (which scopes re-ran and why, wasted recomputes, cost tables) and assert budgets, in tests and against live pages.

## Repository layout

One pnpm workspace (ADR 0028 in `docs/adr`):

- `packages/<package>`: the published packages, all at one version and released together: `components`, `flow`, `i18n`, `signal-forms`, `threejs`.
- `apps/docs`: one documentation site with a section per package (`src/routes/<package>`, `src/examples/<package>`, `src/nav/<package>.ts`). In dev and in its tests every package resolves to its source, so edits show up without a build.
- `docs/using/<package>.md`: setup guides for agents that add a package to an app.

Packages depend on siblings as peers with real ranges, and as `workspace:*` dev dependencies. A package's own tests and typecheck resolve a sibling through its exports, which point at `dist`: run `pnpm build` after installing, and again after changing a package another one uses.

Run every command with Node 24 from `mise.toml` (`eval "$(mise env -s bash)"`, then check `node -v`). Another Node's Intl data fails the components' date-formatting tests.

## Releasing

Every package is published to npm at the shared version by the release workflow when the commit that applies the changesets reaches `main` (ADR 0028). To cut a release, follow `.claude/skills/release/SKILL.md`: it drafts and applies the changesets, runs the checks, and asks before committing or pushing.

## Updating Solid

To move to a new Solid prerelease, follow `.claude/skills/solid-update/SKILL.md`: it reads the changelogs, checks every package against them, bumps the family and the peer floors, and verifies in tests and the docs site.

## Reactive diagnostics — capture evidence instead of guessing

Use these whenever you are debugging reactivity (something doesn't update, updates too often, or is slow) or verifying a change didn't regress update granularity:

- **In tests:** `captureArtifact()` from `@solidjs/diagnostics` wraps a scenario and returns a serializable artifact of diagnostics + rerun attribution; matchers from `@solidjs/diagnostics/vitest` (`toHaveNoDiagnostics`, `toStayWithinRerunBudget`, `toHaveNoWaste`, …) assert on it. No browser needed. flow's jsdom tests import it from `packages/flow/test/capture.ts`, which leaves out the wall-clock `HOT_SCOPE_TIME` check; its browser tests use the package's own.
- **Against the running dev server** (`diagnostics: true` in vite.config.ts; dev-only, no-op in builds). Requires an open page connected to the dev server (e.g. via a browser tool):
  - `GET /__solid/diagnostics` — status and connected client count
  - `POST /__solid/diagnostics` with JSON `{"method":"begin"}` then `{"method":"end"}` — capture a session into an artifact
  - `{"method":"whyDidRun","params":{"name":"<scope name>"}}` — recorded re-runs of one named scope in the open session
  - `{"method":"costs"}` — running cost tables for the open session

Name your signals/memos/effects (the `{ name: "..." }` option) — attribution reports scopes by name.

## Decisions and vocabulary

Read only what your task touches:

- `packages/<package>/CONTEXT.md`: the package's vocabulary. Start here, and use its terms in code, docs and replies. i18n's also says how it meets `@solid-slopkit/components`.
- `packages/<package>/docs/adr/`: the package's architecture decisions. `docs/adr/`: decisions about the whole repository. Read the relevant ones before designing something, and don't silently go against one. A new ADR takes the next free number across the repository, in the package's folder or, when it concerns the repository, in `docs/adr`.
- `packages/flow/docs/roadmap.md` and `packages/threejs/docs/roadmap.md`: the ordered steps to each package's 0.0.1. **Implement only the step you were asked for, by its ID.** Never continue into the next step or a whole milestone on your own.

## Each library stands alone

Never mention or reference other libraries of the same kind (UI, flow or diagram, form, i18n, 3D) by name, as a model, or in a comparison, in docs, LLM references, skills, code comments, test names or commit messages. Write "the soft variant", not "daisyUI's soft variant". Describe what each library does on its own terms. The exceptions:

- Naming an actual dependency: `@floating-ui/dom`, `three`, `elkjs`, and the `@solid-slopkit` packages each other's docs and tests use.
- Formats, standards and specifications a package implements, such as ICU MessageFormat, `Intl` and Standard Schema.
- License notices, such as the palette's attribution in `slopkit.css`.
