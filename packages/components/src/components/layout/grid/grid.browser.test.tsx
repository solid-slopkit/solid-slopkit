import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { page } from 'vitest/browser';
import { afterEach, describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Grid } from './grid';

const rect = (el: Element) => {
  const { left, top, width } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width) };
};

// 12 columns in 472px with a 16px gutter: each column is (472 - 11 × 16) / 12 = 24.67px, so n columns span
// (472 + 16) × n / 12 - 16.
const spanWidth = (span: number, width = 472, gutter = 16, columns = 12) =>
  Math.round(((width + gutter) * span) / columns - gutter);

describe('<Grid /> in a browser', () => {
  afterEach(() => page.viewport(414, 896));

  test('columns span a share of the row, minus the gutters, and wrap when the row is full', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Grid style={{ width: '472px' }}>
          <Grid.Col data-testid="a" span={6} />
          <Grid.Col data-testid="b" span={6} />
          <Grid.Col data-testid="c" span={4} offset={2} />
        </Grid>
      </SlopkitUi>
    ));
    flush();
    const a = () => rect(getByTestId('a'));
    const b = () => rect(getByTestId('b'));
    const c = () => rect(getByTestId('c'));

    await expect.poll(() => a().width).toBe(spanWidth(6));
    expect(b().left - a().left).toBe(spanWidth(6) + 16);
    expect(c().top).toBeGreaterThan(a().top);
    expect(c().width).toBe(spanWidth(4));
    // An offset of 2 is 2 columns and their gutters.
    expect(c().left - a().left).toBe(spanWidth(2) + 16);
  });

  test('span changes at a breakpoint, and auto columns share what the others leave', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Grid gutter={0} style={{ width: '480px' }}>
          <Grid.Col data-testid="a" span={{ base: 12, md: 3 }} />
          <Grid.Col data-testid="b" span="auto" />
          <Grid.Col data-testid="c" span="auto" />
        </Grid>
      </SlopkitUi>
    ));
    flush();
    const width = (id: string) => rect(getByTestId(id)).width;

    await page.viewport(600, 800);
    await expect.poll(() => width('a')).toBe(480);

    await page.viewport(1000, 800);
    await expect.poll(() => width('a')).toBe(120);
    expect(width('b')).toBe(180);
    expect(width('c')).toBe(180);
  });

  test('grow fills a row that is not full', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Grid gutter={0} style={{ width: '480px' }}>
          <Grid.Col data-testid="still" span={4} />
        </Grid>
        <Grid grow gutter={0} style={{ width: '480px' }}>
          <Grid.Col data-testid="grown" span={4} />
        </Grid>
      </SlopkitUi>
    ));
    flush();

    await expect.poll(() => rect(getByTestId('still')).width).toBe(160);
    expect(rect(getByTestId('grown')).width).toBe(480);
  });
});
