import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Dropzone } from './dropzone';

const png = new File(['a'], 'cat.png', { type: 'image/png' });
const jpg = new File(['bb'], 'dog.jpg', { type: 'image/jpeg' });
const pdf = new File(['ccc'], 'cv.pdf', { type: 'application/pdf' });

// jsdom has no DataTransfer: a drag carries a stand-in with what a browser exposes, the types before the drop and
// the files on it.
const transfer = (files: File[]) => ({
  types: ['Files'],
  items: files.map((file) => ({ kind: 'file', type: file.type })),
  files,
  dropEffect: 'none',
});

function dragIn(zone: HTMLElement, files: File[]) {
  fireEvent.dragEnter(zone, { dataTransfer: transfer(files) });
  fireEvent.dragOver(zone, { dataTransfer: transfer(files) });
  flush();
}

function drop(zone: HTMLElement, files: File[]) {
  fireEvent.drop(zone, { dataTransfer: transfer(files) });
  flush();
}

function choose(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { value: files, configurable: true, writable: true });
  fireEvent.change(input);
  flush();
}

const inputOf = (container: HTMLElement) => container.querySelector<HTMLInputElement>('[data-slot="dropzone-input"]')!;

const zone = (onDrop = vi.fn(), onReject = vi.fn()) => (
  <Dropzone onDrop={onDrop} onReject={onReject} accept="image/*" class="mine">
    <Dropzone.Idle>Drop images</Dropzone.Idle>
    <Dropzone.Accept>Release to upload</Dropzone.Accept>
    <Dropzone.Reject>Images only</Dropzone.Reject>
  </Dropzone>
);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<Dropzone />', () => {
  test('a button named by its content, with a hidden file input', () => {
    const { getByRole, container } = render(() => zone());
    const root = getByRole('button', { name: 'Drop images' });

    expect(root).toHaveClass('slp-dropzone', 'mine');
    expect(root).toHaveAttribute('tabindex', '0');
    expect(root).toHaveAttribute('data-color', 'primary');
    expect(inputOf(container)).toHaveAttribute('accept', 'image/*');
    expect(inputOf(container)).toHaveAttribute('multiple');
    expect(inputOf(container)).toHaveAttribute('hidden');
  });

  test('click, Enter and Space open the picker', () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const { getByRole } = render(() => zone());
    const root = getByRole('button');

    fireEvent.click(root);
    fireEvent.keyDown(root, { key: 'Enter' });
    fireEvent.keyDown(root, { key: ' ' });
    fireEvent.keyDown(root, { key: 'a' });

    expect(click).toHaveBeenCalledTimes(3);
  });

  test('dragging files it takes shows Accept; leaving shows Idle again', () => {
    const { getByRole } = render(() => zone());
    const root = getByRole('button');

    dragIn(root, [png, jpg]);
    expect(root).toHaveAttribute('data-accept', '');
    expect(root).toHaveTextContent('Release to upload');

    // Crossing a child fires another enter, then a leave: still over the zone.
    fireEvent.dragEnter(root.firstChild!, { dataTransfer: transfer([png]) });
    fireEvent.dragLeave(root, { dataTransfer: transfer([png]) });
    flush();
    expect(root).toHaveAttribute('data-accept', '');

    fireEvent.dragLeave(root, { dataTransfer: transfer([png]) });
    flush();
    expect(root).not.toHaveAttribute('data-accept');
    expect(root).toHaveTextContent('Drop images');
  });

  test('dragging a type it does not take shows Reject', () => {
    const { getByRole } = render(() => zone());
    const root = getByRole('button');

    dragIn(root, [png, pdf]);

    expect(root).toHaveAttribute('data-reject', '');
    expect(root).toHaveTextContent('Images only');
  });

  test('an extension in accept: any type might pass before the drop', () => {
    const { getByRole } = render(() => (
      <Dropzone onDrop={() => {}} accept=".pdf">
        PDF
      </Dropzone>
    ));
    const root = getByRole('button');

    dragIn(root, [png]);

    expect(root).toHaveAttribute('data-accept', '');
  });

  test('a drop hands the files that pass to onDrop and the rest to onReject', () => {
    const onDrop = vi.fn();
    const onReject = vi.fn();
    const { getByRole } = render(() => zone(onDrop, onReject));
    const root = getByRole('button');

    dragIn(root, [png, pdf]);
    drop(root, [png, pdf]);

    expect(onDrop).toHaveBeenCalledWith([png]);
    expect(onReject).toHaveBeenCalledWith([{ file: pdf, errors: ['invalid-type'] }]);
    expect(root).not.toHaveAttribute('data-reject');
    expect(root).toHaveTextContent('Drop images');
  });

  test('sizes, count and validator', () => {
    const onDrop = vi.fn();
    const onReject = vi.fn();
    render(() => (
      <Dropzone
        onDrop={onDrop}
        onReject={onReject}
        minSize={2}
        maxSize={2}
        validator={(file) => (file.name.startsWith('cv') ? 'no-resumes' : null)}
      >
        Files
      </Dropzone>
    ));
    const root = document.querySelector<HTMLElement>('.slp-dropzone')!;

    drop(root, [png, jpg, pdf]);

    expect(onDrop).toHaveBeenCalledWith([jpg]);
    expect(onReject).toHaveBeenCalledWith([
      { file: png, errors: ['too-small'] },
      { file: pdf, errors: ['too-large', 'no-resumes'] },
    ]);
  });

  test('more files than it takes: the drop is rejected whole', () => {
    const onDrop = vi.fn();
    const onReject = vi.fn();
    const { getByRole } = render(() => (
      <>
        <Dropzone onDrop={onDrop} onReject={onReject} multiple={false}>
          One
        </Dropzone>
        <Dropzone onDrop={onDrop} onReject={onReject} maxFiles={2}>
          Two
        </Dropzone>
      </>
    ));
    const one = getByRole('button', { name: 'One' });
    const two = getByRole('button', { name: 'Two' });

    dragIn(one, [png, jpg]);
    expect(one).toHaveAttribute('data-reject', '');
    drop(one, [png, jpg]);
    dragIn(two, [png, jpg, pdf]);
    expect(two).toHaveAttribute('data-reject', '');
    drop(two, [png, jpg, pdf]);

    expect(onDrop).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenNthCalledWith(1, [
      { file: png, errors: ['too-many-files'] },
      { file: jpg, errors: ['too-many-files'] },
    ]);
    expect(onReject.mock.calls[1][0]).toHaveLength(3);
    expect(inputOf(one.parentElement!)).not.toHaveAttribute('multiple');
  });

  test('picked files go through the same checks', () => {
    const onDrop = vi.fn();
    const onReject = vi.fn();
    const { container } = render(() => zone(onDrop, onReject));

    choose(inputOf(container), [jpg, pdf]);

    expect(onDrop).toHaveBeenCalledWith([jpg]);
    expect(onReject).toHaveBeenCalledWith([{ file: pdf, errors: ['invalid-type'] }]);
  });

  test('disabled: not focusable, no picker, no drag state, no files', () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const onDrop = vi.fn();
    const { getByRole, container } = render(() => (
      <Dropzone onDrop={onDrop} disabled>
        Paused
      </Dropzone>
    ));
    const root = getByRole('button');

    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).toHaveAttribute('tabindex', '-1');
    expect(root).toHaveAttribute('data-disabled', '');
    expect(inputOf(container)).toBeDisabled();
    fireEvent.click(root);
    dragIn(root, [png]);
    drop(root, [png]);

    expect(click).not.toHaveBeenCalled();
    expect(root).not.toHaveAttribute('data-accept');
    expect(onDrop).not.toHaveBeenCalled();
  });

  test('loading: busy, covered by a labelled loader, takes no files', () => {
    const onDrop = vi.fn();
    const { getByRole, container } = render(() => (
      <Dropzone onDrop={onDrop} loading loadingLabel="Uploading">
        Files
      </Dropzone>
    ));
    const root = container.querySelector('.slp-dropzone')!;

    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('data-loading', '');
    expect(getByRole('status', { name: 'Uploading' }).closest('[data-slot="dropzone-loader"]')).not.toBeNull();
    drop(root as HTMLElement, [png]);
    expect(onDrop).not.toHaveBeenCalled();
  });

  test('openOnClick={false}: a plain area; openRef opens the picker from your own button', () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    let open: (() => void) | undefined;
    const { getByRole, container } = render(() => (
      <Dropzone onDrop={() => {}} openOnClick={false} openRef={(fn) => (open = fn)}>
        Drop here, or <button onClick={() => open?.()}>browse</button>
      </Dropzone>
    ));
    const root = container.querySelector('.slp-dropzone')!;

    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('tabindex');
    fireEvent.click(root);
    expect(click).not.toHaveBeenCalled();
    fireEvent.click(getByRole('button', { name: 'browse' }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  test('drags without files are left alone', () => {
    const { getByRole } = render(() => zone());
    const root = getByRole('button');

    const event = fireEvent.dragOver(root, { dataTransfer: { types: ['text/plain'], items: [], files: [] } });
    fireEvent.dragEnter(root, { dataTransfer: { types: ['text/plain'], items: [], files: [] } });
    flush();

    expect(event).toBe(true);
    expect(root).not.toHaveAttribute('data-accept');
  });

  test('the status parts throw outside a Dropzone', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(() => <Dropzone.Accept>x</Dropzone.Accept>)).toThrow(
      '<Dropzone.Accept> must be rendered inside <Dropzone>.',
    );
  });

  test('disabled follows the prop', () => {
    const [disabled, setDisabled] = createSignal(false);
    const { getByRole } = render(() => (
      <Dropzone onDrop={() => {}} disabled={disabled()}>
        Files
      </Dropzone>
    ));

    setDisabled(true);
    flush();
    expect(getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  test('a drag over it updates the state without diagnostics or waste', async () => {
    const { getByRole } = render(() => zone());
    const root = getByRole('button');
    flush();

    const { artifact } = await captureArtifact(() => dragIn(root, [png]), { scenario: 'dropzone-drag' });

    expect(root).toHaveTextContent('Release to upload');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(10);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        {zone()}
        <Dropzone onDrop={() => {}} disabled>
          Paused
        </Dropzone>
        <Dropzone onDrop={() => {}} loading>
          Uploading
        </Dropzone>
        <Dropzone onDrop={() => {}} openOnClick={false}>
          Drop here, or <button>browse</button>
        </Dropzone>
      </>
    ));
    dragIn(container.querySelector('.slp-dropzone')!, [pdf]);

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./dropzone.fixtures.tsx', 'dropzones');
  });
});
