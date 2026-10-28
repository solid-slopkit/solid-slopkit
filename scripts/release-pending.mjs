// Prints `true` when the release isn't finished: some package's version isn't on npm yet, or the shared version has no
// GitHub Release (as after a run that published and then failed). The release workflow runs its checks, publishes and
// creates the Release only then, so an ordinary push to main costs one quick job. Needs `gh` and GH_TOKEN.
import { execFileSync } from 'node:child_process';
import { packages, published } from './packages.mjs';

const pending = packages().filter(({ name, version }) => !published(name, version));
for (const { name, version } of pending) console.error(`${name}@${version} is not on npm yet`);

const versions = new Set(packages().map(({ version }) => version));
let unreleased = false;
if (versions.size === 1) {
  const tag = `v${[...versions][0]}`;
  try {
    execFileSync('gh', ['release', 'view', tag], { stdio: 'ignore' });
  } catch {
    unreleased = true;
    console.error(`${tag} has no GitHub Release yet`);
  }
}
console.log(pending.length > 0 || unreleased);
