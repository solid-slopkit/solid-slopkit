# One repository, one version, published from main

The `@solid-slopkit` packages (components, flow, i18n, signal-forms, threejs) live in one pnpm workspace, `solid-slopkit/solid-slopkit`, with one docs site (`apps/docs`, a section per package). They used to be five repositories, each with its own docs site, release workflow and copies of the same tooling, and each consumed its siblings from npm, so their ranges drifted apart.

Every package has the same version, and they are released together: Changesets keeps them in one `fixed` group, so a changeset for any package moves all of them, and packages with no changes of their own get a release that says so. `@solid-slopkit/*@x.y.z` always names a set of packages that were built and tested together, and a user picks one version for the whole family. A package depends on a sibling as a peer with a real range (ADR 0016 of each package), and as a `workspace:*` dev dependency, so tests, typechecks and the docs always run against the siblings' current code. When a release leaves a sibling's peer range (a major bump, or a minor one while the versions were 0.x), Changesets moves the range with it; `onlyUpdatePeerDependentsWhenOutOfRange` keeps that from turning into a major bump of the whole group.

A release is the commit on `main` that applies the changesets. The release workflow runs on every push to `main`: when the shared version isn't on npm, it runs every check, publishes every package (packed with `pnpm pack`, which turns `workspace:` ranges into versions, and uploaded with `npm publish` for trusted publishing), and creates one GitHub Release tagged `v<version>`, whose notes are each package's changelog section. This replaces the tag that started each repository's release (ADR 0001 of each package).

In dev and in the docs' tests, the packages resolve to their `src` through a `@solid-slopkit/source` export condition. Published manifests carry the condition too, and nothing outside this repository sets it.

## Considered Options

- **Independent versions per package:** rejected. The packages are used together and depend on each other, and separate versions left users to work out which ones fit, with ranges that drifted apart (flow needed components `^0.2` while components was at 0.7). The cost of one version is releases of packages that didn't change, and the jump of the packages that were behind (flow, i18n, signal-forms, threejs) to components' version on the first shared release.
- **A `v<version>` tag starting the workflow:** possible again now that one tag names the whole release, but not needed: the commit that applies the changesets already carries the version, and the workflow makes the tag when it creates the Release.
- **`changeset publish`:** not used. It uploads with pnpm, which doesn't do trusted publishing.
- **The Changesets GitHub Action and its "Version Packages" pull request:** not needed yet. Applying the changesets locally keeps the release a reviewed commit, as before.
- **Turborepo:** not needed yet. `pnpm -r` runs the scripts in dependency order, and the builds take seconds.
- **ADRs renumbered into one sequence:** rejected. Each package keeps its ADRs in `packages/<package>/docs/adr`, where the folder tells same-numbered decisions apart. New decisions take the next free number across the repository; ones about the whole repository go in `docs/adr`.
