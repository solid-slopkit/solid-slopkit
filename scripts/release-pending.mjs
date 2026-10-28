// Prints `true` when some package's version isn't on npm yet, `false` otherwise. The release workflow runs its checks
// and publishes only then, so an ordinary push to main costs one quick job.
import { packages, published } from './packages.mjs';

const pending = packages().filter(({ name, version }) => !published(name, version));
for (const { name, version } of pending) console.error(`${name}@${version} is not on npm yet`);
console.log(pending.length > 0);
