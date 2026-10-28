import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { Collapse } from './collapse';

function setup(defaultOpened = false) {
  const [lines, setLines] = createSignal(3);
  const result = render(() => (
    <Collapse defaultOpened={defaultOpened}>
      <Collapse.Title>Shipping</Collapse.Title>
      <Collapse.Content data-testid="content">
        <div style={{ height: `${lines() * 20}px` }}>Content</div>
        <button>Inside</button>
      </Collapse.Content>
    </Collapse>
  ));
  const content = result.getByTestId('content');
  const title = result.getByRole('button', { name: 'Shipping' });
  const height = () => Math.round(content.getBoundingClientRect().height);
  return { ...result, content, title, height, setLines };
}

/** Waits for the content's transitions, and its body's, to finish. */
const settled = (content: HTMLElement) =>
  expect.poll(() => content.getAnimations({ subtree: true }).length, { timeout: 3000 }).toBe(0);

describe('<Collapse /> in a browser', () => {
  test('closed, the content takes no room and is out of the tab order', () => {
    const { height, getByText } = setup();

    expect(height()).toBe(0);
    getByText('Inside').focus();
    expect(getByText('Inside')).not.toHaveFocus();
  });

  test('opening grows the content to its height, then follows it', async () => {
    const { title, content, height, setLines, getByText } = setup();

    title.click();
    flush();
    // Partway, rather than straight to the full height.
    await expect.poll(() => height() > 0 && height() < 60).toBe(true);
    await settled(content);
    // The block, the button and the bottom padding.
    const opened = height();
    expect(opened).toBeGreaterThan(60);

    getByText('Inside').focus();
    expect(getByText('Inside')).toHaveFocus();

    setLines(5);
    flush();
    expect(height()).toBe(opened + 40);
  });

  test('closing shrinks it back to zero, then hides it', async () => {
    const { title, content, height, getByText } = setup(true);
    expect(getComputedStyle(content).visibility).toBe('visible');

    title.click();
    flush();
    await expect.poll(() => height() > 0).toBe(true);
    // Still shown while it shrinks.
    expect(getComputedStyle(content).visibility).toBe('visible');

    await expect.poll(() => height(), { timeout: 3000 }).toBe(0);
    await expect.poll(() => getComputedStyle(content).visibility, { timeout: 3000 }).toBe('hidden');
    getByText('Inside').focus();
    expect(getByText('Inside')).not.toHaveFocus();
  });

  test('the title is a full-width button with the indicator at its end', () => {
    const { getByRole } = render(() => (
      <div style={{ width: '300px' }}>
        <Collapse icon="arrow">
          <Collapse.Title>Shipping</Collapse.Title>
          <Collapse.Content>Content</Collapse.Content>
        </Collapse>
      </div>
    ));
    const title = getByRole('button', { name: 'Shipping' });

    expect(Math.round(title.getBoundingClientRect().width)).toBe(300);
    expect(getComputedStyle(title, '::after').width).toBe('8px');
  });
});
