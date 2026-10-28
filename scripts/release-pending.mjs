// Prints `true` when some package's version isn't on npm yet, `false` otherwise. The release workflow runs its checks
// and publishes only then, so an ordinary push to main costs one quick job.
import { packages, published } from './packages.mjs';

const pending = packages().filter((pkg) => !published(pkg));
for (const pkg of pending) console.error(`${pkg.tag} is not on npm yet`);
console.log(pending.length > 0);
