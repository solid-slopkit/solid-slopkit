import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Textarea } from './textarea';

describe('<Textarea />', () => {
  test('a labelled textarea in an Input box: wrapper props on the root, the rest on the textarea', () => {
    const { getByRole, container } = render(() => (
      <Textarea label="Notes" description="Optional." rows={4} placeholder="Anything else?" name="notes" class="mine" />
    ));
    const control = getByRole('textbox', { name: 'Notes' });

    expect(control.tagName).toBe('TEXTAREA');
    expect(control).toHaveAttribute('rows', '4');
    expect(control).toHaveAttribute('name', 'notes');
    expect(control).toHaveAccessibleDescription('Optional.');
    expect(control).not.toHaveAttribute('data-autosize');
    expect(container.firstElementChild).toHaveClass('slp-textarea', 'slp-input-wrapper', 'mine');
    expect(control.closest('.slp-input')).toHaveAttribute('data-multiline', '');
  });

  test('autosize marks the textarea and starts it at minRows; the bounds are not attributes', () => {
    const { getByRole } = render(() => <Textarea label="Message" autosize minRows={2} maxRows={5} />);
    const control = getByRole('textbox');

    expect(control).toHaveAttribute('data-autosize', '');
    expect(control).toHaveAttribute('rows', '2');
    expect(control).not.toHaveAttribute('minrows');
    expect(control).not.toHaveAttribute('autosize');
  });

  test('onInput still runs, and ref gets the textarea', () => {
    const onInput = vi.fn();
    let ref: HTMLElement | undefined;
    const { getByRole } = render(() => (
      <Textarea label="Message" autosize onInput={onInput} ref={(el: HTMLElement) => (ref = el)} />
    ));

    fireEvent.input(getByRole('textbox'), { target: { value: 'Hi' } });

    expect(onInput).toHaveBeenCalledTimes(1);
    expect(ref).toBe(getByRole('textbox'));
  });

  test('a new controlled value updates it without diagnostics or waste', async () => {
    const [value, setValue] = createSignal('One', { name: 'value' });
    const { getByRole } = render(() => <Textarea label="Message" autosize value={value()} />);
    flush();

    const { artifact } = await captureArtifact(() => setValue('One\nTwo'), { scenario: 'textarea-value' });

    expect((getByRole('textbox') as HTMLTextAreaElement).value).toBe('One\nTwo');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(3);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Textarea label="Notes" rows={4} />
        <Textarea label="Message" description="Up to five lines." autosize maxRows={5} />
        <Textarea label="Bio" error="Too long." variant="soft" />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./textarea.fixtures.tsx', 'textareas');
  });
});
