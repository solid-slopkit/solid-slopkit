import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Input } from '../input';
import { InputWrapper } from '../input-wrapper';
import { Fieldset, type FieldsetVariant } from './fieldset';

describe('<Fieldset />', () => {
  test('a fieldset named by its legend, outline by default', () => {
    const { getByRole } = render(() => (
      <Fieldset legend="Shipping address" class="mine" id="f">
        <Input aria-label="Street" />
      </Fieldset>
    ));
    const group = getByRole('group', { name: 'Shipping address' });
    const legend = group.firstElementChild!;

    expect(group.tagName).toBe('FIELDSET');
    expect(group).toHaveClass('slp-fieldset', 'mine');
    expect(group).toHaveAttribute('id', 'f');
    expect(group).toHaveAttribute('data-variant', 'outline');
    expect(legend.tagName).toBe('LEGEND');
    expect(legend).toHaveAttribute('data-slot', 'fieldset-legend');
  });

  test('without a legend there is no legend element', () => {
    const { getByRole } = render(() => (
      <Fieldset aria-label="Group">
        <Input aria-label="Street" />
      </Fieldset>
    ));

    expect(getByRole('group').querySelector('legend')).toBeNull();
  });

  test('disabled disables every control inside, natively, and marks the root', () => {
    const { getByRole, getAllByRole } = render(() => (
      <Fieldset legend="Locked" disabled>
        <InputWrapper label="One">
          <Input />
        </InputWrapper>
        <Input aria-label="Two" />
      </Fieldset>
    ));

    expect(getByRole('group')).toHaveAttribute('data-disabled', '');
    for (const control of getAllByRole('textbox')) expect(control).toBeDisabled();
  });

  test('toggling disabled updates the fieldset without diagnostics or waste', async () => {
    const [disabled, setDisabled] = createSignal(false, { name: 'disabled' });
    const { getByRole } = render(() => (
      <Fieldset legend="Address" disabled={disabled()}>
        <Input aria-label="Street" />
      </Fieldset>
    ));
    flush();

    const { artifact } = await captureArtifact(() => setDisabled(true), { scenario: 'fieldset-disabled' });

    expect(getByRole('textbox')).toBeDisabled();
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const variants: FieldsetVariant[] = ['outline', 'soft', 'ghost'];
    const { container } = render(() => (
      <For each={variants}>
        {(variant) => (
          <Fieldset legend={`Address (${variant})`} variant={variant} disabled={variant === 'soft'}>
            <InputWrapper label={`Street (${variant})`}>
              <Input />
            </InputWrapper>
          </Fieldset>
        )}
      </For>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./fieldset.fixtures.tsx', 'fieldsets');
  });
});
