import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Checkbox } from './checkbox';

const click = (el: HTMLElement) => {
  fireEvent.click(el);
  flush();
};

describe('<Checkbox />', () => {
  test('a native checkbox with its label, in slots; class on the root', () => {
    const { getByRole, container } = render(() => <Checkbox label="Accept the terms" name="terms" class="mine" />);
    const input = getByRole('checkbox', { name: 'Accept the terms' });
    const root = container.firstElementChild!;

    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input).toHaveAttribute('name', 'terms');
    expect(input).toHaveAttribute('data-slot', 'checkbox-input');
    expect(input).not.toBeChecked();
    expect(root).toHaveClass('slp-checkbox', 'mine');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-color', 'primary');
    expect(root).toHaveAttribute('data-label-position', 'right');
    expect(root.querySelector('[data-slot="checkbox-icon"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('uncontrolled: a click toggles it and calls onChange; defaultChecked starts it checked', () => {
    const onChange = vi.fn();
    const { getAllByRole, container } = render(() => (
      <>
        <Checkbox label="One" onChange={onChange} />
        <Checkbox label="Two" defaultChecked />
      </>
    ));
    const [one, two] = getAllByRole('checkbox');

    expect(two).toBeChecked();
    click(one);
    expect(one).toBeChecked();
    expect(container.firstElementChild).toHaveAttribute('data-checked', '');
    expect(onChange).toHaveBeenLastCalledWith(true);
    click(one);
    expect(one).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  test('controlled: it follows checked, and a click the parent ignores is undone', () => {
    const [checked, setChecked] = createSignal(false);
    const onChange = vi.fn();
    const { getByRole } = render(() => <Checkbox label="Terms" checked={checked()} onChange={onChange} />);
    const input = getByRole('checkbox');

    click(input);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(input).not.toBeChecked();

    setChecked(true);
    flush();
    expect(input).toBeChecked();
  });

  test('indeterminate sets the property, marks the root and shows a dash', () => {
    const { getByRole, container } = render(() => <Checkbox label="Select all" indeterminate />);
    const input = getByRole('checkbox') as HTMLInputElement;

    expect(input.indeterminate).toBe(true);
    expect(input).toBePartiallyChecked();
    expect(container.firstElementChild).toHaveAttribute('data-indeterminate', '');
    expect(container.querySelector('[data-slot="checkbox-icon"] path')).toHaveAttribute('d', 'M6 12h12');
  });

  test('description and error describe it; error marks it invalid', () => {
    const { getByRole, container } = render(() => (
      <Checkbox label="Terms" description="Read them first." error="You have to accept this." />
    ));
    const input = getByRole('checkbox');

    expect(input).toHaveAccessibleDescription('Read them first. You have to accept this.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(container.firstElementChild).toHaveAttribute('data-invalid', '');
  });

  test('a click on the label toggles it; disabled does not toggle', () => {
    const { getByText, getAllByRole } = render(() => (
      <>
        <Checkbox label="Enabled" />
        <Checkbox label="Disabled" disabled />
      </>
    ));
    const [enabled, disabled] = getAllByRole('checkbox');

    click(getByText('Enabled'));
    click(getByText('Disabled'));

    expect(enabled).toBeChecked();
    expect(disabled).toBeDisabled();
    expect(disabled).not.toBeChecked();
  });

  test('a checked box submits its value, or "on" without one', () => {
    const { container } = render(() => (
      <form>
        <Checkbox label="Terms" name="terms" defaultChecked />
        <Checkbox label="News" name="news" value="weekly" defaultChecked />
      </form>
    ));
    const data = new FormData(container.querySelector('form')!);

    expect(data.get('terms')).toBe('on');
    expect(data.get('news')).toBe('weekly');
  });

  test('size, color and labelPosition', () => {
    const { container } = render(() => <Checkbox label="Big" size="xl" color="error" labelPosition="left" />);
    const root = container.firstElementChild!;

    expect(root).toHaveAttribute('data-size', 'xl');
    expect(root).toHaveAttribute('data-color', 'error');
    expect(root).toHaveAttribute('data-label-position', 'left');
  });

  test('toggling updates it without diagnostics or waste', async () => {
    const { getByRole } = render(() => <Checkbox label="Terms" />);
    flush();

    const { artifact } = await captureArtifact(() => click(getByRole('checkbox')), { scenario: 'checkbox-toggle' });

    expect(getByRole('checkbox')).toBeChecked();
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });
});

describe('<Checkbox.Group />', () => {
  test('a group named by its label, holding the checked values in order', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Checkbox.Group label="Toppings" description="Pick any." name="toppings" onChange={onChange}>
        <Checkbox value="cheese" label="Cheese" />
        <Checkbox value="olives" label="Olives" />
      </Checkbox.Group>
    ));
    const group = getByRole('group', { name: 'Toppings' });

    expect(group).toHaveAccessibleDescription('Pick any.');
    click(getByRole('checkbox', { name: 'Olives' }));
    click(getByRole('checkbox', { name: 'Cheese' }));
    expect(onChange).toHaveBeenLastCalledWith(['olives', 'cheese']);
    expect(getByRole('checkbox', { name: 'Cheese' })).toHaveAttribute('name', 'toppings');

    click(getByRole('checkbox', { name: 'Olives' }));
    expect(onChange).toHaveBeenLastCalledWith(['cheese']);
    expect(getByRole('checkbox', { name: 'Olives' })).not.toBeChecked();
  });

  test('controlled: the checkboxes follow value', () => {
    const [value, setValue] = createSignal<string[]>(['a']);
    const { getByRole } = render(() => (
      <Checkbox.Group label="Letters" value={value()} onChange={setValue}>
        <Checkbox value="a" label="A" />
        <Checkbox value="b" label="B" />
      </Checkbox.Group>
    ));

    expect(getByRole('checkbox', { name: 'A' })).toBeChecked();
    click(getByRole('checkbox', { name: 'B' }));
    expect(untrack(value)).toEqual(['a', 'b']);
    expect(getByRole('checkbox', { name: 'B' })).toBeChecked();
  });

  test('disabled, size and an error on the group', () => {
    const { getByRole, getAllByRole } = render(() => (
      <Checkbox.Group label="Letters" disabled size="lg" error="Pick one.">
        <Checkbox value="a" label="A" />
        <Checkbox value="b" label="B" />
      </Checkbox.Group>
    ));

    for (const box of getAllByRole('checkbox')) expect(box).toBeDisabled();
    expect(getByRole('checkbox', { name: 'A' }).closest('.slp-checkbox')).toHaveAttribute('data-size', 'lg');
    expect(getByRole('group')).toHaveAttribute('aria-invalid', 'true');
    expect(getByRole('group')).toHaveAccessibleDescription('Pick one.');
  });
});

describe('<Checkbox.Card />', () => {
  test('a label around a hidden checkbox, named by the content; a click anywhere toggles it', () => {
    const onChange = vi.fn();
    const { getByRole, getByText, container } = render(() => (
      <Checkbox.Card value="pro" onChange={onChange}>
        <strong>Pro</strong> Everything, and more.
      </Checkbox.Card>
    ));
    const input = getByRole('checkbox', { name: 'Pro Everything, and more.' });
    const card = container.firstElementChild!;

    expect(card.tagName).toBe('LABEL');
    expect(card).toHaveClass('slp-checkbox-card');
    click(getByText('Everything, and more.'));
    expect(input).toBeChecked();
    expect(card).toHaveAttribute('data-checked', '');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test('in a group, cards count like checkboxes', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Checkbox.Group label="Plans" onChange={onChange}>
        <Checkbox.Card value="free">Free</Checkbox.Card>
        <Checkbox.Card value="pro">Pro</Checkbox.Card>
      </Checkbox.Group>
    ));

    click(getByRole('checkbox', { name: 'Pro' }));
    expect(onChange).toHaveBeenCalledWith(['pro']);
  });
});

describe('Checkbox: accessibility and SSR', () => {
  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Checkbox label="Terms" />
        <Checkbox label="Newsletter" description="Once a month." defaultChecked />
        <Checkbox label="Select all" indeterminate />
        <Checkbox label="Required" error="You have to accept this." />
        <Checkbox aria-label="No label" disabled />
        <Checkbox.Group label="Toppings" description="Pick any." defaultValue={['cheese']}>
          <Checkbox value="cheese" label="Cheese" />
          <Checkbox value="olives" label="Olives" />
        </Checkbox.Group>
        <Checkbox.Card value="pro" defaultChecked>
          Pro
        </Checkbox.Card>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./checkbox.fixtures.tsx', 'checkboxes');
  });
});
