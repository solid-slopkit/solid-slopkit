import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { afterEach, describe, expect, expectTypeOf, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { FileInput } from './file-input';

const fileInputOf = (container: HTMLElement) => container.querySelector<HTMLInputElement>('[data-slot="file-input-input"]')!;

// jsdom can't build a FileList or a DataTransfer: the chosen files are set on the input directly.
function choose(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { value: files, configurable: true, writable: true });
  fireEvent.change(input);
  flush();
}

const resume = new File(['a'], 'resume.pdf', { type: 'application/pdf' });
const photo = new File(['b'], 'photo.jpg', { type: 'image/jpeg' });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<FileInput />', () => {
  test('a button in an Input box, named by the label, with a placeholder and a hidden file input', () => {
    const { getByRole, container } = render(() => <FileInput label="Resume" accept=".pdf" class="mine" />);
    const button = getByRole('button', { name: 'Resume' });

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-slot', 'input-control');
    expect(button).toHaveTextContent('Choose a file');
    expect(button).toHaveAttribute('data-empty', '');
    expect(fileInputOf(container)).toHaveAttribute('accept', '.pdf');
    expect(fileInputOf(container)).toHaveAttribute('hidden');
    expect(container.firstElementChild).toHaveClass('slp-file-input', 'slp-input-wrapper', 'mine');
  });

  test('a click opens the picker; the chosen file shows and describes the button', () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const onChange = vi.fn();
    const { getByRole, container } = render(() => <FileInput label="Resume" description="PDF only." onChange={onChange} />);
    const button = getByRole('button', { name: 'Resume' });

    fireEvent.click(button);
    expect(click).toHaveBeenCalledTimes(1);

    choose(fileInputOf(container), [resume]);
    expect(onChange).toHaveBeenCalledWith(resume);
    expect(button).toHaveTextContent('resume.pdf');
    expect(button).not.toHaveAttribute('data-empty');
    expect(button).toHaveAccessibleDescription('resume.pdf PDF only.');
  });

  test('multiple: an array, names joined; placeholder in the plural', () => {
    const onChange = vi.fn();
    const { getByRole, container } = render(() => <FileInput label="Photos" multiple onChange={onChange} />);
    const button = getByRole('button');

    expect(button).toHaveTextContent('Choose files');
    expect(fileInputOf(container)).toHaveAttribute('multiple');
    choose(fileInputOf(container), [resume, photo]);
    expect(onChange).toHaveBeenCalledWith([resume, photo]);
    expect(button).toHaveTextContent('resume.pdf, photo.jpg');
  });

  test('an empty choice (a cancel) changes nothing', () => {
    const onChange = vi.fn();
    const { container } = render(() => <FileInput label="Resume" defaultValue={resume} onChange={onChange} />);

    choose(fileInputOf(container), []);

    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector('[data-slot="file-input-value"]')).toHaveTextContent('resume.pdf');
  });

  test('clearable: a clear button while there are files, which empties the field', () => {
    const onChange = vi.fn();
    const { getByRole, queryByRole } = render(() => (
      <FileInput label="Resume" clearable defaultValue={resume} onChange={onChange} />
    ));

    fireEvent.click(getByRole('button', { name: 'Clear' }));
    flush();

    expect(onChange).toHaveBeenCalledWith(null);
    expect(getByRole('button', { name: 'Resume' })).toHaveTextContent('Choose a file');
    expect(queryByRole('button', { name: 'Clear' })).toBeNull();
  });

  test('controlled: it shows value; valueFormat and placeholder change the text', () => {
    const [value, setValue] = createSignal<File[]>([]);
    const { getByRole } = render(() => (
      <FileInput
        label="Photos"
        multiple
        value={value()}
        onChange={setValue}
        placeholder="No photos yet"
        valueFormat={(files) => `${files.length} photos`}
      />
    ));

    expect(getByRole('button')).toHaveTextContent('No photos yet');
    setValue([resume, photo]);
    flush();
    expect(getByRole('button')).toHaveTextContent('2 photos');
    expect(untrack(value)).toHaveLength(2);
  });

  test('onChange is typed by multiple', () => {
    render(() => (
      <>
        <FileInput label="One" onChange={(file) => expectTypeOf(file).toEqualTypeOf<File | null>()} />
        <FileInput label="Many" multiple onChange={(files) => expectTypeOf(files).toEqualTypeOf<File[]>()} />
      </>
    ));
  });

  test('disabled disables the button and the file input', () => {
    const { getByRole, container } = render(() => <FileInput label="Resume" disabled />);

    expect(getByRole('button')).toBeDisabled();
    expect(fileInputOf(container)).toBeDisabled();
  });

  test('choosing a file updates it without diagnostics or waste', async () => {
    const { container } = render(() => <FileInput label="Resume" />);
    flush();

    const { artifact } = await captureArtifact(() => choose(fileInputOf(container), [resume]), { scenario: 'file-input-choose' });

    expect(container.querySelector('[data-slot="file-input-value"]')).toHaveTextContent('resume.pdf');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(8);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <FileInput label="Resume" description="PDF, up to 5 MB." />
        <FileInput label="Photos" multiple clearable defaultValue={[photo]} />
        <FileInput label="Locked" disabled error="Uploads are paused." />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./file-input.fixtures.tsx', 'fileInputs');
  });
});
