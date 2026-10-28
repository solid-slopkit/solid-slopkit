// The LLM references and the skill are handwritten (ADR 0012). This keeps them in step with the code: every public
// export is mentioned, every link in src/llms.md resolves, every reference is linked, and every skill is listed.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import * as forms from '../src/index';

const src = join(dirname(fileURLToPath(import.meta.url)), '../src');
const skills = join(src, '../skills');
const index = readFileSync(join(src, 'llms.md'), 'utf8');
const links = [...index.matchAll(/\]\(([^)#]+\.md)\)/g)].map((match) => match[1]);
const guides = readdirSync(join(src, 'guides')).map((name) => `guides/${name}`);
const skillNames = readdirSync(skills, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const all = [index, ...guides.map((guide) => readFileSync(join(src, guide), 'utf8'))]
  .concat(skillNames.map((name) => readFileSync(join(skills, name, 'SKILL.md'), 'utf8')))
  .join('\n');

describe('LLM references', () => {
  test('every link in llms.md points at a file', () => {
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(existsSync(join(src, link!)), link).toBe(true);
  });

  test('every reference is linked from llms.md', () => {
    expect(guides.filter((guide) => !links.includes(guide))).toEqual([]);
  });

  test('every public export is mentioned', () => {
    const missing = Object.keys(forms).filter((name) => !new RegExp(`(^|[^\\w$])${name}([^\\w$]|$)`).test(all));
    expect(missing).toEqual([]);
  });
});

describe('skills', () => {
  test.each(skillNames)('%s has a SKILL.md with a name and description, listed in llms.md', (name) => {
    const skill = readFileSync(join(skills, name, 'SKILL.md'), 'utf8');
    expect(skill).toMatch(/^---\nname: slopkit-[a-z-]+\ndescription: .+\n---\n/);
    expect(index).toContain(`skills/${name}/SKILL.md`);
  });
});
