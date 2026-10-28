import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { FileButton } from './file-button';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<FileButton /> in a browser', () => {
  test('only the button is a tab stop; Enter and Space open the picker', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const { getByRole } = render(() => (
      <>
        <FileButton onChange={() => {}}>Upload</FileButton>
        <button type="button">After</button>
      </>
    ));

    await userEvent.tab();
    expect(getByRole('button', { name: 'Upload' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(click).toHaveBeenCalledTimes(2);

    await userEvent.tab();
    expect(getByRole('button', { name: 'After' })).toHaveFocus();
  });

  test('files chosen in the picker reach onChange', async () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <FileButton multiple onChange={onChange}>
        Upload
      </FileButton>
    ));
    const input = container.querySelector<HTMLInputElement>('[data-slot="file-button-input"]')!;

    await userEvent.upload(input, [new File(['a'], 'a.txt', { type: 'text/plain' }), new File(['b'], 'b.txt')]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].map((file: File) => file.name)).toEqual(['a.txt', 'b.txt']);
  });

  test('the hidden input takes no space: in a Group, the gap is only between visible buttons', () => {
    const { getByRole } = render(() => (
      <div style={{ display: 'flex', gap: '10px' }}>
        <FileButton onChange={() => {}}>Upload</FileButton>
        <button type="button">Next</button>
      </div>
    ));

    expect(getByRole('button', { name: 'Next' }).getBoundingClientRect().left).toBe(
      getByRole('button', { name: 'Upload' }).getBoundingClientRect().right + 10,
    );
  });
});
