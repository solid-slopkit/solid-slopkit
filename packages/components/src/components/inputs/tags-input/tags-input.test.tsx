import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { TagsInput, type TagsInputProps } from './tags-input';

function setup(props: Partial<TagsInputProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <TagsInput label="Tags" placeholder="Add a tag" onChange={onChange} {...props} />
    </SlopkitUi>
  ));
  flush();
  const field = () => result.getByRole('combobox', { name: 'Tags' }) as HTMLInputElement;
  const type = (value: string) => {
    fireEvent.input(field(), { target: { value } });
    flush();
  };
  const key = (key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    field().dispatchEvent(event);
    flush();
    return event;
  };
  const pills = () =>
    [...result.container.querySelectorAll('[data-slot="tags-input-pill"] [data-slot="pill-label"]')].map(
      (pill) => pill.textContent,
    );
  const options = () => result.queryAllByRole('option', { hidden: true }).map((option) => option.textContent);
  const active = () => {
    const id = field().getAttribute('aria-activedescendant');
    return id ? document.getElementById(id)?.textContent : undefined;
  };
  return { ...result, field, type, key, pills, options, active, onChange };
}

describe('<TagsInput />', () => {
  test('a labelled text field in a pills box, with the placeholder while empty', () => {
    const { field, container } = setup({ class: 'mine' });

    expect(container.querySelector('.slp-tags-input')).toHaveClass('mine');
    expect(container.querySelector('[data-slot="pills-input-box"]')).toContainElement(field());
    expect(field()).toHaveAttribute('placeholder', 'Add a tag');
    expect(field()).not.toHaveAttribute('aria-autocomplete');
  });

  test('Enter adds what was typed, trimmed, and keeps a form from submitting', () => {
    const { type, key, pills, field, onChange } = setup();

    type('  design ');
    const event = key('Enter');
    expect(event.defaultPrevented).toBe(true);
    expect(pills()).toEqual(['design']);
    expect(onChange).toHaveBeenLastCalledWith(['design']);
    expect(field()).toHaveValue('');
    expect(field()).not.toHaveAttribute('placeholder');

    expect(key('Enter').defaultPrevented).toBe(false);
    type('   ');
    key('Enter');
    expect(pills()).toEqual(['design']);
  });

  test('a comma adds what is before it; a pasted list adds every part', () => {
    const { type, pills, field } = setup({ defaultValue: ['a'] });

    type('b,');
    expect(pills()).toEqual(['a', 'b']);
    expect(field()).toHaveValue('');

    type('c, d,,e');
    expect(pills()).toEqual(['a', 'b', 'c', 'd']);
    expect(field()).toHaveValue('e');
  });

  test('splitChars changes what separates tags', () => {
    const { type, pills } = setup({ splitChars: [' ', ';'] });

    type('one two;three');
    expect(pills()).toEqual(['one', 'two']);
  });

  test('a duplicate is not added and stays in the field; onDuplicate is told', () => {
    const onDuplicate = vi.fn();
    const { type, key, pills, field } = setup({ defaultValue: ['design'], onDuplicate });

    type('design');
    key('Enter');
    expect(onDuplicate).toHaveBeenCalledWith('design');
    expect(pills()).toEqual(['design']);
    expect(field()).toHaveValue('design');
  });

  test('allowDuplicates adds it again', () => {
    const { type, key, pills } = setup({ defaultValue: ['design'], allowDuplicates: true });

    type('design');
    key('Enter');
    expect(pills()).toEqual(['design', 'design']);
  });

  test('maxTags: nothing more is added once reached', () => {
    const { type, key, pills, field } = setup({ defaultValue: ['a'], maxTags: 2 });

    type('b');
    key('Enter');
    type('c');
    key('Enter');
    expect(pills()).toEqual(['a', 'b']);
    expect(field()).toHaveValue('c');
  });

  test('Backspace in the empty field removes the last tag', () => {
    const { type, key, pills } = setup({ defaultValue: ['a', 'b'] });

    type('x');
    key('Backspace');
    expect(pills()).toEqual(['a', 'b']);
    type('');
    key('Backspace');
    expect(pills()).toEqual(['a']);
  });

  test('blur adds what was typed, unless acceptValueOnBlur is off', () => {
    const { type, field, pills } = setup();
    type('draft');
    fireEvent.blur(field());
    flush();
    expect(pills()).toEqual(['draft']);

    const other = setup({ acceptValueOnBlur: false, label: 'Other' });
    const otherField = other.getByRole('combobox', { name: 'Other' });
    fireEvent.input(otherField, { target: { value: 'draft' } });
    fireEvent.blur(otherField);
    flush();
    expect(other.pills()).toEqual([]);
    expect(otherField).toHaveValue('draft');
  });

  test('the remove button removes that tag, even among duplicates, and focuses the field', () => {
    const { getAllByRole, pills, field } = setup({ defaultValue: ['a', 'b', 'a'], allowDuplicates: true });

    fireEvent.click(getAllByRole('button', { name: 'Remove a' })[1]);
    flush();
    expect(pills()).toEqual(['a', 'b']);
    expect(field()).toHaveFocus();
  });

  test('suggestions: typing shows the matches without the tags already added; Enter keeps the typed text', () => {
    const { type, key, field, options, active, pills } = setup({
      data: ['react', 'redux', 'solid', 'svelte'],
      defaultValue: ['redux'],
    });

    expect(field()).toHaveAttribute('aria-autocomplete', 'list');
    type('re');
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(options()).toEqual(['react']);
    expect(active()).toBeUndefined();
    key('Enter');
    expect(pills()).toEqual(['redux', 're']);
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('suggestions: the arrows move to one and Enter adds it', () => {
    const { type, key, field, active, pills } = setup({ data: ['solid', 'svelte'] });

    type('s');
    key('ArrowDown');
    key('ArrowDown');
    expect(active()).toBe('svelte');
    key('Enter');
    expect(pills()).toEqual(['svelte']);
    expect(field()).toHaveValue('');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('suggestions: none matching closes it; no data means no dropdown', () => {
    const withData = setup({ data: ['solid'] });
    withData.type('s');
    expect(withData.field()).toHaveAttribute('aria-expanded', 'true');
    withData.type('sx');
    expect(withData.field()).toHaveAttribute('aria-expanded', 'false');

    const plain = setup({ label: 'Plain' });
    const field = plain.getByRole('combobox', { name: 'Plain' });
    fireEvent.input(field, { target: { value: 'a' } });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    flush();
    expect(field).toHaveAttribute('aria-expanded', 'false');
  });

  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal<string[]>(['a']);
    const onChange = vi.fn();
    const { getByRole, container } = render(() => (
      <SlopkitUi>
        <TagsInput label="Tags" value={value()} onChange={onChange} />
      </SlopkitUi>
    ));
    flush();
    const field = getByRole('combobox', { name: 'Tags' });
    const pills = () => [...container.querySelectorAll('[data-slot="pill-label"]')].map((pill) => pill.textContent);

    fireEvent.input(field, { target: { value: 'b' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    flush();
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    expect(pills()).toEqual(['a']);

    setValue(['x', 'y']);
    flush();
    expect(pills()).toEqual(['x', 'y']);
  });

  test('clearable: a clear button while there are tags', () => {
    const { getByRole, queryByRole, pills, field, onChange } = setup({ defaultValue: ['a'], clearable: true });

    fireEvent.click(getByRole('button', { name: 'Clear' }));
    flush();
    expect(onChange).toHaveBeenCalledWith([]);
    expect(pills()).toEqual([]);
    expect(field()).toHaveFocus();
    expect(queryByRole('button', { name: 'Clear' })).toBeNull();
  });

  test('name submits each tag through a hidden input; required stays off the text field', () => {
    const { container, field } = setup({ name: 'tags', defaultValue: ['a', 'b'], required: true });
    const hidden = [...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')];

    expect(hidden.map((input) => [input.name, input.value])).toEqual([
      ['tags', 'a'],
      ['tags', 'b'],
    ]);
    expect(field().required).toBe(false);
    expect(field()).toHaveAttribute('aria-required', 'true');
  });

  test('disabled and readOnly: nothing is added or removed', () => {
    const { field, getByRole } = setup({ disabled: true, defaultValue: ['a'] });
    expect(field()).toBeDisabled();
    expect(getByRole('button', { name: 'Remove a' })).toBeDisabled();

    const readOnly = setup({ readOnly: true, label: 'Read only', defaultValue: ['a'] });
    const other = readOnly.getByRole('combobox', { name: 'Read only' });
    expect(other).toHaveAttribute('aria-readonly', 'true');
    expect(readOnly.queryByRole('button', { name: 'Remove a' })).toBeNull();
    fireEvent.input(other, { target: { value: 'b,' } });
    fireEvent.keyDown(other, { key: 'Enter' });
    fireEvent.keyDown(other, { key: 'Backspace' });
    fireEvent.blur(other);
    flush();
    expect(readOnly.pills()).toEqual(['a']);
  });

  test('has no axe violations, plain and with suggestions open', async () => {
    const { container } = setup({ defaultValue: ['a'], clearable: true, description: 'Press Enter to add' });
    expect((await axe.run(container)).violations).toEqual([]);

    const withData = setup({ label: 'Topics', data: [{ group: 'Frameworks', items: ['solid', 'svelte'] }] });
    fireEvent.input(withData.getByRole('combobox', { name: 'Topics' }), { target: { value: 's' } });
    flush();
    expect((await axe.run(withData.container)).violations).toEqual([]);
  });

  test('adding, splitting and removing have no diagnostics', async () => {
    const { type, key } = setup({ data: ['solid', 'svelte'] });

    const { artifact } = await captureArtifact(
      () => {
        type('a');
        key('Enter');
        type('b,c,');
        type('s');
        key('ArrowDown');
        key('Enter');
        key('Backspace');
      },
      { scenario: 'tags-input-add' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./tags-input.fixtures.tsx', 'tagsInputs');
  });
});
