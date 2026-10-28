// Publishes every package at the shared version, as `pnpm release:check` built it (ADR 0028). pnpm packs each tarball,
// which turns `workspace:` ranges into real versions; npm, not pnpm, does the upload, because it authenticates through
// trusted publishing in GitHub Actions. A version that is already on npm is skipped, so the release workflow can be
// rerun after a later step failed.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packages, published, sharedVersion } from './packages.mjs';

const version = sharedVersion();

for (const { name, dir } of packages()) {
  if (published(name, version)) {
    console.log(`${name}@${version} is already on npm, skipping.`);
    continue;
  }
  if (!existsSync(join(dir, 'dist'))) {
    console.error(`${name} isn't built: run \`pnpm release:check\` first.`);
    process.exit(1);
  }
  const out = mkdtempSync(join(tmpdir(), 'slopkit-pack-'));
  execFileSync('pnpm', ['pack', '--pack-destination', out], { cwd: dir, stdio: 'inherit' });
  const [tarball] = readdirSync(out);
  execFileSync('npm', ['publish', join(out, tarball)], { cwd: dir, stdio: 'inherit' });
  console.log(`Published ${name}@${version}`);
}
