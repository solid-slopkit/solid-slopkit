# slopkit

Packages for SolidJS 2.x apps.

**[Documentation and live examples →](https://solid-slopkit.github.io/solid-slopkit/)**

| Package                                                  | What it is                                                 | Agent setup guide                                          |
| -------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| [`@solid-slopkit/components`](./packages/components)     | A component library, with theming through CSS variables    | [docs/using/components.md](./docs/using/components.md)     |
| [`@solid-slopkit/signal-forms`](./packages/signal-forms) | Schema-driven, signal-based forms                          | [docs/using/signal-forms.md](./docs/using/signal-forms.md) |
| [`@solid-slopkit/i18n`](./packages/i18n)                 | Co-located, typed translation files                        | [docs/using/i18n.md](./docs/using/i18n.md)                 |
| [`@solid-slopkit/flow`](./packages/flow)                 | Primitives for node-based editors and interactive diagrams | [docs/using/flow.md](./docs/using/flow.md)                 |
| [`@solid-slopkit/threejs`](./packages/threejs)           | three.js scenes as SolidJS components                      | [docs/using/threejs.md](./docs/using/threejs.md)           |

[`apps/docs`](./apps/docs) is the source of the [documentation site](https://solid-slopkit.github.io/solid-slopkit/). [AGENTS.md](./AGENTS.md) is the guide for coding agents.

## Installing

The packages are published to npm, each with its own version. The guides in [`docs/using`](./docs/using) are for coding agents: point an agent at one to install and wire up that package in an app. To install by hand:

```bash
pnpm add @solid-slopkit/components
```

An app that renders on the server with the Vite dev server (`@solidjs/vite-plugin` in start mode) shows every component unstyled for about a second after each reload in dev, because the plugin's dev CSS crawl skips `node_modules`. Add the package to the crawl in `vite.config.ts` (the object replaces `start: true`). Production builds and client-only apps don't need this:

```ts
solid({ start: { css: { filter: { include: /@solid-slopkit\/components/ } } }, ssr: true });
```

## Developing

Node comes from `mise.toml` (`mise install`), and pnpm 12 runs the workspace:

```bash
pnpm install
pnpm build          # the packages' dist, which their tests and typechecks resolve each other through
pnpm dev            # the docs site, with every package from source
pnpm test           # every package's and the docs' tests, one project at a time
pnpm typecheck      # after `pnpm --filter docs build`, which generates the docs' route types
pnpm lint
pnpm format:check
```

To work on one package: `pnpm --filter @solid-slopkit/flow test`. Run `pnpm build` again after changing a package another one depends on.

## Releasing

[Changesets](https://github.com/changesets/changesets) sets each package's version (ADR 0028 in [docs/adr](./docs/adr)). A release is the commit on `main` that applies the changesets: pushing it starts [`.github/workflows/release.yml`](./.github/workflows/release.yml), which publishes every package whose version isn't on npm yet.

An agent can run the whole release with the `release` skill (`.claude/skills/release/SKILL.md`), and it asks before committing or pushing. By hand:

1. **Record changes as you go.** In the pull request that makes a change, run `pnpm changeset`, pick the packages and their bumps (`patch`, `minor`, `major`), and write one line for the changelog. Commit the generated `.changeset/*.md` file with the change.
2. **Apply the changesets.** On an up-to-date `main` with a clean tree:

   ```bash
   pnpm changeset version
   ```

   This sets the new versions in the packages, writes their `CHANGELOG.md` and deletes the applied changesets. Review the diff.

3. **Check it locally** (the workflow runs the same checks, so this only saves a round trip):

   ```bash
   pnpm format:check && pnpm lint && pnpm release:check && pnpm test && pnpm --filter docs build && pnpm typecheck
   ```

4. **Commit and push.**

   ```bash
   git add -A
   git commit -m "chore: release @solid-slopkit/components@0.8.0"
   git push origin main
   ```

5. **Watch the workflow.** It checks that no changesets are left unapplied, runs every check, builds the packages, publishes each new version to npm, and creates a GitHub Release tagged `<name>@<version>` with the changelog section as notes:

   ```bash
   gh run watch "$(gh run list --workflow release.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
   npm view @solid-slopkit/components@0.8.0 version
   gh release view @solid-slopkit/components@0.8.0
   ```

If the workflow fails before its "Publish to npm" step, nothing is published: fix the cause on `main`, and that push releases. If it fails after publishing, those versions are on npm for good: rerun the failed jobs (`gh run rerun <run-id> --failed`), which skips what's published, or release new patch versions.

### Publishing setup

The workflow publishes with npm trusted publishing (GitHub OIDC), so the repo has no npm token. npm only lets a package trust a workflow once the package exists, so a package's first version is published by hand, by someone who owns the `@solid-slopkit` scope on npm:

```bash
pnpm release:check
cd packages/<package> && pnpm pack && npm publish <tarball>
```

Then, on npmjs.com, open the package's Settings → Trusted publishing and add GitHub Actions with the repository `solid-slopkit/solid-slopkit` and the workflow `release.yml`. Push as usual afterwards: the workflow sees the version on npm, skips the publish and creates the GitHub Release.
