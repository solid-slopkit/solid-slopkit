// The released packages (every packages/* folder), each with its own version (ADR 0001).
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

/** Every package under packages/, in name order, with its folder. */
export function packages() {
  return readdirSync(new URL('packages/', root), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = new URL(`packages/${entry.name}/`, root);
      const { name, version } = JSON.parse(readFileSync(new URL('package.json', dir), 'utf8'));
      return { name, version, dir: fileURLToPath(dir), tag: `${name}@${version}` };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The package called `name` (`@solid-slopkit/flow` or just `flow`). Exits when there is none. */
export function packageNamed(name) {
  const found = packages().find((pkg) => pkg.name === name || pkg.name === `@solid-slopkit/${name}`);
  if (!found) {
    console.error(
      `No package called ${name}. The packages: ${packages()
        .map((pkg) => pkg.name)
        .join(', ')}`,
    );
    process.exit(1);
  }
  return found;
}

/** Whether `name@version` is on the registry. `npm view` prints nothing for a missing version of a known package. */
export function published({ name, version }) {
  try {
    return execFileSync('npm', ['view', `${name}@${version}`, 'version'], { encoding: 'utf8' }).trim() === version;
  } catch {
    return false; // E404: the package itself isn't on npm yet.
  }
}
