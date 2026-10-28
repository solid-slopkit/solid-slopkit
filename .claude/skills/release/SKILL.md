---
name: release
description: Release one or more @solid-slopkit packages under new versions - draft changesets, apply them, run the checks, commit, push to main, and watch the release workflow publish to npm. Use when the user asks to release, cut a release, publish, ship a version, or bump a version.
---

# Releasing slopkit packages

Every package under `packages/` has its own version (ADR 0028). Changesets sets the versions. Pushing the commit that applies them to `main` starts `.github/workflows/release.yml`, which runs every check, builds, publishes each package whose version isn't on npm yet through trusted publishing, and creates a GitHub Release tagged `<name>@<version>` (e.g. `@solid-slopkit/components@0.8.0`) for each, with its changelog section as notes. The README's "Releasing" section is the human version of these steps.

Committing and pushing are the user's calls. Stop and ask before each one, and show what will happen.

Run every command with Node 24 from `mise.toml`: start each shell with `eval "$(mise env -s bash)"` and check `node -v` (a Homebrew Node earlier in `PATH` can win over mise's; the components' date tests fail under another Node's Intl data).

## 1. Check the starting point

- `git status --short` is clean, and the branch is `main`, up to date with `origin/main` (`git fetch origin && git status -sb`). If not, tell the user and ask how to proceed. Don't switch branches or pull over their work yourself.
- The current versions: `node -e "import('./scripts/packages.mjs').then((m) => console.table(m.packages().map(({ name, version }) => ({ name, version }))))"`.
- The last release of a package: `git tag -l '@solid-slopkit/<package>@*' --sort=-v:refname | head -1`, and what npm has: `npm view @solid-slopkit/<package> versions` (an E404 means nothing is on npm yet; see "First publish" below).

## 2. Make sure there are changesets

List the pending ones: `ls .changeset/*.md | grep -v README.md`, and read each.

If there are none, or they miss changes, draft them from the history since each package's last tag (`git log --oneline <last-tag>..HEAD -- packages/<package>`):

```md
---
'@solid-slopkit/components': minor
---

Add the `Spotlight` component.
```

Pick the bump with semver while a version is 0.x: `minor` for new features or breaking changes, `patch` for fixes. One changeset can name several packages. Show the user the drafted changesets and the resulting versions, and let them edit or confirm before going on. Name the files after what they describe (`.changeset/spotlight.md`).

A package that peers on another (flow on components, components on i18n) only gets bumped with it when the new version leaves its peer range (`onlyUpdatePeerDependentsWhenOutOfRange` in `.changeset/config.json`). When a release needs a new feature of a sibling, raise the peer range in the same changeset and say so in its note.

## 3. Apply them

```bash
pnpm changeset version
```

This writes the new versions into each `packages/*/package.json`, appends their `CHANGELOG.md` and deletes the applied changesets. Check `git diff --stat` and the new changelog sections.

## 4. Run the checks

The workflow runs these on a GPU-less Linux runner. Running them first saves a failed release:

```bash
pnpm format:check
pnpm lint
pnpm release:check                      # builds the packages and lists what npm would publish
pnpm test
pnpm --filter docs build && pnpm typecheck
node scripts/release-notes.mjs <package>   # the release notes the workflow will publish, per package
```

In `release:check`'s output, check each file list: `dist/source`, `dist/types`, `skills` and `package.json`, nothing from `src` or tests.

If something fails, stop and report it with the output. Fixing it is a separate change, not part of the release commit.

## 5. Commit and push

Show the user the versions, the release notes and the file lists, then ask for the go-ahead. After a yes:

```bash
git add -A
git commit -m "chore: release @solid-slopkit/<package>@<version>"
```

Name every released package in the subject, or `chore: release` with the list in the body when there are several. End the commit message with the attribution lines the conversation gives for commits.

Pushing publishes the release, so ask again before:

```bash
git push origin main
```

## 6. Watch the workflow

```bash
gh run list --workflow release.yml --limit 1
gh run watch <run-id> --exit-status
gh release view @solid-slopkit/<package>@<version>
```

Then check npm: `npm view @solid-slopkit/<package>@<version> version dist.tarball`. Report each npm version, package page (`https://www.npmjs.com/package/@solid-slopkit/<package>`) and release URL. If the run fails, read the failing step's log (`gh run view <run-id> --log-failed`), explain the cause, and ask the user how to proceed. If it failed before the "Publish to npm" step, nothing is published: land the fix on `main` and the workflow tries again on that push. If it failed after publishing some packages, those versions are on npm for good (npm never accepts the same version twice): rerun the workflow (`gh run rerun <run-id> --failed`), which skips what's published and continues, or release new patch versions if the cause needs a code fix.

## First publish

npm only lets a package trust a workflow once the package exists. If `npm view @solid-slopkit/<package>` says E404, tell the user before pushing that these one-time steps are theirs (they need their npm login and 2FA):

1. Own the `@solid-slopkit` scope on npm (an npm organization of that name).
2. Publish the first version by hand: `pnpm release:check && cd packages/<package> && pnpm pack && npm publish <tarball>` (`pnpm pack` turns `workspace:` ranges into versions). Then push as usual: the workflow skips the publish and creates the GitHub Release.
3. On npmjs.com, under the package's Settings → Trusted publishing, add GitHub Actions with the repository `solid-slopkit/solid-slopkit` and the workflow `release.yml`.

Every later release publishes from the workflow.

## Don'ts

- Don't edit versions in `package.json` by hand; changesets own them.
- Don't publish from your machine (`npm publish`, `pnpm publish`, `changeset publish`). The workflow publishes what it built and checked, with provenance. The one exception is the first publish above, and only when the user runs it.
- Don't unpublish or deprecate versions on npm unless the user asks for it.
