import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Space } from './space';

const rect = (el: Element) => {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) };
};

describe('<Space /> in a browser', () => {
  test('h separates blocks by its height', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <div data-testid="above" style={{ height: '10px' }} />
        <Space h={8} />
        <div data-testid="below" style={{ height: '10px' }} />
      </SlopkitUi>
    ));
    flush();

    await expect.poll(() => rect(getByTestId('below')).top - rect(getByTestId('above')).top).toBe(10 + 32);
  });

  test('w keeps its width in a full flex row', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <div style={{ display: 'flex', width: '100px' }}>
          <div style={{ width: '100px' }} />
          <Space data-testid="s" w={4} />
          <div style={{ width: '100px' }} />
        </div>
      </SlopkitUi>
    ));
    flush();

    await expect.poll(() => rect(getByTestId('s')).width).toBe(16);
  });
});
