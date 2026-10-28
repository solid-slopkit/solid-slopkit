import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { page } from 'vitest/browser';
import { afterEach, describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { SimpleGrid } from './simple-grid';

const rect = (el: Element) => {
  const { left, top, width } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width) };
};

describe('<SimpleGrid /> in a browser', () => {
  afterEach(() => page.viewport(414, 896));

  test('lays children out in equal columns, with spacing and verticalSpacing, and changes columns at a breakpoint', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <SimpleGrid cols={{ base: 2, md: 3 }} spacing={4} verticalSpacing={8} style={{ width: '416px' }}>
          <div data-testid="a" style={{ height: '20px' }} />
          <div data-testid="b" style={{ height: '20px' }} />
          <div data-testid="c" style={{ height: '20px' }} />
        </SimpleGrid>
      </SlopkitUi>
    ));
    flush();
    const a = () => rect(getByTestId('a'));
    const b = () => rect(getByTestId('b'));
    const c = () => rect(getByTestId('c'));

    await page.viewport(600, 800);
    // 2 columns: (416 - 16) / 2 = 200.
    await expect.poll(() => a().width).toBe(200);
    expect(b().left - a().left).toBe(200 + 16);
    expect(c().top - a().top).toBe(20 + 32);
    expect(c().left).toBe(a().left);

    await page.viewport(1000, 800);
    // 3 columns: (416 - 32) / 3 = 128.
    await expect.poll(() => a().width).toBe(128);
    expect(c().top).toBe(a().top);
    expect(c().left - a().left).toBe(2 * (128 + 16));
  });

  test('one column by default', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <SimpleGrid style={{ width: '300px' }}>
          <div data-testid="a" style={{ height: '20px' }} />
          <div data-testid="b" style={{ height: '20px' }} />
        </SimpleGrid>
      </SlopkitUi>
    ));
    flush();

    await expect.poll(() => rect(getByTestId('a')).width).toBe(300);
    expect(rect(getByTestId('b')).top - rect(getByTestId('a')).top).toBe(20 + 16);
  });
});
