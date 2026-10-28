import { render } from '@solidjs/testing-library';
import { For } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Pill } from '../pill';
import { TextInput } from '../text-input';
import { PillsInput } from './pills-input';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

describe('<PillsInput /> in a browser', () => {
  test.each(sizes)('at %s, with one row of pills, it is as tall as a TextInput, with the pills centered', (size) => {
    const { getByTestId, getByText } = render(() => (
      <>
        <TextInput size={size} label="Plain" data-testid="plain" />
        <PillsInput size={size} label="Tags" data-testid="box">
          <Pill withRemoveButton>Design</Pill>
          <PillsInput.Field />
        </PillsInput>
      </>
    ));
    const box = getByTestId('box').getBoundingClientRect();
    const plain = getByTestId('plain').parentElement!.getBoundingClientRect();
    const pill = getByText('Design').parentElement!.getBoundingClientRect();

    expect(box.height).toBeCloseTo(plain.height, 0);
    expect(pill.top - box.top).toBeCloseTo(box.bottom - pill.bottom, 0);
  });

  test('pills wrap onto more rows, and the box grows; the sections stay on the first row', () => {
    const { getByTestId, getByText } = render(() => (
      <div style={{ width: '220px' }}>
        <PillsInput label="Tags" data-testid="box" leftSection={<span>#</span>}>
          <For each={['Design', 'Research', 'Writing', 'Testing', 'Planning']}>{(tag) => <Pill>{tag}</Pill>}</For>
          <PillsInput.Field placeholder="More" />
        </PillsInput>
      </div>
    ));
    const box = getByTestId('box').getBoundingClientRect();
    const section = getByText('#').getBoundingClientRect();

    expect(box.height).toBeGreaterThan(60);
    expect(section.top - box.top).toBeLessThan(20);
  });

  test('a click on the box focuses the field, and the box shows the focus ring', async () => {
    const { getByTestId, getByRole } = render(() => (
      <PillsInput label="Tags" data-testid="box" style={{ width: '300px' }}>
        <Pill>Design</Pill>
        <PillsInput.Field />
      </PillsInput>
    ));

    await userEvent.click(getByTestId('box'), { position: { x: 290, y: 10 } });
    expect(getByRole('textbox')).toHaveFocus();
    expect(getComputedStyle(getByTestId('box')).boxShadow).not.toBe('none');
  });

  test('a click on the label focuses the field; Tab goes through the remove buttons to the field', async () => {
    const { getByText, getByRole } = render(() => (
      <>
        <button type="button">Before</button>
        <PillsInput label="Tags">
          <Pill withRemoveButton>Design</Pill>
          <PillsInput.Field />
        </PillsInput>
      </>
    ));

    await userEvent.click(getByText('Tags'));
    expect(getByRole('textbox')).toHaveFocus();
    getByRole('button', { name: 'Before' }).focus();
    await userEvent.tab();
    expect(getByRole('button', { name: 'Remove Design' })).toHaveFocus();
    await userEvent.tab();
    expect(getByRole('textbox')).toHaveFocus();
  });
});
