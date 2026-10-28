import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Pill } from '../pill';
import { PillsInput, type PillsInputProps } from './pills-input';

function setup(props: Partial<PillsInputProps> = {}) {
  const result = render(() => (
    <PillsInput label="Tags" data-testid="box" {...props}>
      <Pill withRemoveButton>Design</Pill>
      <Pill>Research</Pill>
      <PillsInput.Field placeholder="Add a tag" />
    </PillsInput>
  ));
  return {
    ...result,
    box: () => result.getByTestId('box'),
    field: () => result.getByRole('textbox', { name: 'Tags' }) as HTMLInputElement,
    pill: (text: string) => result.getByText(text).parentElement!,
  };
}

describe('<PillsInput />', () => {
  test('a labelled field: the wrapper, an Input box, the pills and the field', () => {
    const { box, field, pill, container } = setup({ class: 'mine' });

    expect(container.querySelector('.slp-pills-input')).toHaveClass('mine');
    expect(box()).toHaveClass('slp-input');
    expect(box()).toHaveAttribute('data-slot', 'pills-input-box');
    expect(box()).toHaveAttribute('data-variant', 'outline');
    expect(box()).toHaveAttribute('data-size', 'md');
    expect(field()).toHaveClass('slp-pills-input-field');
    expect(field()).toHaveAttribute('data-slot', 'pills-input-field');
    expect(field().parentElement).toHaveAttribute('data-slot', 'pills-input-content');
    expect(pill('Design').parentElement).toBe(field().parentElement);
  });

  test('the pills take its size, and its disabled state', () => {
    const { pill, field, box, getByRole } = setup({ size: 'lg', disabled: true });

    expect(box()).toHaveAttribute('data-size', 'lg');
    expect(box()).toHaveAttribute('data-disabled', '');
    expect(pill('Design')).toHaveAttribute('data-size', 'lg');
    expect(pill('Research')).toHaveAttribute('data-disabled', '');
    expect(field()).toBeDisabled();
    expect(getByRole('button', { name: 'Remove Design' })).toBeDisabled();
  });

  test('the description and error describe the field, and mark it invalid; required goes to it', () => {
    const { field, box, getByText } = setup({ description: 'Up to five', error: 'Too many', required: true });

    expect(field()).toHaveAccessibleDescription(/Up to five/);
    expect(field()).toHaveAccessibleDescription(/Too many/);
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toBeRequired();
    expect(box()).toHaveAttribute('data-invalid', '');
    expect(getByText('Too many')).toBeDefined();
  });

  test('variant and sections render like an Input', () => {
    const { box, getByText } = setup({ variant: 'soft', leftSection: <span>#</span>, rightSection: <span>!</span> });

    expect(box()).toHaveAttribute('data-variant', 'soft');
    expect(box()).toHaveAttribute('data-with-left-section', '');
    expect(getByText('#').parentElement).toHaveAttribute('data-slot', 'input-left-section');
    expect(getByText('!').parentElement).toHaveAttribute('data-slot', 'input-right-section');
  });

  test('a press on the box focuses the field; a press on a remove button does not', () => {
    const { box, field, getByRole } = setup();

    const pressBox = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    box().dispatchEvent(pressBox);
    expect(pressBox.defaultPrevented).toBe(true);
    expect(field()).toHaveFocus();

    field().blur();
    const pressButton = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    getByRole('button', { name: 'Remove Design' }).dispatchEvent(pressButton);
    expect(pressButton.defaultPrevented).toBe(false);
    expect(field()).not.toHaveFocus();
  });

  test("the field passes other props to its input, and takes the PillsInput's id", () => {
    let ref: HTMLInputElement | undefined;
    const { getByRole } = render(() => (
      <PillsInput label="Tags" id="mine">
        <PillsInput.Field ref={(el) => (ref = el)} name="tag" class="extra" />
      </PillsInput>
    ));
    const field = getByRole('textbox', { name: 'Tags' });

    expect(ref).toBe(field);
    expect(field).toHaveAttribute('id', 'mine');
    expect(field).toHaveAttribute('name', 'tag');
    expect(field).toHaveClass('extra');
  });

  test('the field throws outside a PillsInput', () => {
    expect(() => render(() => <PillsInput.Field />)).toThrow(/inside <PillsInput>/);
  });

  test('has no axe violations, plain, with an error and disabled', async () => {
    const { container } = render(() => (
      <>
        <PillsInput label="One">
          <Pill withRemoveButton>A</Pill>
          <PillsInput.Field />
        </PillsInput>
        <PillsInput label="Two" error="Wrong">
          <PillsInput.Field />
        </PillsInput>
        <PillsInput label="Three" disabled>
          <Pill withRemoveButton>B</Pill>
          <PillsInput.Field />
        </PillsInput>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('adding and removing pills has no diagnostics or waste', async () => {
    const [tags, setTags] = createSignal(['A', 'B']);
    const { getByRole } = render(() => (
      <PillsInput label="Tags">
        <For each={tags()}>
          {(tag) => (
            <Pill withRemoveButton onRemove={() => setTags((list) => list.filter((other) => other !== tag))}>
              {tag}
            </Pill>
          )}
        </For>
        <PillsInput.Field />
      </PillsInput>
    ));

    const { artifact } = await captureArtifact(
      () => {
        setTags((list) => [...list, 'C']);
        flush();
        fireEvent.click(getByRole('button', { name: 'Remove A' }));
        flush();
      },
      { scenario: 'pills-input-edit' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./pills-input.fixtures.tsx', 'pillsInputs');
  });
});
