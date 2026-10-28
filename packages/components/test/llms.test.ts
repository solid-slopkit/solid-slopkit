// The LLM references and skills are handwritten (ADR 0012). This keeps the index and the files in step: every
// link in src/llms.md resolves, every component folder has its reference, and every skill is listed.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const src = join(dirname(fileURLToPath(import.meta.url)), '../src');
const index = readFileSync(join(src, 'llms.md'), 'utf8');
const links = [...index.matchAll(/\]\(([^)#]+\.md)\)/g)].map((match) => match[1]);

// Folders under a component group (layout, button, inputs, provider) that hold a component: they have an
// index.ts. The provider's reference is named after the component, not the folder.
const groups = ['layout', 'button', 'inputs', 'overlays', 'utilities'];
const componentDirs = groups.flatMap((group) =>
  readdirSync(join(src, 'components', group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(src, 'components', group, entry.name, 'index.ts')))
    .map((entry) => join('components', group, entry.name)),
);

describe('LLM references', () => {
  test('every link in llms.md points at a file', () => {
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(existsSync(join(src, link)), link).toBe(true);
  });

  test.each(componentDirs)('%s has a reference, linked from llms.md', (dir) => {
    const reference = join(dir, `${dir.split('/').at(-1)}.md`);
    expect(existsSync(join(src, reference)), reference).toBe(true);
    expect(links).toContain(relative(src, join(src, reference)));
  });

  test('every entry in llms.md says what it is, after its link', () => {
    const bare = index.split('\n').filter((line) => /^- \[[^\]]+\]\([^)]+\)$/.test(line));
    expect(bare).toEqual([]);
  });

  test('the provider has a reference, linked from llms.md', () => {
    expect(links).toContain('components/provider/slopkit-ui.md');
  });

  test('the carousel entry has a reference, linked from llms.md', () => {
    expect(links).toContain('carousel/carousel.md');
  });

  test('the dates entry has a reference, linked from llms.md', () => {
    expect(links).toContain('dates/dates.md');
    expect(links).toContain('dates/calendar/calendar.md');
    expect(links).toContain('dates/mini-calendar/mini-calendar.md');
    expect(links).toContain('dates/date-picker/date-picker.md');
    expect(links).toContain('dates/month-picker/month-picker.md');
    expect(links).toContain('dates/year-picker/year-picker.md');
    expect(links).toContain('dates/date-picker-input/date-picker-input.md');
    expect(links).toContain('dates/month-picker-input/month-picker-input.md');
    expect(links).toContain('dates/year-picker-input/year-picker-input.md');
    expect(links).toContain('dates/date-input/date-input.md');
    expect(links).toContain('dates/time-input/time-input.md');
    expect(links).toContain('dates/time-picker/time-picker.md');
    expect(links).toContain('dates/time-grid/time-grid.md');
    expect(links).toContain('dates/date-time-picker/date-time-picker.md');
  });

  test('the primitives entry has a reference, linked from llms.md', () => {
    expect(links).toContain('primitives/primitives.md');
  });
});

const skills = join(src, '../skills');
const skillNames = readdirSync(skills, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe('skills', () => {
  test.each(skillNames)('%s has a SKILL.md with a name and description, listed in llms.md', (name) => {
    const skill = readFileSync(join(skills, name, 'SKILL.md'), 'utf8');
    expect(skill).toMatch(/^---\nname: slopkit-[a-z-]+\ndescription: .+\n---\n/);
    expect(index).toContain(`skills/${name}/SKILL.md`);
  });
});
