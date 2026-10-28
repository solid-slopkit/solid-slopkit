import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { afterEach, describe, expect, expectTypeOf, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { FileButton } from './file-button';

const inputOf = (container: HTMLElement) => container.querySelector<HTMLInputElement>('[data-slot="file-button-input"]')!;

// jsdom can't build a FileList, so the chosen files are set on the input directly.
function choose(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  fireEvent.change(input);
}

const photo = new File(['a'], 'photo.png', { type: 'image/png' });
const scan = new File(['b'], 'scan.pdf', { type: 'application/pdf' });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<FileButton />', () => {
  test('a Button with its label, and a hidden file input next to it', () => {
    const { getByRole, container } = render(() => <FileButton onChange={() => {}}>Upload</FileButton>);
    const button = getByRole('button', { name: 'Upload' });
    const input = inputOf(container);

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('slp-file-button', 'slp-button');
    expect(button.nextElementSibling).toBe(input);
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('hidden');
    expect(input).toHaveAttribute('tabindex', '-1');
    expect(input).not.toHaveAttribute('multiple');
  });

  test('accept, multiple and capture go to the input; Button props and others to the button', () => {
    const { getByRole, container } = render(() => (
      <FileButton
        multiple
        accept="image/*,.pdf"
        capture="environment"
        variant="outline"
        color="primary"
        size="sm"
        id="f"
        class="mine"
        onChange={() => {}}
      >
        Add files
      </FileButton>
    ));
    const button = getByRole('button');
    const input = inputOf(container);

    expect(input).toHaveAttribute('accept', 'image/*,.pdf');
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('capture', 'environment');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-color', 'primary');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('id', 'f');
    expect(button).toHaveClass('slp-file-button', 'mine');
    expect(button).not.toHaveAttribute('accept');
  });

  test('a click opens the picker; onClick runs first and can prevent it; disabled opens nothing', () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const { getByRole } = render(() => (
      <>
        <FileButton onChange={() => {}}>Open</FileButton>
        <FileButton onChange={() => {}} onClick={(event) => event.preventDefault()}>
          Prevented
        </FileButton>
        <FileButton onChange={() => {}} disabled>
          Disabled
        </FileButton>
      </>
    ));

    fireEvent.click(getByRole('button', { name: 'Open' }));
    expect(click).toHaveBeenCalledTimes(1);

    fireEvent.click(getByRole('button', { name: 'Prevented' }));
    fireEvent.click(getByRole('button', { name: 'Disabled' }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  test('onChange gets the chosen file; the input is cleared so the same file can be chosen again', () => {
    const onChange = vi.fn();
    const { container } = render(() => <FileButton onChange={onChange}>Upload</FileButton>);
    const input = inputOf(container);

    choose(input, [photo]);
    choose(input, [photo]);

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(photo);
    expect(input.value).toBe('');
  });

  test('with multiple, onChange gets an array; an empty choice calls nothing', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <FileButton multiple onChange={onChange}>
        Upload
      </FileButton>
    ));

    choose(inputOf(container), [photo, scan]);
    choose(inputOf(container), []);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([photo, scan]);
  });

  test('onChange is typed by multiple', () => {
    render(() => (
      <>
        <FileButton onChange={(file) => expectTypeOf(file).toEqualTypeOf<File>()}>One</FileButton>
        <FileButton multiple onChange={(files) => expectTypeOf(files).toEqualTypeOf<File[]>()}>
          Many
        </FileButton>
      </>
    ));
  });

  test('toggling loading updates the button without diagnostics or waste', async () => {
    const [loading, setLoading] = createSignal(false, { name: 'loading' });
    const { getByRole } = render(() => (
      <FileButton loading={loading()} onChange={() => {}}>
        Upload
      </FileButton>
    ));
    flush();
    const button = getByRole('button');

    const { artifact } = await captureArtifact(() => setLoading(true), { scenario: 'file-button-loading' });

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <FileButton onChange={() => {}}>Upload</FileButton>
        <FileButton multiple accept="image/*" variant="outline" color="primary" onChange={() => {}}>
          Add photos
        </FileButton>
        <FileButton shape="square" aria-label="Attach a file" onChange={() => {}}>
          +
        </FileButton>
        <FileButton disabled onChange={() => {}}>
          Locked
        </FileButton>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./file-button.fixtures.tsx', 'fileButtons');
  });
});
