import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Chip } from './chip';

const click = (el: HTMLElement) => {
  fireEvent.click(el);
  flush();
};

describe('<Chip />', () => {
  test('alone: a label around a hidden checkbox, named by its text; a click toggles it and shows a check', () => {
    const onChange = vi.fn();
    const { getByRole, container } = render(() => (
      <Chip onChange={onChange} class="mine">
        Vegan
      </Chip>
    ));
    const input = getByRole('checkbox', { name: 'Vegan' });
    const chip = container.firstElementChild!;

    expect(chip.tagName).toBe('LABEL');
    expect(chip).toHaveClass('slp-chip', 'mine');
    expect(chip).toHaveAttribute('data-variant', 'soft');
    expect(chip.querySelector('[data-slot="chip-icon"]')).toHaveAttribute('aria-hidden', 'true');

    click(input);
    expect(input).toBeChecked();
    expect(chip).toHaveAttribute('data-checked', '');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test('variant, color, size and disabled', () => {
    const { container, getByRole } = render(() => (
      <Chip variant="filled" color="error" size="lg" disabled>
        Off
      </Chip>
    ));
    const chip = container.firstElementChild!;

    expect(chip).toHaveAttribute('data-variant', 'filled');
    expect(chip).toHaveAttribute('data-color', 'error');
    expect(chip).toHaveAttribute('data-size', 'lg');
    expect(chip).toHaveAttribute('data-disabled', '');
    expect(getByRole('checkbox')).toBeDisabled();
  });
});

describe('<Chip.Group />', () => {
  test('single choice: radios in a radiogroup; choosing one unchooses the other', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Chip.Group label="Size" defaultValue="m" onChange={onChange}>
        <Chip value="s">Small</Chip>
        <Chip value="m">Medium</Chip>
      </Chip.Group>
    ));

    expect(getByRole('radiogroup', { name: 'Size' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Medium' })).toBeChecked();
    click(getByRole('radio', { name: 'Small' }));
    expect(getByRole('radio', { name: 'Small' })).toBeChecked();
    expect(getByRole('radio', { name: 'Medium' })).not.toBeChecked();
    expect(onChange).toHaveBeenCalledWith('s');
  });

  test('multiple: checkboxes in a group, holding the values that are on', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Chip.Group multiple aria-label="Tags" defaultValue={['solid']} onChange={onChange}>
        <Chip value="solid">Solid</Chip>
        <Chip value="css">CSS</Chip>
      </Chip.Group>
    ));

    expect(getByRole('group', { name: 'Tags' })).toBeInTheDocument();
    click(getByRole('checkbox', { name: 'CSS' }));
    expect(onChange).toHaveBeenLastCalledWith(['solid', 'css']);
    click(getByRole('checkbox', { name: 'Solid' }));
    expect(onChange).toHaveBeenLastCalledWith(['css']);
  });

  test('controlled single: a choice the parent ignores is undone on every chip', () => {
    const [value, setValue] = createSignal<string | undefined>('a');
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Chip.Group aria-label="Letters" value={value()} onChange={onChange}>
        <Chip value="a">A</Chip>
        <Chip value="b">B</Chip>
      </Chip.Group>
    ));

    click(getByRole('radio', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(getByRole('radio', { name: 'A' })).toBeChecked();
    expect(getByRole('radio', { name: 'B' })).not.toBeChecked();

    setValue('b');
    flush();
    expect(getByRole('radio', { name: 'B' })).toBeChecked();
    expect(untrack(value)).toBe('b');
  });

  test('onChange is typed by multiple', () => {
    render(() => (
      <>
        <Chip.Group aria-label="One" onChange={(value) => expectTypeOf(value).toEqualTypeOf<string>()}>
          <Chip value="a">A</Chip>
        </Chip.Group>
        <Chip.Group multiple aria-label="Many" onChange={(value) => expectTypeOf(value).toEqualTypeOf<string[]>()}>
          <Chip value="a">A</Chip>
        </Chip.Group>
      </>
    ));
  });

  test('size and disabled from the group', () => {
    const { getAllByRole } = render(() => (
      <Chip.Group aria-label="Letters" size="xs" disabled>
        <Chip value="a">A</Chip>
        <Chip value="b">B</Chip>
      </Chip.Group>
    ));

    for (const radio of getAllByRole('radio')) {
      expect(radio).toBeDisabled();
      expect(radio.closest('.slp-chip')).toHaveAttribute('data-size', 'xs');
    }
  });

  test('choosing updates the chips without diagnostics or waste', async () => {
    const { getByRole } = render(() => (
      <Chip.Group aria-label="Letters" defaultValue="a">
        <Chip value="a">A</Chip>
        <Chip value="b">B</Chip>
        <Chip value="c">C</Chip>
      </Chip.Group>
    ));
    flush();

    const { artifact } = await captureArtifact(() => click(getByRole('radio', { name: 'C' })), { scenario: 'chip-choose' });

    expect(getByRole('radio', { name: 'C' })).toBeChecked();
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(6);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Chip>Alone</Chip>
        <Chip.Group label="Size" defaultValue="m">
          <Chip value="s">Small</Chip>
          <Chip value="m" variant="filled">
            Medium
          </Chip>
        </Chip.Group>
        <Chip.Group multiple aria-label="Tags" defaultValue={['solid']}>
          <Chip value="solid" variant="outline">
            Solid
          </Chip>
          <Chip value="css" disabled>
            CSS
          </Chip>
        </Chip.Group>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./chip.fixtures.tsx', 'chips');
  });
});
