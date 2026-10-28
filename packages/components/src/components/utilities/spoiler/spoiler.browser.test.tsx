import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Spoiler, type SpoilerProps } from './spoiler';

function setup(props: Partial<SpoilerProps> = {}, initialHeight = 300) {
  const [contentHeight, setContentHeight] = createSignal(initialHeight);
  const result = render(() => (
    <Spoiler data-testid="spoiler" {...props}>
      <a href="#top">Above the fold</a>
      <div style={{ height: `${contentHeight()}px` }} />
      <a href="#bottom">Below the fold</a>
    </Spoiler>
  ));
  const spoiler = () => result.getByTestId('spoiler');
  const content = () => spoiler().querySelector('[data-slot="spoiler-content"]') as HTMLElement;
  const control = () => spoiler().querySelector('[data-slot="spoiler-control"]') as HTMLButtonElement;
  const height = () => content().getBoundingClientRect().height;
  return { ...result, spoiler, content, control, height, setContentHeight };
}

const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

describe('<Spoiler /> in a browser', () => {
  test('cuts the content to maxHeight, fades its bottom, and shows the control as a link', async () => {
    const { content, control, height } = setup({ maxHeight: 80 });
    await settle();

    expect(height()).toBe(80);
    expect(getComputedStyle(content()).maskImage).toContain('linear-gradient');
    expect(control()).toBeVisible();
    const look = getComputedStyle(control());
    expect([look.borderTopWidth, look.backgroundColor, look.paddingTop]).toEqual(['0px', 'rgba(0, 0, 0, 0)', '0px']);
  });

  test('expands to the full height of its content, and collapses back', async () => {
    const { content, control, height } = setup({ maxHeight: 80 });
    await settle();
    const full = (content().firstElementChild as HTMLElement).offsetHeight;

    await userEvent.click(control());
    await expect.poll(height).toBe(full);
    expect(getComputedStyle(content()).maskImage).toBe('none');

    await userEvent.click(control());
    await expect.poll(height).toBe(80);
  });

  test('content that fits is not cut, and has no control', async () => {
    const { content, control, height } = setup({ maxHeight: 200 }, 20);
    await settle();

    expect(height()).toBe((content().firstElementChild as HTMLElement).offsetHeight);
    expect(getComputedStyle(content()).maskImage).toBe('none');
    expect(control()).not.toBeVisible();
  });

  test('the control appears when the content grows past maxHeight', async () => {
    const { spoiler, control, setContentHeight } = setup({ maxHeight: 200 }, 20);
    await settle();
    expect(control()).not.toBeVisible();

    setContentHeight(400);
    flush();
    await expect.poll(() => spoiler().hasAttribute('data-overflowing')).toBe(true);
    expect(control()).toBeVisible();
  });

  test('focus on content below the fold expands it; above the fold it does not', async () => {
    const onChange: boolean[] = [];
    const { spoiler, getByText } = setup({ maxHeight: 80, onChange: (expanded) => onChange.push(expanded) });
    await settle();

    getByText('Above the fold').focus();
    expect(spoiler()).not.toHaveAttribute('data-expanded');

    await userEvent.tab();
    expect(getByText('Below the fold')).toHaveFocus();
    expect(spoiler()).toHaveAttribute('data-expanded', '');
    expect(onChange).toEqual([true]);
  });

  test('the control is reached with Tab and pressed with Enter and Space', async () => {
    const { spoiler, control, getByText } = setup({ maxHeight: 80, defaultExpanded: true });
    await settle();

    getByText('Below the fold').focus();
    await userEvent.tab();
    expect(control()).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(spoiler()).not.toHaveAttribute('data-expanded');
    await userEvent.keyboard(' ');
    expect(spoiler()).toHaveAttribute('data-expanded', '');
  });
});
