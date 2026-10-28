import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Box } from '../box';
import { Stack } from './stack';

const rect = (el: Element) => {
  const { left, top, width } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width) };
};

describe('<Stack /> in a browser', () => {
  test('stacks children vertically, a gap of 4 apart, stretched to its width', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Stack data-testid="stack" style={{ width: '200px' }}>
          <Box data-testid="a" h={10} />
          <Box data-testid="b" h={10} />
        </Stack>
      </SlopkitUi>
    ));
    flush();
    const a = () => rect(getByTestId('a'));
    const b = () => rect(getByTestId('b'));

    await expect.poll(() => b().top - a().top).toBe(40 + 16);
    expect(b().left).toBe(a().left);
    expect(a().width).toBe(200);
  });

  test('align="center" centers children at their own width', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Stack data-testid="stack" align="center" gap={2} style={{ width: '200px' }}>
          <Box data-testid="a" w={10} h={10} />
        </Stack>
      </SlopkitUi>
    ));
    flush();
    const offset = () => {
      const stack = rect(getByTestId('stack'));
      const a = rect(getByTestId('a'));
      return { left: a.left - stack.left, top: a.top - stack.top, width: a.width };
    };

    await expect.poll(offset).toEqual({ left: 80, top: 0, width: 40 });
  });
});
