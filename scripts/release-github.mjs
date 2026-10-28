// Creates the GitHub Release for the shared version, tagged `v<version>` at the current commit, once every package is
// on npm at that version (ADR 0028). Runs after release-publish.mjs, and is safe to rerun. Needs `gh` and GH_TOKEN.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { packages, published, sharedVersion } from './packages.mjs';

const version = sharedVersion();
const tag = `v${version}`;

// The registry takes a while to serve a version it just accepted, so wait for every package, up to 10 minutes.
let missing = packages().filter(({ name }) => !published(name, version));
for (let attempt = 1; missing.length > 0 && attempt <= 40; attempt++) {
  console.log(`Waiting for npm to serve ${version} of ${missing.map(({ name }) => name).join(', ')}`);
  await new Promise((resolve) => setTimeout(resolve, 15_000));
  missing = missing.filter(({ name }) => !published(name, version));
}
if (missing.length > 0) {
  console.error(`Not on npm at ${version} yet: ${missing.map(({ name }) => name).join(', ')}`);
  process.exit(1);
}

let released = true;
try {
  execFileSync('gh', ['release', 'view', tag], { stdio: 'ignore' });
} catch {
  released = false;
}

if (released) {
  console.log(`The ${tag} release exists, skipping.`);
} else {
  writeFileSync('release-notes.md', execFileSync('node', ['scripts/release-notes.mjs'], { encoding: 'utf8' }));
  execFileSync(
    'gh',
    ['release', 'create', tag, '--target', process.env.GITHUB_SHA ?? 'main', '--title', tag, '--notes-file', 'release-notes.md'],
    {
      stdio: 'inherit',
    },
  );
}
