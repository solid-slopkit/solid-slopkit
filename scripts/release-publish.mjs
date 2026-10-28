// Publishes every package whose version isn't on npm yet, as `pnpm release:check` built it (ADR 0001). pnpm packs the
// tarball, which turns `workspace:` ranges into real versions; npm, not pnpm, does the upload, because it authenticates
// through trusted publishing in GitHub Actions. A version that is already on npm is skipped, so the release workflow can
// be rerun after a later step failed.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packages, published } from './packages.mjs';

for (const pkg of packages()) {
  if (published(pkg)) {
    console.log(`${pkg.tag} is already on npm, skipping.`);
    continue;
  }
  if (!existsSync(join(pkg.dir, 'dist'))) {
    console.error(`${pkg.name} isn't built: run \`pnpm release:check\` first.`);
    process.exit(1);
  }
  const out = mkdtempSync(join(tmpdir(), 'slopkit-pack-'));
  execFileSync('pnpm', ['pack', '--pack-destination', out], { cwd: pkg.dir, stdio: 'inherit' });
  const tarball = execFileSync('ls', [out], { encoding: 'utf8' }).trim();
  execFileSync('npm', ['publish', join(out, tarball)], { cwd: pkg.dir, stdio: 'inherit' });
  console.log(`Published ${pkg.tag}`);
}
