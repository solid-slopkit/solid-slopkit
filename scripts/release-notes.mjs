// Prints the GitHub Release notes for one package's current version (ADR 0001): its section of CHANGELOG.md, which
// `pnpm changeset version` wrote. Usage: `node scripts/release-notes.mjs <package>`.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageNamed } from './packages.mjs';

const { dir, version } = packageNamed(process.argv[2]);
const changelog = join(dir, 'CHANGELOG.md');
let body = '';
if (existsSync(changelog)) {
  // The lines after "## <version>", up to the next version's heading.
  const lines = readFileSync(changelog, 'utf8').split('\n');
  const start = lines.indexOf(`## ${version}`);
  if (start !== -1) {
    const end = lines.findIndex((line, i) => i > start && line.startsWith('## '));
    body = lines
      .slice(start + 1, end === -1 ? undefined : end)
      .join('\n')
      .trim();
  }
}
console.log(body || 'No changes in this release.');
