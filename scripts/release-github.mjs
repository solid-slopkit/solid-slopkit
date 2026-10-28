// Creates a GitHub Release, tagged `<name>@<version>` at the current commit, for every package whose version is on npm
// but has no release yet (ADR 0001). Runs after release-publish.mjs, and is safe to rerun. Needs `gh` and GH_TOKEN.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { packages, published } from './packages.mjs';

function released(tag) {
  try {
    execFileSync('gh', ['release', 'view', tag], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

for (const pkg of packages()) {
  if (!published(pkg) || released(pkg.tag)) continue;
  const notes = execFileSync('node', ['scripts/release-notes.mjs', pkg.name], { encoding: 'utf8' });
  writeFileSync('release-notes.md', notes);
  const target = process.env.GITHUB_SHA ?? 'main';
  execFileSync('gh', ['release', 'create', pkg.tag, '--target', target, '--title', pkg.tag, '--notes-file', 'release-notes.md'], {
    stdio: 'inherit',
  });
}
