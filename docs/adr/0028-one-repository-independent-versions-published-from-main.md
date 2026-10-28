# One repository, independent versions, published from main

The `@solid-slopkit` packages (components, flow, i18n, signal-forms, threejs) live in one pnpm workspace, `solid-slopkit/solid-slopkit`, with one docs site (`apps/docs`, a section per package). They used to be five repositories, each with its own docs site, release workflow and copies of the same tooling, and each consumed its siblings from npm, so their ranges drifted apart.

Each package keeps its own version, set by Changesets. A package depends on a sibling as a peer with a real range (ADR 0016 of each package), and as a `workspace:*` dev dependency, so tests, typechecks and the docs always run against the siblings' current code. Changesets bumps a dependent only when a sibling's new version leaves its peer range (`onlyUpdatePeerDependentsWhenOutOfRange`).

A release is the commit on `main` that applies the changesets. The release workflow runs on every push to `main`: when some package's version isn't on npm, it runs every check, publishes each such package (packed with `pnpm pack`, which turns `workspace:` ranges into versions, and uploaded with `npm publish` for trusted publishing), and creates a GitHub Release tagged `<name>@<version>` for each. This replaces the `v<version>` tag that started each repository's release (ADR 0001 of each package): with several packages a single tag can't name what to release.

In dev and in the docs' tests, the packages resolve to their `src` through a `@solid-slopkit/source` export condition. Published manifests carry the condition too, and nothing outside this repository sets it.

## Considered Options

- **Lockstep versions (one `fixed` group):** rejected. The packages were at 0.0.0 to 0.7.0, and every release would bump all of them, publishing versions with no changes.
- **A tag per release, `<name>@<version>`, starting the workflow:** rejected. GitHub starts no workflow when more than three tags are pushed at once, which a release of several packages can hit, and the tags would have to be made by hand.
- **`changeset publish`:** not used. It uploads with pnpm, which doesn't do trusted publishing.
- **The Changesets GitHub Action and its "Version Packages" pull request:** not needed yet. Applying the changesets locally keeps the release a reviewed commit, as before.
- **Turborepo:** not needed yet. `pnpm -r` runs the scripts in dependency order, and the builds take seconds.
- **ADRs renumbered into one sequence:** rejected. Each package keeps its ADRs in `packages/<package>/docs/adr`, where the folder tells same-numbered decisions apart. New decisions take the next free number across the repository; ones about the whole repository go in `docs/adr`.
