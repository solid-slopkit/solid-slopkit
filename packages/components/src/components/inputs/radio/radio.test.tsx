import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Radio } from './radio';

const click = (el: HTMLElement) => {
  fireEvent.click(el);
  flush();
};

describe('<Radio.Group />', () => {
  test('a radiogroup named by its label; the radios share a name and are labelled', () => {
    const { getByRole, getAllByRole, container } = render(() => (
      <Radio.Group label="Plan" description="Change it any time." class="mine">
        <Radio value="monthly" label="Monthly" />
        <Radio value="yearly" label="Yearly" />
      </Radio.Group>
    ));
    const group = getByRole('radiogroup', { name: 'Plan' });
    const [monthly, yearly] = getAllByRole('radio');

    expect(group).toHaveAccessibleDescription('Change it any time.');
    expect(container.firstElementChild).toHaveClass('slp-radio-group', 'slp-input-wrapper', 'mine');
    expect(monthly).toHaveAccessibleName('Monthly');
    expect(monthly.getAttribute('name')).toBeTruthy();
    expect(yearly.getAttribute('name')).toBe(monthly.getAttribute('name'));
    expect(monthly.closest('.slp-radio')).toHaveAttribute('data-size', 'md');
  });

  test('uncontrolled: choosing a radio checks it, unchecks the others and calls onChange', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Radio.Group label="Plan" defaultValue="monthly" onChange={onChange}>
        <Radio value="monthly" label="Monthly" />
        <Radio value="yearly" label="Yearly" />
      </Radio.Group>
    ));

    expect(getByRole('radio', { name: 'Monthly' })).toBeChecked();
    click(getByRole('radio', { name: 'Yearly' }));
    expect(getByRole('radio', { name: 'Yearly' })).toBeChecked();
    expect(getByRole('radio', { name: 'Monthly' })).not.toBeChecked();
    expect(getByRole('radio', { name: 'Yearly' }).closest('.slp-radio')).toHaveAttribute('data-checked', '');
    expect(onChange).toHaveBeenCalledWith('yearly');
  });

  test('controlled: a choice the parent ignores is undone on every radio', () => {
    const [value, setValue] = createSignal<string | undefined>('monthly');
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Radio.Group label="Plan" value={value()} onChange={onChange}>
        <Radio value="monthly" label="Monthly" />
        <Radio value="yearly" label="Yearly" />
      </Radio.Group>
    ));

    click(getByRole('radio', { name: 'Yearly' }));
    expect(onChange).toHaveBeenCalledWith('yearly');
    expect(getByRole('radio', { name: 'Monthly' })).toBeChecked();
    expect(getByRole('radio', { name: 'Yearly' })).not.toBeChecked();

    setValue('yearly');
    flush();
    expect(getByRole('radio', { name: 'Yearly' })).toBeChecked();
    expect(untrack(value)).toBe('yearly');
  });

  test('name, required, disabled, size and an error on the group', () => {
    const { getByRole, getAllByRole } = render(() => (
      <Radio.Group label="Size" name="size" required disabled size="lg" error="Pick a size.">
        <Radio value="s" label="Small" />
        <Radio value="m" label="Medium" />
      </Radio.Group>
    ));
    const group = getByRole('radiogroup');

    for (const radio of getAllByRole('radio')) {
      expect(radio).toHaveAttribute('name', 'size');
      expect(radio).toBeRequired();
      expect(radio).toBeDisabled();
      expect(radio.closest('.slp-radio')).toHaveAttribute('data-size', 'lg');
    }
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAccessibleDescription('Pick a size.');
  });

  test('cards choose like radios', () => {
    const onChange = vi.fn();
    const { getByRole, getByText } = render(() => (
      <Radio.Group label="Delivery" defaultValue="standard" onChange={onChange}>
        <Radio.Card value="standard">Standard</Radio.Card>
        <Radio.Card value="fast">Fast</Radio.Card>
      </Radio.Group>
    ));

    click(getByText('Fast'));

    expect(getByRole('radio', { name: 'Fast' })).toBeChecked();
    expect(getByText('Fast').closest('.slp-radio-card')).toHaveAttribute('data-checked', '');
    expect(onChange).toHaveBeenCalledWith('fast');
  });

  test('choosing updates the radios without diagnostics or waste', async () => {
    const { getByRole } = render(() => (
      <Radio.Group label="Plan" defaultValue="a">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
        <Radio value="c" label="C" />
      </Radio.Group>
    ));
    flush();

    const { artifact } = await captureArtifact(() => click(getByRole('radio', { name: 'C' })), { scenario: 'radio-choose' });

    expect(getByRole('radio', { name: 'C' })).toBeChecked();
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(8);
  });
});

describe('<Radio />', () => {
  test('alone: defaultChecked, and a click chooses it', () => {
    const onChange = vi.fn();
    const { getAllByRole } = render(() => (
      <>
        <Radio label="One" defaultChecked />
        <Radio label="Two" onChange={onChange} />
      </>
    ));
    const [one, two] = getAllByRole('radio');

    expect(one).toBeChecked();
    click(two);
    expect(two).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test('description and error describe it; class and style go to the root, the rest to the input', () => {
    const { getByRole } = render(() => (
      <Radio label="Yearly" description="Two months free." error="Not available." class="mine" data-testid="r" />
    ));
    const radio = getByRole('radio');

    expect(radio).toHaveAccessibleDescription('Two months free. Not available.');
    expect(radio).toHaveAttribute('aria-invalid', 'true');
    expect(radio).toHaveAttribute('data-testid', 'r');
    expect(radio.closest('.slp-radio')).toHaveClass('mine');
  });
});

describe('Radio: accessibility and SSR', () => {
  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Radio.Group label="Plan" description="Change it any time." defaultValue="monthly">
          <Radio value="monthly" label="Monthly" />
          <Radio value="yearly" label="Yearly" description="Two months free." />
          <Radio value="lifetime" label="Lifetime" disabled />
        </Radio.Group>
        <Radio.Group label="Size" error="Pick a size." required>
          <Radio value="s" label="Small" />
        </Radio.Group>
        <Radio.Group label="Delivery" defaultValue="fast">
          <Radio.Card value="standard">Standard</Radio.Card>
          <Radio.Card value="fast">Fast</Radio.Card>
        </Radio.Group>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./radio.fixtures.tsx', 'radios');
  });
});
