import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Spoiler, type SpoilerProps } from './spoiler';

// jsdom lays nothing out: the content's body is given a height, 300px unless a test changes it.
let bodyHeight = 300;
const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!;

function setup(props: Partial<SpoilerProps> = {}) {
  const result = render(() => (
    <Spoiler data-testid="spoiler" {...props}>
      <p>Content</p>
    </Spoiler>
  ));
  flush();
  const spoiler = () => result.getByTestId('spoiler');
  return {
    ...result,
    spoiler,
    content: () => spoiler().querySelector('[data-slot="spoiler-content"]') as HTMLElement,
    control: () => spoiler().querySelector('[data-slot="spoiler-control"]') as HTMLButtonElement,
  };
}

describe('<Spoiler />', () => {
  beforeEach(() => {
    bodyHeight = 300;
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return this.dataset.slot === 'spoiler-body' ? bodyHeight : 0;
      },
    });
  });
  afterEach(() => Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight));

  test('renders the content and a control under it, collapsed', () => {
    const { spoiler, content, control, getByText } = setup({ class: 'mine' });

    expect(spoiler().tagName).toBe('DIV');
    expect(spoiler()).toHaveClass('slp-spoiler', 'mine');
    expect(spoiler()).not.toHaveAttribute('data-expanded');
    expect(spoiler()).toHaveAttribute('data-overflowing', '');
    expect(getByText('Content').parentElement).toHaveAttribute('data-slot', 'spoiler-body');
    expect(getByText('Content').parentElement?.parentElement).toBe(content());
    expect(control().tagName).toBe('BUTTON');
    expect(control()).toHaveAttribute('type', 'button');
    expect(control()).toHaveClass('slp-anchor');
    expect(control()).toHaveTextContent('Show more');
  });

  test('the control controls the content: aria-expanded and aria-controls', () => {
    const { content, control } = setup();

    expect(control()).toHaveAttribute('aria-expanded', 'false');
    expect(content().id).not.toBe('');
    expect(control()).toHaveAttribute('aria-controls', content().id);
  });

  test('maxHeight sets the collapsed height; the measured height is the expanded one', () => {
    const { spoiler, content } = setup({ maxHeight: 60, style: { color: 'red' } });

    expect(spoiler().style.getPropertyValue('--_spoiler-max')).toBe('60px');
    expect(spoiler().style.color).toBe('red');
    expect(content().style.getPropertyValue('--_spoiler-full')).toBe('300px');
  });

  test('pressing the control expands and collapses it, uncontrolled', () => {
    const onChange = vi.fn();
    const { spoiler, control } = setup({ onChange });

    fireEvent.click(control());
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(spoiler()).toHaveAttribute('data-expanded', '');
    expect(control()).toHaveAttribute('aria-expanded', 'true');
    expect(control()).toHaveTextContent('Show less');

    fireEvent.click(control());
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(spoiler()).not.toHaveAttribute('data-expanded');
    expect(control()).toHaveTextContent('Show more');
  });

  test('defaultExpanded starts it expanded; the labels can be changed', () => {
    const { control } = setup({ defaultExpanded: true, showLabel: 'More', hideLabel: 'Less' });

    expect(control()).toHaveAttribute('aria-expanded', 'true');
    expect(control()).toHaveTextContent('Less');
    fireEvent.click(control());
    expect(control()).toHaveTextContent('More');
  });

  test('controlled: follows expanded, and only asks to change it', () => {
    const [expanded, setExpanded] = createSignal(false);
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Spoiler expanded={expanded()} onChange={onChange}>
        <p>Content</p>
      </Spoiler>
    ));
    const control = getByRole('button', { name: 'Show more' });

    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(control).toHaveAttribute('aria-expanded', 'false');

    setExpanded(true);
    flush();
    expect(control).toHaveAttribute('aria-expanded', 'true');
  });

  test('content that fits has no control and is not cut', () => {
    bodyHeight = 80;
    const { spoiler } = setup();

    expect(spoiler()).not.toHaveAttribute('data-overflowing');
  });

  test('has no axe violations, collapsed and expanded', async () => {
    const { container } = render(() => (
      <>
        <Spoiler>
          <p>Collapsed</p>
        </Spoiler>
        <Spoiler defaultExpanded>
          <p>Expanded</p>
        </Spoiler>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('expanding and collapsing has no diagnostics or waste', async () => {
    const { control } = setup();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.click(control());
        fireEvent.click(control());
      },
      { scenario: 'spoiler-toggle' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./spoiler.fixtures.tsx', 'spoilers');
  });
});
