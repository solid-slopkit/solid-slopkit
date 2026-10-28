import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { FileInput } from './file-input';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<FileInput /> in a browser', () => {
  test('files chosen in the picker show, and stay in the hidden input for a form', async () => {
    const { getByRole, container } = render(() => (
      <form>
        <FileInput label="Photos" multiple name="photos" />
      </form>
    ));
    const input = container.querySelector<HTMLInputElement>('[data-slot="file-input-input"]')!;

    await userEvent.upload(input, [
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.png', { type: 'image/png' }),
    ]);

    expect(getByRole('button', { name: 'Photos' })).toHaveTextContent('a.png, b.png');
    expect(new FormData(container.querySelector('form')!).getAll('photos').map((file) => (file as File).name)).toEqual([
      'a.png',
      'b.png',
    ]);
  });

  test('clearing empties the hidden input too', async () => {
    const { getByRole, container } = render(() => (
      <form>
        <FileInput label="Resume" name="resume" clearable />
      </form>
    ));
    const input = container.querySelector<HTMLInputElement>('[data-slot="file-input-input"]')!;

    await userEvent.upload(input, new File(['a'], 'cv.pdf'));
    await userEvent.click(getByRole('button', { name: 'Clear' }));

    expect(input.files).toHaveLength(0);
  });

  test('Tab reaches the button; Enter opens the picker', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const { getByRole } = render(() => <FileInput label="Resume" />);

    await userEvent.tab();
    expect(getByRole('button', { name: 'Resume' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(click).toHaveBeenCalledTimes(1);
  });

  test('long names are cut with an ellipsis inside the box', () => {
    const name = `${'very-long-name-'.repeat(10)}.pdf`;
    const { getByRole } = render(() => (
      <FileInput label="Resume" defaultValue={new File(['a'], name)} style={{ width: '200px' }} />
    ));
    const button = getByRole('button');
    const value = button.querySelector('[data-slot="file-input-value"]')!;

    expect(getComputedStyle(value).textOverflow).toBe('ellipsis');
    expect(value.getBoundingClientRect().right).toBeLessThanOrEqual(button.closest('.slp-input')!.getBoundingClientRect().right);
  });
});
