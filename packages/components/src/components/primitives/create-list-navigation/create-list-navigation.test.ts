import { describe, expect, test, vi } from 'vitest';
import { createListNavigation, findEnabledIndex, type ListNavigationOrientation } from './create-list-navigation';

const none = () => false;

describe('findEnabledIndex', () => {
  test('steps forward and back', () => {
    expect(findEnabledIndex(1, 1, 4, none, true)).toBe(2);
    expect(findEnabledIndex(1, -1, 4, none, true)).toBe(0);
  });

  test('skips disabled items', () => {
    const disabled = (index: number) => index === 1 || index === 2;
    expect(findEnabledIndex(0, 1, 4, disabled, true)).toBe(3);
    expect(findEnabledIndex(3, -1, 4, disabled, true)).toBe(0);
  });

  test('wraps with loop, stops at the ends without', () => {
    expect(findEnabledIndex(3, 1, 4, none, true)).toBe(0);
    expect(findEnabledIndex(0, -1, 4, none, true)).toBe(3);
    expect(findEnabledIndex(3, 1, 4, none, false)).toBe(-1);
    expect(findEnabledIndex(0, -1, 4, none, false)).toBe(-1);
  });

  test('from no current item, starts at the first going forward and the last going back', () => {
    expect(findEnabledIndex(-1, 1, 4, none, false)).toBe(0);
    expect(findEnabledIndex(-1, -1, 4, none, false)).toBe(3);
    expect(findEnabledIndex(-1, 1, 4, (index) => index === 0, false)).toBe(1);
  });

  test('-1 when every other item is disabled, or there are none', () => {
    expect(findEnabledIndex(1, 1, 3, (index) => index !== 1, true)).toBe(-1);
    expect(findEnabledIndex(-1, 1, 3, () => true, true)).toBe(-1);
    expect(findEnabledIndex(-1, 1, 0, none, true)).toBe(-1);
  });
});

function setup(orientation: ListNavigationOrientation, current: number, options: { loop?: boolean; disabled?: number[] } = {}) {
  const onMove = vi.fn();
  const { onKeyDown } = createListNavigation({
    orientation: () => orientation,
    count: () => 4,
    current: () => current,
    isDisabled: (index) => options.disabled?.includes(index) ?? false,
    loop: () => options.loop ?? true,
    onMove,
  });
  const press = (key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init });
    onKeyDown(event);
    return event;
  };
  return { onMove, press };
}

describe('createListNavigation', () => {
  test('horizontal: Left and Right move; Up and Down are left alone', () => {
    const { onMove, press } = setup('horizontal', 1);

    press('ArrowRight');
    press('ArrowLeft');
    const up = press('ArrowUp');

    expect(onMove.mock.calls.map(([index]) => index)).toEqual([2, 0]);
    expect(up.defaultPrevented).toBe(false);
  });

  test('vertical: Up and Down move; Left and Right are left alone', () => {
    const { onMove, press } = setup('vertical', 1);

    press('ArrowDown');
    press('ArrowUp');
    const right = press('ArrowRight');

    expect(onMove.mock.calls.map(([index]) => index)).toEqual([2, 0]);
    expect(right.defaultPrevented).toBe(false);
  });

  test('both: all four arrows move', () => {
    const { onMove, press } = setup('both', 1);

    for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) press(key);

    expect(onMove.mock.calls.map(([index]) => index)).toEqual([2, 2, 0, 0]);
  });

  test('Home and End go to the first and last enabled items', () => {
    const { onMove, press } = setup('horizontal', 0, { disabled: [3] });

    press('End');
    press('Home');

    // Home lands on the current item, so it doesn't move.
    expect(onMove.mock.calls.map(([index]) => index)).toEqual([2]);
  });

  test('Home and End skip disabled items at the ends', () => {
    const { onMove, press } = setup('horizontal', 1, { disabled: [0, 3] });

    press('End');
    const home = press('Home');

    expect(onMove.mock.calls.map(([index]) => index)).toEqual([2]);
    expect(home.defaultPrevented).toBe(true);
  });

  test('a handled key is prevented even with nowhere to go; onMove gets the event', () => {
    const { onMove, press } = setup('horizontal', 3, { loop: false });

    const right = press('ArrowRight');
    const left = press('ArrowLeft');

    expect(right.defaultPrevented).toBe(true);
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith(2, left);
  });

  test('ignores other keys, keys with Alt, Ctrl or Meta, and events already prevented', () => {
    const { onMove, press } = setup('horizontal', 1);

    const enter = press('Enter');
    press('ArrowRight', { ctrlKey: true });
    press('ArrowRight', { altKey: true });
    press('ArrowRight', { metaKey: true });
    const prevented = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    prevented.preventDefault();
    createListNavigation({ orientation: () => 'horizontal', count: () => 4, current: () => 1, onMove }).onKeyDown(prevented);

    expect(enter.defaultPrevented).toBe(false);
    expect(onMove).not.toHaveBeenCalled();
  });
});
