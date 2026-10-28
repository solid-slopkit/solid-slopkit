import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Container } from './container';

const rect = (el: Element) => {
  const { left, width } = el.getBoundingClientRect();
  return { left: Math.round(left), width: Math.round(width) };
};

describe('<Container /> in a browser', () => {
  test('is centered at its size, padding included, with inline padding of 4', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <div data-testid="parent" style={{ width: '1000px' }}>
          <Container data-testid="c" size="30rem" />
        </div>
      </SlopkitUi>
    ));
    flush();
    const parent = rect(getByTestId('parent'));
    const container = getByTestId('c');

    await expect.poll(() => rect(container).width).toBe(480);
    expect(rect(container).left - parent.left).toBe(260);
    expect(getComputedStyle(container).paddingLeft).toBe('16px');
    expect(getComputedStyle(container).paddingRight).toBe('16px');
  });

  test('a preset reads its size variable, and fluid fills the parent', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <div style={{ width: '2000px' }}>
          <Container data-testid="md" />
          <Container data-testid="fluid" fluid />
        </div>
      </SlopkitUi>
    ));
    flush();

    await expect.poll(() => rect(getByTestId('md')).width).toBe(960);
    expect(rect(getByTestId('fluid')).width).toBe(2000);
  });

  test('fills a flex parent up to its size, and --slp-container-padding changes the padding', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <div style={{ display: 'flex', width: '600px', '--slp-container-padding': '0px' }}>
          <Container data-testid="c" size="sm" />
        </div>
      </SlopkitUi>
    ));
    flush();
    const container = getByTestId('c');

    await expect.poll(() => rect(container).width).toBe(600);
    expect(getComputedStyle(container).paddingLeft).toBe('0px');
  });
});
