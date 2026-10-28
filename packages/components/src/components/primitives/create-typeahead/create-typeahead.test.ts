import { createRoot } from 'solid-js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createTypeahead, type TypeaheadOptions } from './create-typeahead';

const STATES = ['Alabama', 'Alaska', 'Arizona', 'Nebraska', 'Nevada', 'New York', '  North Dakota', 'Ohio'];

function setup(options: Partial<TypeaheadOptions> & { labels?: string[]; start?: number } = {}) {
  const labels = options.labels ?? STATES;
  let current = options.start ?? -1;
  const onMatch = vi.fn((index: number) => (current = index));
  let dispose!: () => void;
  const typeahead = createRoot((d) => {
    dispose = d;
    return createTypeahead({
      count: () => labels.length,
      current: () => current,
      getLabel: (index) => labels[index],
      onMatch,
      ...options,
    });
  });
  const type = (text: string, init: KeyboardEventInit = {}) =>
    [...text].map((key) => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init });
      typeahead.onKeyDown(event);
      return event;
    });
  const label = () => labels[current];
  return { typeahead, type, onMatch, label, dispose };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('createTypeahead', () => {
  test('a character goes to the first item starting with it, ignoring case', () => {
    const { type, label } = setup();

    type('n');

    expect(label()).toBe('Nebraska');
  });

  test('characters typed in quick succession build one search', () => {
    const { type, label, onMatch } = setup();

    type('new');

    expect(label()).toBe('New York');
    // "n" and "ne" stay on Nebraska, so only two moves.
    expect(onMatch).toHaveBeenCalledTimes(2);
  });

  test('a pause starts a new search', () => {
    const { type, label } = setup();

    type('ne');
    vi.advanceTimersByTime(500);
    type('o');

    expect(label()).toBe('Ohio');
  });

  test('timeout sets how long the pause is', () => {
    const { type, label } = setup({ timeout: () => 1000 });

    type('n');
    vi.advanceTimersByTime(600);
    type('o');

    expect(label()).toBe('  North Dakota');
  });

  test('the same character again cycles through the items starting with it, and wraps', () => {
    const { type, label } = setup();

    type('a');
    expect(label()).toBe('Alabama');
    type('a');
    expect(label()).toBe('Alaska');
    type('a');
    expect(label()).toBe('Arizona');
    type('a');
    expect(label()).toBe('Alabama');
  });

  test('a single character searches from after the current item', () => {
    const { type, label } = setup({ start: 4 });

    type('n');

    expect(label()).toBe('New York');
  });

  test('skips disabled items', () => {
    const { type, label } = setup({ isDisabled: (index) => STATES[index] === 'Nebraska' });

    type('n');

    expect(label()).toBe('Nevada');
  });

  test('leading spaces in labels are ignored', () => {
    const { type, label } = setup();

    type('nor');

    expect(label()).toBe('  North Dakota');
  });

  test('space continues a search, but on its own is left alone', () => {
    const labels = ['New Jersey', 'New York', 'Newark'];
    const { type, label } = setup({ labels });

    const [space] = type(' ');
    expect(space.defaultPrevented).toBe(false);

    type('new y');
    expect(label()).toBe('New York');
  });

  test('no match: stays put, and the key is still prevented', () => {
    const { type, onMatch } = setup({ start: 0 });

    const [z] = type('z');

    expect(onMatch).not.toHaveBeenCalled();
    expect(z.defaultPrevented).toBe(true);
  });

  test('ignores named keys, keys with Alt, Ctrl or Meta, composition and events already prevented', () => {
    const { typeahead, type, onMatch } = setup();

    const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    typeahead.onKeyDown(enter);
    type('n', { ctrlKey: true });
    type('n', { altKey: true });
    type('n', { metaKey: true });
    type('n', { isComposing: true });
    const prevented = new KeyboardEvent('keydown', { key: 'n', cancelable: true });
    prevented.preventDefault();
    typeahead.onKeyDown(prevented);

    expect(enter.defaultPrevented).toBe(false);
    expect(onMatch).not.toHaveBeenCalled();
  });

  test('Shift is fine: capitals match too', () => {
    const { type, label } = setup();

    type('O', { shiftKey: true });

    expect(label()).toBe('Ohio');
  });

  test('an emoji is one character', () => {
    const { typeahead, label } = setup({ labels: ['🍎 Apple', '🍌 Banana'] });

    typeahead.onKeyDown(new KeyboardEvent('keydown', { key: '🍌', cancelable: true }));

    expect(label()).toBe('🍌 Banana');
  });

  test('reset, and disposing, forget what was typed', () => {
    const { typeahead, type, label, dispose } = setup();

    type('ne');
    typeahead.reset();
    type('o');
    expect(label()).toBe('Ohio');

    type('h');
    dispose();
    type('a');
    expect(label()).toBe('Alabama');
  });

  test('an empty list does nothing', () => {
    const { type, onMatch } = setup({ labels: [] });

    const [a] = type('a');

    expect(onMatch).not.toHaveBeenCalled();
    expect(a.defaultPrevented).toBe(false);
  });
});
