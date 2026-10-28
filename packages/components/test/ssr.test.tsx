import { describe, expect, test } from 'vitest';
import { expectHydration, renderAndHydrate } from './ssr';

const fixturesPath = './ssr.fixtures.tsx';

describe('SSR test helper', () => {
  test('components render on the server and hydrate cleanly', async () => {
    await expectHydration(fixturesPath, 'components');
  });

  test('reports a markup mismatch between server and client', async () => {
    const result = await renderAndHydrate(fixturesPath, 'mismatch');
    result.dispose();
    expect(result.clientMessages.join('\n')).toMatch(/hydration/i);
  });

  test('reports a Solid diagnostic printed during the server render', async () => {
    const result = await renderAndHydrate(fixturesPath, 'serverWrite');
    result.dispose();
    expect(result.serverMessages.join('\n')).toContain('[SERVER_WRITE]');
  });

  test('a fixture that halts Solid does not affect the next render', async () => {
    (await renderAndHydrate(fixturesPath, 'serverWrite')).dispose();
    await expectHydration(fixturesPath, 'components');
  });

  test('the hydrated tree is live', async () => {
    const result = await renderAndHydrate(fixturesPath, 'components');
    const active = () => [...result.container.querySelectorAll('[data-active]')].map((item) => item.textContent);
    expect(active()).toEqual(['List']);
    result.container.querySelectorAll<HTMLInputElement>('input[type="radio"]')[1].click();
    expect(active()).toEqual(['Grid']);
    result.dispose();
  });

  test('rejects an unknown fixture name', async () => {
    await expect(renderAndHydrate(fixturesPath, 'nope')).rejects.toThrow('No fixture named "nope"');
  });
});
