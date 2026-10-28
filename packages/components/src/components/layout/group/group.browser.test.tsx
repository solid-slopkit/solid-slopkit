import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Box } from '../box';
import { Group } from './group';

const rect = (el: Element) => {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) };
};

describe('<Group /> in a browser', () => {
  test('lays children out in a row, a gap of 4 apart, centered vertically, and wraps', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Group data-testid="group" style={{ width: '200px' }}>
          <Box data-testid="a" w={20} h={10} />
          <Box data-testid="b" w={20} h={20} />
          <Box data-testid="c" w={20} h={10} />
        </Group>
      </SlopkitUi>
    ));
    flush();
    const a = () => rect(getByTestId('a'));
    const b = () => rect(getByTestId('b'));
    const c = () => rect(getByTestId('c'));

    await expect.poll(() => b().left - a().left).toBe(80 + 16);
    expect(a().top - b().top).toBe(20);
    // 3 × 80px and 2 gaps don't fit in 200px.
    expect(c().left).toBe(a().left);
    expect(c().top).toBe(b().top + b().height + 16);
  });

  test('grow shares the row equally, unless preventGrowOverflow is false', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Group grow gap={0} style={{ width: '300px' }}>
          <span data-testid="short">a</span>
          <span data-testid="long">a much longer label</span>
        </Group>
        <Group grow preventGrowOverflow={false} gap={0} style={{ width: '300px' }}>
          <span data-testid="short2">a</span>
          <span data-testid="long2">a much longer label</span>
        </Group>
      </SlopkitUi>
    ));
    flush();

    await expect.poll(() => rect(getByTestId('short')).width).toBe(150);
    expect(rect(getByTestId('long')).width).toBe(150);
    expect(rect(getByTestId('long2')).width).toBeGreaterThan(rect(getByTestId('short2')).width);
    expect(rect(getByTestId('short2')).width + rect(getByTestId('long2')).width).toBe(300);
  });
});
