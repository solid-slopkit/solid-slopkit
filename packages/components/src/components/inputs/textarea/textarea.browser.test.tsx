import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { createSignal } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { Textarea } from './textarea';

const height = (el: Element) => el.getBoundingClientRect().height;
const lineHeight = (el: Element) => parseFloat(getComputedStyle(el).lineHeight);

describe('<Textarea /> in a browser', () => {
  test('autosize grows a line at a time as lines are typed, and shrinks back', async () => {
    const { getByRole } = render(() => <Textarea label="Message" autosize style={{ width: '300px' }} />);
    const control = getByRole('textbox');
    const one = height(control);

    await userEvent.click(control);
    await userEvent.keyboard('a{Enter}b{Enter}c');
    expect(height(control)).toBeCloseTo(one + 2 * lineHeight(control), 0);

    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}');
    expect(height(control)).toBeCloseTo(one, 0);
    expect(getComputedStyle(control).overflowY).toBe('hidden');
  });

  test('minRows is the smallest it gets; past maxRows it scrolls', async () => {
    const { getByRole } = render(() => <Textarea label="Message" autosize minRows={2} maxRows={3} style={{ width: '300px' }} />);
    const control = getByRole('textbox');
    const two = height(control);

    await userEvent.click(control);
    await userEvent.keyboard('1{Enter}2{Enter}3{Enter}4{Enter}5');

    expect(height(control)).toBeCloseTo(two + lineHeight(control), 0);
    expect(getComputedStyle(control).overflowY).toBe('auto');
  });

  test('a long line wraps and grows it; a wider field rewraps and shrinks it', async () => {
    const [width, setWidth] = createSignal('200px');
    const { getByRole } = render(() => (
      <Textarea label="Message" autosize value={'word '.repeat(30)} style={{ width: width() }} />
    ));
    const control = getByRole('textbox');
    const narrow = height(control);

    expect(narrow).toBeGreaterThan(3 * lineHeight(control));

    setWidth('600px');
    await expect.poll(() => height(control)).toBeLessThan(narrow);
  });

  test('a new controlled value resizes it', async () => {
    const [value, setValue] = createSignal('');
    const { getByRole } = render(() => <Textarea label="Message" autosize value={value()} style={{ width: '300px' }} />);
    const control = getByRole('textbox');
    const empty = height(control);

    setValue('1\n2\n3\n4');

    await expect.poll(() => height(control)).toBeCloseTo(empty + 3 * lineHeight(control), 0);
  });

  test('without autosize, rows sets the height and the user can resize it vertically', () => {
    const { getByRole } = render(() => <Textarea label="Notes" rows={4} />);
    const control = getByRole('textbox');

    expect(getComputedStyle(control).resize).toBe('vertical');
    expect(height(control)).toBeGreaterThan(4 * lineHeight(control));
  });
});
