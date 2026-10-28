import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Center } from './center';

const rect = (el: Element) => {
  const { left, top, width } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width) };
};

describe('<Center /> in a browser', () => {
  test('centers its content horizontally and vertically', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Center data-testid="c" style={{ width: '200px', height: '100px' }}>
          <div data-testid="child" style={{ width: '40px', height: '20px' }} />
        </Center>
      </SlopkitUi>
    ));
    flush();
    const offset = () => {
      const center = rect(getByTestId('c'));
      const child = rect(getByTestId('child'));
      return { left: child.left - center.left, top: child.top - center.top };
    };

    await expect.poll(offset).toEqual({ left: 80, top: 40 });
  });

  test('inline sits in a line of text at its content width', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <p style={{ width: '400px' }}>
          <span data-testid="before">Before</span>
          <Center data-testid="c" inline>
            <span style={{ display: 'block', width: '20px', height: '10px' }} />
          </Center>
        </p>
      </SlopkitUi>
    ));
    flush();

    await expect.poll(() => getComputedStyle(getByTestId('c')).display).toBe('inline-flex');
    expect(rect(getByTestId('c')).width).toBe(20);
    expect(rect(getByTestId('c')).left).toBeGreaterThan(rect(getByTestId('before')).left);
  });
});
